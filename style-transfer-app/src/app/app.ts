import { Component, signal } from '@angular/core';
import { StyleTransferComponent } from './style-transfer/style-transfer';

@Component({
  selector: 'app-root',
  imports: [StyleTransferComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('style-transfer-app');
}
