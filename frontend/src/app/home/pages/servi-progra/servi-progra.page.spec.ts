import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServiPrograPage } from './servi-progra.page';

describe('ServiPrograPage', () => {
  let component: ServiPrograPage;
  let fixture: ComponentFixture<ServiPrograPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiPrograPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
