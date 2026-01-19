import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CRUDUsuariosPage } from './crudusuarios.page';

describe('CRUDUsuariosPage', () => {
  let component: CRUDUsuariosPage;
  let fixture: ComponentFixture<CRUDUsuariosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CRUDUsuariosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
