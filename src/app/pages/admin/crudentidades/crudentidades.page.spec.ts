import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrudentidadesPage } from './crudentidades.page';

describe('CrudentidadesPage', () => {
  let component: CrudentidadesPage;
  let fixture: ComponentFixture<CrudentidadesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudentidadesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
