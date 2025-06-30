import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmacySearchComponent } from './pharmacy-search.component';

describe('PharmacySearchComponent', () => {
  let component: PharmacySearchComponent;
  let fixture: ComponentFixture<PharmacySearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PharmacySearchComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmacySearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
