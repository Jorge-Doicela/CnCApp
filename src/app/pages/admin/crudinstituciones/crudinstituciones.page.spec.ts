import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrudinstitucionesPage } from './crudinstituciones.page';

describe('CrudinstitucionesPage', () => {
  let component: CrudinstitucionesPage;
  let fixture: ComponentFixture<CrudinstitucionesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudinstitucionesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
