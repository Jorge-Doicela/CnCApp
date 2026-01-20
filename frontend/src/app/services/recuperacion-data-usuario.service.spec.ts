import { TestBed } from '@angular/core/testing';

import { RecuperacionDataUsuarioService } from './recuperacion-data-usuario.service';

describe('RecuperacionDataUsuarioService', () => {
  let service: RecuperacionDataUsuarioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecuperacionDataUsuarioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
