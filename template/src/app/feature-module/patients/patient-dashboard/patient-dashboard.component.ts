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
import { DependantService } from '../dependent/dependant.service';
import api from 'src/app/shared/api/axios';
import { formatDate } from '@angular/common';

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
  dashboardDependants: any[] = [];
  dashboardAppointments: any[] = [];
  currentAppointmentIndex = 0;
  dashboardPastAppointments: any[] = [];
  currentPastAppointmentIndex = 0;
  dashboardReportAppointments: any[] = [];
  dashboardReportInvoices: any[] = [];
  dashboardFavourites: any[] = [];
  currentWeekDates: Date[] = [];
  appointmentDatesSet: Set<string> = new Set();
  selectedWeekDateIndex = 0;

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
      // Get patientId once at the top of the method
      const patientId = (() => {
        try {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          return user.id || user._id || null;
        } catch {
          return null;
        }
      })();
      // this.appointments = await this.dashboardService.getAppointments(patientId);
      if (!patientId) {
        this.errorMessage = 'No patient ID found in local storage.';
        return;
      }
      // Fetch dependants for dashboard (show only first two) - direct API call
      console.log('Direct API call for dependants', patientId);
      api.get('/dependants', { params: { userId: patientId } })
      .then((res: any) => {
        console.log('Direct API dependants result', res);
        const all = Array.isArray(res.data) ? res.data : (res.data.data || []);
        this.dashboardDependants = all.slice(0, 2);
      })
      .catch((err: any) => {
        console.log('Direct API dependants error', err);
        this.dashboardDependants = [];
      });
      // Fetch appointments for dashboard slider
      api.get('/patient/appointments')
        .then((res: any) => {
          const all = Array.isArray(res.data.appointments) ? res.data.appointments : [];
          // Sort by date ascending
          all.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
          this.dashboardAppointments = all;
          this.currentAppointmentIndex = this.dashboardAppointments.length > 0 ? this.dashboardAppointments.length - 1 : 0;
          // Filter past appointments (completed, rejected, cancelled, and date before today)
          const today = new Date();
          const past = all.filter((a: any) => {
            const status = (a.status || '').toLowerCase();
            const aptDate = new Date(a.date);
            return ['completed', 'rejected', 'cancelled'].includes(status) && aptDate < today;
          });
          // Sort by date descending (most recent first)
          past.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          // Keep only the most recent past appointment
          this.dashboardPastAppointments = past.length > 0 ? [past[0]] : [];
          this.currentPastAppointmentIndex = 0;
          this.setAppointmentDatesSet();
        })
        .catch((err: any) => {
          console.log('Direct API dashboard appointments error', err);
          this.dashboardAppointments = [];
          this.dashboardPastAppointments = [];
        });
      // Fetch appointments for reports tab
      api.get('/patient/appointments')
        .then((res: any) => {
          this.dashboardReportAppointments = Array.isArray(res.data.appointments) ? res.data.appointments : [];
          console.log('Dashboard report appointments', this.dashboardReportAppointments);
        })
        .catch((err: any) => {
          console.log('Dashboard report appointments error', err);
          this.dashboardReportAppointments = [];
        });
      // Fetch invoices for reports tab (use /invoices/patient/:patientId)
      if (!patientId) {
        this.dashboardReportInvoices = [];
        return;
      }
      api.get(`/invoices/patient/${patientId}`, { params: { page: 1, limit: 10 } })
        .then((res: any) => {
          this.dashboardReportInvoices = res.data.data || [];
        })
        .catch((err: any) => {
          console.log('Dashboard report invoices error', err);
          this.dashboardReportInvoices = [];
        });
      // Fetch favourites for dashboard (first 4)
      api.get(`/favourites?patientId=${patientId}&favourites=true&page=1&limit=4`)
        .then(async res => {
          // Only use the doctorId object for each favourite
          this.dashboardFavourites = (res.data.data || res.data || []).filter((fav: any) => fav.doctorId);
          // If you want to show favourite status for these doctors elsewhere, use batch endpoint
          if (this.dashboardFavourites.length > 0) {
            const doctorIds = this.dashboardFavourites.map((fav: any) => fav.doctorId._id || fav.doctorId);
            try {
              const favRes = await api.post('/favourites/status', { patientId, doctorIds });
              const batchStatus = favRes.data;
              this.dashboardFavourites.forEach((fav: any) => {
                fav.favourite = batchStatus[fav.doctorId._id || fav.doctorId] || null;
              });
            } catch {
              this.dashboardFavourites.forEach((fav: any) => {
                fav.favourite = null;
              });
            }
          }
        })
        .catch(() => {
          this.dashboardFavourites = [];
        });
      this.setCurrentWeekDates();
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to load data';
    }
  }

  public getAgeFromDob(dob: string): string {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const now = new Date();

    let years = now.getFullYear() - birthDate.getFullYear();
    let months = now.getMonth() - birthDate.getMonth();
    let days = now.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      // Get days in previous month
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    // Calculate days since last birthday
    const lastBirthday = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (now < lastBirthday) lastBirthday.setFullYear(now.getFullYear() - 1);
    const diffTime = Math.abs(now.getTime() - lastBirthday.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return `${years} years ${diffDays} days`;
  }

  showPrevAppointment() {
    if (this.currentAppointmentIndex > 0) {
      this.currentAppointmentIndex--;
    }
  }
  showNextAppointment() {
    if (this.currentAppointmentIndex < this.dashboardAppointments.length - 1) {
      this.currentAppointmentIndex++;
    }
  }

  showPrevPastAppointment() {
    if (this.currentPastAppointmentIndex > 0) {
      this.currentPastAppointmentIndex--;
    }
  }
  showNextPastAppointment() {
    if (this.currentPastAppointmentIndex < this.dashboardPastAppointments.length - 1) {
      this.currentPastAppointmentIndex++;
    }
  }

  setCurrentWeekDates() {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    this.currentWeekDates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      this.currentWeekDates.push(d);
    }
  }

  setAppointmentDatesSet() {
    this.appointmentDatesSet = new Set(
      this.dashboardAppointments.map(a => formatDate(a.date, 'yyyy-MM-dd', 'en-US'))
    );
  }

  isDateWithAppointment(date: Date): boolean {
    return this.appointmentDatesSet.has(formatDate(date, 'yyyy-MM-dd', 'en-US'));
  }

  getAppointmentsForDate(date: Date) {
    const dateStr = formatDate(date, 'yyyy-MM-dd', 'en-US');
    return this.dashboardAppointments.filter(a => {
      const aptDateStr = formatDate(new Date(a.date), 'yyyy-MM-dd', 'en-US');
      return aptDateStr === dateStr;
    });
  }

  onWeekDateSlide(event: any) {
    if (event && event.item && typeof event.item.index === 'number') {
      this.selectedWeekDateIndex = event.item.index;
    }
  }

  trackByDate(index: number, date: Date): string {
    return date.toISOString();
  }

  getThisWeekAppointments(): any[] {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return this.dashboardAppointments
      .filter(a => {
        const aptDate = new Date(a.date);
        return aptDate >= startOfWeek && aptDate <= endOfWeek;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 2);
  }

  getDuration(timeRange: string): string {
    if (!timeRange) return '0m';
    const [start, end] = timeRange.split('-').map(t => t.trim());
    if (!start || !end) return '0m';

    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);

    if (
      isNaN(startHour) || isNaN(startMinute) ||
      isNaN(endHour) || isNaN(endMinute)
    ) return '0m';

    const startDate = new Date(0, 0, 0, startHour, startMinute);
    const endDate = new Date(0, 0, 0, endHour, endMinute);

    let diff = (endDate.getTime() - startDate.getTime()) / (1000 * 60); // minutes
    if (diff < 0) diff += 24 * 60; // handle overnight

    return `${diff} minutes`;
  }
}
