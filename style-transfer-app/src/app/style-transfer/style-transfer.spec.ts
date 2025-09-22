import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StyleTransferComponent } from './style-transfer';

describe('StyleTransferComponent', () => {
  let component: StyleTransferComponent;
  let fixture: ComponentFixture<StyleTransferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StyleTransferComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StyleTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
