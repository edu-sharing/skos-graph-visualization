import { TestBed } from '@angular/core/testing';

import { SKOSService } from './skos.service';

describe('SKOSService', () => {
  let service: SKOSService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SKOSService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
