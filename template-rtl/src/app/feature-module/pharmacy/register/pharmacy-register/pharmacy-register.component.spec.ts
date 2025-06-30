import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmacyRegisterComponent } from './pharmacy-register.component';

describe('PharmacyRegisterComponent', () => {
  let component: PharmacyRegisterComponent;
  let fixture: ComponentFixture<PharmacyRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PharmacyRegisterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmacyRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
