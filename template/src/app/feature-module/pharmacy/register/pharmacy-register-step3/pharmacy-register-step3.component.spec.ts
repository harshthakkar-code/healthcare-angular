import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmacyRegisterStep3Component } from './pharmacy-register-step3.component';

describe('PharmacyRegisterStep3Component', () => {
  let component: PharmacyRegisterStep3Component;
  let fixture: ComponentFixture<PharmacyRegisterStep3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PharmacyRegisterStep3Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmacyRegisterStep3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
