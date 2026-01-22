import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ValidarQrPage } from './validar-qr.page';

describe('ValidarQrPage', () => {
  let component: ValidarQrPage;
  let fixture: ComponentFixture<ValidarQrPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidarQrPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
