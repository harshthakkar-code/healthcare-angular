import { TestBed } from '@angular/core/testing';

import { TwilioChatService } from './twilio-chat.service';

describe('TwilioChatService', () => {
  let service: TwilioChatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TwilioChatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
