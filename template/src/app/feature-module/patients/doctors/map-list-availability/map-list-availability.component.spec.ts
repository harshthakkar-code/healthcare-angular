import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapListAvailabilityComponent } from './map-list-availability.component';

describe('MapListAvailabilityComponent', () => {
  let component: MapListAvailabilityComponent;
  let fixture: ComponentFixture<MapListAvailabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MapListAvailabilityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapListAvailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
