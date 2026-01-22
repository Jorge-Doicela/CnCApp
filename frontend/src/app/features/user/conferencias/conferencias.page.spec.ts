import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConferenciasPage } from './conferencias.page';

describe('ConferenciasPage', () => {
  let component: ConferenciasPage;
  let fixture: ComponentFixture<ConferenciasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ConferenciasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
