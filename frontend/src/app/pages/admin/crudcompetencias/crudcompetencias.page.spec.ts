import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrudcompetenciasPage } from './crudcompetencias.page';

describe('CrudcompetenciasPage', () => {
  let component: CrudcompetenciasPage;
  let fixture: ComponentFixture<CrudcompetenciasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudcompetenciasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
