import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmacyRegisterStep2Component } from './pharmacy-register-step2.component';

describe('PharmacyRegisterStep2Component', () => {
  let component: PharmacyRegisterStep2Component;
  let fixture: ComponentFixture<PharmacyRegisterStep2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PharmacyRegisterStep2Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmacyRegisterStep2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
