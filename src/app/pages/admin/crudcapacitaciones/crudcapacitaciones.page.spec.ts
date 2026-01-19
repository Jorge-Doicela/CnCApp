import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrudcapacitacionesPage } from './crudcapacitaciones.page';

describe('CrudcapacitacionesPage', () => {
  let component: CrudcapacitacionesPage;
  let fixture: ComponentFixture<CrudcapacitacionesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudcapacitacionesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
