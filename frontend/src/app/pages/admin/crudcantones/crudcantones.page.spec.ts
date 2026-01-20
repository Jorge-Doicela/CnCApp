import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrudcantonesPage } from './crudcantones.page';

describe('CrudcantonesPage', () => {
  let component: CrudcantonesPage;
  let fixture: ComponentFixture<CrudcantonesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudcantonesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
