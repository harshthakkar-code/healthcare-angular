import { NgxMaskModule } from 'ngx-mask';
import { ChipModule } from 'primeng/chip';
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { materialModule } from './material.module';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { NgApexchartsModule } from 'ng-apexcharts';
import { PaginationHeaderModule } from './pagination-header/pagination-header.module';
import { CustomPaginationModule } from './custom-pagination/custom-pagination.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { CountUpModule } from 'ngx-countup';
import { LightboxModule } from 'ngx-lightbox';
import { LightgalleryModule } from 'lightgallery/angular';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { GoogleMapsModule } from '@angular/google-maps';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MatSliderModule } from '@angular/material/slider';
import { PatientSidebarModule } from '../feature-module/patients/common/patient-sidebar/patient-sidebar.module';
import { DoctorBreadcrumbModule } from '../feature-module/doctors/common/doctor-breadcrumb/doctor-breadcrumb.module';
import { PatientBreadcrumbModule } from '../feature-module/patients/common/patient-breadcrumb/patient-breadcrumb.module';
import { DoctorSidebarModule } from '../feature-module/doctors/common/doctor-sidebar/doctor-sidebar.module';
import { BreadcrumbSearchComponent } from '../feature-module/patients/common/breadcrumb-search/breadcrumb-search.component';

@NgModule({
  declarations: [ BreadcrumbSearchComponent],
  exports: [
    CommonModule,
    materialModule,
    NgApexchartsModule,
    PaginationHeaderModule,
    CustomPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMaskModule,
    SlickCarouselModule,
    BsDatepickerModule,
    NgCircleProgressModule,
    CarouselModule,
    // TimepickerModule,
    CountUpModule,
    LightboxModule,
    LightgalleryModule,
    NgScrollbarModule,
    MatSliderModule,
    NgScrollbarModule,
    PatientSidebarModule,
    DoctorBreadcrumbModule,
    PatientBreadcrumbModule,
    DoctorSidebarModule,
    BreadcrumbSearchComponent,
    ChipModule,
  ],
  imports: [
    CommonModule,
    materialModule,
    NgApexchartsModule,
    PaginationHeaderModule,
    CustomPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMaskModule.forRoot({
      showMaskTyped: false,
    }),
    SlickCarouselModule,
    BsDatepickerModule.forRoot(),
    NgCircleProgressModule.forRoot({
      radius: 70,
      space: -10,
      outerStrokeGradient: true,
      outerStrokeWidth: 10,
      outerStrokeColor: '#4882c2',
      outerStrokeGradientStopColor: '#65A30D',
      innerStrokeColor: '#65A30D',
      innerStrokeWidth: 10,
      animateTitle: false,
      animationDuration: 1000,
      showUnits: false,
      showBackground: false,
      clockwise: false,
      startFromZero: false,
      showSubtitle: false,
      showTitle: false,
    }),
    CarouselModule,
    // TimepickerModule,
    CountUpModule,
    GoogleMapsModule,
    LightboxModule,
    LightgalleryModule,
    NgScrollbarModule,
    MatSliderModule,
    NgScrollbarModule,
    PatientSidebarModule,
    DoctorBreadcrumbModule,
    PatientBreadcrumbModule,
    DoctorSidebarModule,
    ChipModule,
  ],
  providers: [DatePipe, provideHttpClient(withInterceptorsFromDi())],
})
export class SharedModule {}
