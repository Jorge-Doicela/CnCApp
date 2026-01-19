import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CRUDRolesPage } from './crudroles.page';

describe('CRUDRolesPage', () => {
  let component: CRUDRolesPage;
  let fixture: ComponentFixture<CRUDRolesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CRUDRolesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
