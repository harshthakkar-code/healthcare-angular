import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmacyIndexComponent } from './pharmacy-index.component';

describe('PharmacyIndexComponent', () => {
  let component: PharmacyIndexComponent;
  let fixture: ComponentFixture<PharmacyIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PharmacyIndexComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmacyIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
