import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NormaRegulPage } from './norma-regul.page';

describe('NormaRegulPage', () => {
  let component: NormaRegulPage;
  let fixture: ComponentFixture<NormaRegulPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NormaRegulPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
