import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BreadcrumbSearchComponent } from './breadcrumb-search.component';

describe('BreadcrumbSearchComponent', () => {
  let component: BreadcrumbSearchComponent;
  let fixture: ComponentFixture<BreadcrumbSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BreadcrumbSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BreadcrumbSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
