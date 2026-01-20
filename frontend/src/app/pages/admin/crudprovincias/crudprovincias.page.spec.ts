import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrudprovinciasPage } from './crudprovincias.page';

describe('CrudprovinciasPage', () => {
  let component: CrudprovinciasPage;
  let fixture: ComponentFixture<CrudprovinciasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudprovinciasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
