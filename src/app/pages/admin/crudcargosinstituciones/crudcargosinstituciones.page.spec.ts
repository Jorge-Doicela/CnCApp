import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrudcargosinstitucionesPage } from './crudcargosinstituciones.page';

describe('CrudcargosinstitucionesPage', () => {
  let component: CrudcargosinstitucionesPage;
  let fixture: ComponentFixture<CrudcargosinstitucionesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudcargosinstitucionesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
