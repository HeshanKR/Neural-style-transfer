import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-style-transfer',
  imports: [CommonModule],
  templateUrl: './style-transfer.html',
  styleUrls: ['./style-transfer.css']
})
export class StyleTransferComponent implements OnInit {
  model: any = null;
  loadingModel = true;
  processing = false;

  contentImgEl: HTMLImageElement | null = null;
  styleImgEl: HTMLImageElement | null = null;

  contentUrl: string | null = null;
  styleUrl: string | null = null;
  resultUrl: string | null = null;

  // 👇 reference to result section
  @ViewChild('resultSection') resultSection!: ElementRef;

  ngOnInit(): void {
    this.loadModel();
  }

  async loadModel() {
    try {
      this.loadingModel = true;
      const mi: any = await import('@magenta/image');
      this.model = new mi.ArbitraryStyleTransferNetwork();
      await this.model.initialize();
      console.log('Magenta ArbitraryStyleTransferNetwork initialized');
    } catch (err) {
      console.error('Failed to load model', err);
      alert('Failed to load model — check console.');
    } finally {
      this.loadingModel = false;
    }
  }

  onContentUpload(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    if (this.contentUrl) URL.revokeObjectURL(this.contentUrl);
    this.contentUrl = URL.createObjectURL(f);
    this.contentImgEl = new Image();
    this.contentImgEl.crossOrigin = 'anonymous';
    this.contentImgEl.src = this.contentUrl;
  }

  onStyleUpload(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    if (this.styleUrl) URL.revokeObjectURL(this.styleUrl);
    this.styleUrl = URL.createObjectURL(f);
    this.styleImgEl = new Image();
    this.styleImgEl.crossOrigin = 'anonymous';
    this.styleImgEl.src = this.styleUrl;
  }

  private waitForImage(img: HTMLImageElement) {
    return new Promise<void>((resolve) => {
      if (img.complete && img.naturalWidth !== 0) resolve();
      else img.onload = () => resolve();
      img.onerror = () => resolve();
    });
  }

  private async makeSizedImage(img: HTMLImageElement, maxDim = 900): Promise<HTMLImageElement> {
    await this.waitForImage(img);
    const w = img.naturalWidth, h = img.naturalHeight;
    const scale = Math.min(1, maxDim / Math.max(w, h));
    if (scale === 1) return img;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const resized = new Image();
    resized.crossOrigin = 'anonymous';
    resized.src = canvas.toDataURL('image/png');
    await this.waitForImage(resized);
    return resized;
  }

  async applyStyle() {
    if (!this.model || !this.contentImgEl || !this.styleImgEl) return;
    this.processing = true;

    try {
      await new Promise(resolve => setTimeout(resolve, 0));

      await Promise.all([
        this.waitForImage(this.contentImgEl),
        this.waitForImage(this.styleImgEl)
      ]);

      const contentForModel = await this.makeSizedImage(this.contentImgEl, 900);

      const imageData: ImageData = await this.model.stylize(contentForModel, this.styleImgEl);

      const outCanvas = document.createElement('canvas');
      outCanvas.width = imageData.width;
      outCanvas.height = imageData.height;
      outCanvas.getContext('2d')!.putImageData(imageData, 0, 0);
      this.resultUrl = outCanvas.toDataURL('image/png');

      // 👇 focus the result container after rendering
      setTimeout(() => {
        if (this.resultSection) {
          this.resultSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    } catch (err) {
      console.error(err);
      alert('Stylization failed — see console for details.');
    } finally {
      this.processing = false;
    }
  }

  downloadResult() {
    if (!this.resultUrl) return;
    const a = document.createElement('a');
    a.href = this.resultUrl;
    a.download = 'stylized.png';
    a.click();
  }
}
