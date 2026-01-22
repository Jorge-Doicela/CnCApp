import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrudparroquiasPage } from './crudparroquias.page';

describe('CrudparroquiasPage', () => {
  let component: CrudparroquiasPage;
  let fixture: ComponentFixture<CrudparroquiasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudparroquiasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
