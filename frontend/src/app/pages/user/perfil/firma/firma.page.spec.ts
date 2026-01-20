import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FirmaPage } from './firma.page';

describe('FirmaPage', () => {
  let component: FirmaPage;
  let fixture: ComponentFixture<FirmaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FirmaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
