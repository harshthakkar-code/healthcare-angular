import { Component, Renderer2, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { patientDashboard } from 'src/app/shared/models/models';
import { routes } from 'src/app/shared/routes/routes';
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexXAxis,
  ApexPlotOptions,
  ApexFill,
  ApexLegend,
  ApexStroke,
} from 'ng-apexcharts';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { PatientDashboardService } from './patient-dashboard.service';

export type ChartOptions = {
  series: ApexAxisChartSeries | any;
  chart: ApexChart | any;
  dataLabels: ApexDataLabels | any;
  plotOptions: ApexPlotOptions | any;
  xaxis: ApexXAxis | any;
  fill: ApexFill | any;
  legend: ApexLegend | any;
  stroke: ApexStroke | any;
};

@Component({
    selector: 'app-patient-dashboard',
    templateUrl: './patient-dashboard.component.html',
    styleUrls: ['./patient-dashboard.component.scss'],
    standalone: false
})
export class PatientDashboardComponent implements OnInit {
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions1: Partial<ChartOptions>;
  public chartOptions2: Partial<ChartOptions>;
  public routes = routes;
  public tableData: Array<patientDashboard> = [];
  public tableData2: Array<patientDashboard> = [];
  public tableData3: Array<patientDashboard> = [];
  public tableData4: Array<patientDashboard> = [];
  public base = '';
  public page = '';
  public last = '';
  public doctorSliderOptions: OwlOptions = {
    loop: true,
    margin: 24,
    dots: false,
    nav: true,
    smartSpeed: 2000,
    navText: [
      '<i class="fas fa-chevron-left"></i>',
      '<i class="fas fa-chevron-right"></i>',
    ],
    responsive: {
      0: {
        items: 1,
      },
      500: {
        items: 1,
      },
      575: {
        items: 1,
      },
      768: {
        items: 1,
      },
      1000: {
        items: 1,
      },
      1200: {
        items: 1,
      },
    },
  };
  public patientSliderOptions: OwlOptions = {
    loop: true,
    margin: 5,
    dots: false,
    nav: true,
    smartSpeed: 2000,
    navText: [
      '<i class="fas fa-chevron-left"></i>',
      '<i class="fas fa-chevron-right"></i>',
    ],
    responsive: {
      0: {
        items: 5,
      },
      500: {
        items: 5,
      },

      768: {
        items: 5,
      },
      1000: {
        items: 5,
      },
      1300: {
        items: 5,
      },
    },
  };
  patientInfo: any;
  appointments: any[] = [];
  errorMessage = '';

  constructor(private router: Router, private renderer: Renderer2, private dashboardService: PatientDashboardService) {
    if (this.page == 'patient-dashboard') {
      this.renderer.addClass(document.body, 'date-pickers');
    }
    this.chartOptions1 = {
      series: [
        {
          data: [140, 100, 180, 130, 100, 130],
        },
      ],
      chart: {
        height: 300,
        type: 'bar',
      },
      fill: {
        colors: ['#0e82fdd9'],
      },

      plotOptions: {
        bar: {
          columnWidth: '45%',
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: [['Mon'], ['Tue'], ['Wed'], ['Thu'], ['Fri'], ['Sat']],
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent'],
      },
      legend: {
        show: false,
      },
    };
    this.chartOptions2 = {
      series: [
        {
          data: [90, 60, 30, 60, 90, 70, 70],
        },
        {
          data: [110, 90, 40, 120, 130, 130, 130],
        },
      ],
      chart: {
        type: 'bar',
        height: 350,
      },
      fill: {
        colors: ['#0e82fdd9'],
        opacity: 1,
      },

      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded',
          borderRadius: 5,
          borderRadiusApplication:'end'
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      },
      legend: {
        show: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent'],
      },
    };
  }

  async ngOnInit() {
    try {
      // Get profile using Bearer token
      this.patientInfo = await this.dashboardService.getProfile();
      // Get patientId from localStorage for appointments
      const patientId = localStorage.getItem('userId');
      if (!patientId) {
        this.errorMessage = 'No patient ID found in local storage.';
        return;
      }
      this.appointments = await this.dashboardService.getAppointments(patientId);
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to load data';
    }
  }
}
