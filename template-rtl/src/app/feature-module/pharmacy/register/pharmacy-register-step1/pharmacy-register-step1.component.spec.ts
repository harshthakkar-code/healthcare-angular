import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmacyRegisterStep1Component } from './pharmacy-register-step1.component';

describe('PharmacyRegisterStep1Component', () => {
  let component: PharmacyRegisterStep1Component;
  let fixture: ComponentFixture<PharmacyRegisterStep1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PharmacyRegisterStep1Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmacyRegisterStep1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
