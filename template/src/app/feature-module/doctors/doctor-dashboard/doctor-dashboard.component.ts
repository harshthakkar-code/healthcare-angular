import { Component, ViewChild } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { PaginationService, tablePageSize } from 'src/app/shared/custom-pagination/pagination.service';
import { DataService } from 'src/app/shared/data/data.service';
import { doctorDashboard, apiResultFormat, pageSelection } from 'src/app/shared/models/models';
import { routes } from 'src/app/shared/routes/routes';
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexXAxis,
  ApexPlotOptions,
  
  
} from "ng-apexcharts";
import api from 'src/app/shared/api/axios';


export type ChartOptions = {
  series: ApexAxisChartSeries | any;
  chart: ApexChart | any;
  dataLabels: ApexDataLabels | any;
  plotOptions: ApexPlotOptions | any;
  xaxis: ApexXAxis | any;
  
  
};

@Component({
    selector: 'app-doctor-dashboard',
    templateUrl: './doctor-dashboard.component.html',
    styleUrls: ['./doctor-dashboard.component.scss'],
    standalone: false
})
export class DoctorDashboardComponent {
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions1: Partial<ChartOptions>;
  public chartOptions2: Partial<ChartOptions>;
  public routes = routes;
  public tableData: Array<doctorDashboard> = [];
  public tableData2: Array<doctorDashboard> = [];

  // pagination variables
  public pageSize = 10;
  public serialNumberArray: Array<number> = [];
  public totalData = 0;
  showFilter = false;
  dataSource!: MatTableDataSource<doctorDashboard>;
  public searchDataValue = '';
  // pagination variables end

  public totalPatients: number = 0;
  public patientsToday: number = 0;
  public appointmentsToday: number = 0;
  public appointments: any[] = [];
  public invoices: any[] = [];

  constructor(
    private data: DataService,
    private pagination: PaginationService,
    private router: Router
  ) {
    this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
      if (this.router.url == this.routes.doctorDashboard) {
        this.getTableData({ skip: res.skip, limit: res.limit });
        this.pageSize = res.pageSize;
      }
    });
    this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
      if (this.router.url == this.routes.doctorDashboard) {
        this.getTableData2({ skip: res.skip, limit: res.limit });
        this.pageSize = res.pageSize;
      }
    });
    this.chartOptions1 = {
      series: [
        {
          name: "High",
          data: [50,40,15,45,35,48,65]
        }
      ],
      chart: {
        type: "bar",
        height: 220,
        stacked: true,
        toolbar: {
          show: false,
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '50%',
          endingShape: 'rounded',
          borderRadius: 7, 
        }
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: ['M','T', 'W', 'T','F','S','S'],
    },
    };
    this.chartOptions2 = {
      series: [
        {
          name: "High",
          data: [40,20,30,60,90,40,110]
        }
      ],
      chart: {
        type: "bar",
        height: 220,
        stacked: true,
        endingShape: 'rounded',  
        toolbar: {
          show: false,
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '50%',
          endingShape: 'rounded',
          borderRadius: 7, 
        }
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: ['M','T', 'W', 'T','F','S','S'],
    },
    
    };
  }

  ngOnInit(): void {
    this.fetchDoctorStats();
    this.fetchDashboardInvoices();
  }

  getDoctorIdFromLocalStorage(): string | null {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id || user._id || null;
    } catch {
      return null;
    }
  }

  updateAppointmentChart() {
    // Get the last 7 days (including today)
    const days: string[] = [];
    const counts: number[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
      const dayStr = d.toISOString().slice(0, 10);
      counts.push(this.appointments.filter(a => a.date && a.date.slice(0, 10) === dayStr).length);
    }
    if (this.chartOptions2 && this.chartOptions2.series && this.chartOptions2.series[0]) {
      this.chartOptions2.series[0].data = counts;
      this.chartOptions2.xaxis = { categories: days };
    }
  }

  async fetchDoctorStats() {
    const doctorId = this.getDoctorIdFromLocalStorage();
    if (!doctorId) return;
    try {
      const res = await api.get(`/doctor/appointments/doctor/${doctorId}`);
      const allAppointments = res.data;
      // Sort by date descending
      this.appointments = allAppointments
        .filter((a: any) => a.date)
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
      // Unique patients
      const patientIds = new Set(allAppointments.map((a: any) => a.patient && a.patient._id ? a.patient._id : a.patient));
      this.totalPatients = patientIds.size;
      // Today's date (ignore time)
      const today = new Date();
      const todayStr = today.toISOString().slice(0, 10);
      this.patientsToday = new Set(
        allAppointments.filter((a: any) => a.date && a.date.slice(0, 10) === todayStr)
          .map((a: any) => a.patient && a.patient._id ? a.patient._id : a.patient)
      ).size;
      this.appointmentsToday = allAppointments.filter((a: any) => a.date && a.date.slice(0, 10) === todayStr).length;
      // Update appointment chart
      this.appointments = allAppointments.filter((a: any) => a.date);
      this.updateAppointmentChart();
    } catch (error) {
      this.appointments = [];
      this.totalPatients = 0;
      this.patientsToday = 0;
      this.appointmentsToday = 0;
      this.updateAppointmentChart();
    }
  }

  private getTableData(pageOption: pageSelection): void {
    this.data.getDoctorDashboard1().subscribe((apiRes: apiResultFormat) => {
      this.tableData = [];
      this.serialNumberArray = [];
      this.totalData = apiRes.totalData;
      apiRes.data.map((res: doctorDashboard, index: number) => {
        const serialNumber = index + 1;
        if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
          res.id = serialNumber;
          this.tableData.push(res);
          this.serialNumberArray.push(serialNumber);
        }
      });
      this.dataSource = new MatTableDataSource<doctorDashboard>(this.tableData);
      this.pagination.calculatePageSize.next({
        totalData: this.totalData,
        pageSize: this.pageSize,
        tableData: this.tableData,
        serialNumberArray: this.serialNumberArray,
        tableData2: this.tableData2,
        tableData3: [],
        tableData4: []
      });
    });
  }


  private getTableData2(pageOption: pageSelection): void {
    this.data.getDoctorDashboard2().subscribe((apiRes: apiResultFormat) => {
      this.tableData2 = [];
      this.serialNumberArray = [];
      this.totalData = apiRes.totalData;
      apiRes.data.map((res: doctorDashboard, index: number) => {
        const serialNumber = index + 1;
        if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
          res.id = serialNumber;
          this.tableData2.push(res);
          this.serialNumberArray.push(serialNumber);
        }
      });
      this.dataSource = new MatTableDataSource<doctorDashboard>(this.tableData2);
      this.pagination.calculatePageSize.next({
        totalData: this.totalData,
        pageSize: this.pageSize,
        tableData2: this.tableData2,
        serialNumberArray: this.serialNumberArray,
        tableData: this.tableData,
        tableData3: [],
        tableData4: []
      });
    });
  }
  public sortData(sort: Sort) {
    const data = this.tableData.slice();

    if (!sort.active || sort.direction === '') {
      this.tableData = data;
    } else {
      this.tableData = data.sort((a, b) => {
        const aValue = (a as never)[sort.active];
        const bValue = (b as never)[sort.active];
        return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
      });
    }
  }
  public sortData2(sort: Sort) {
    const data = this.tableData2.slice();
  
    if (!sort.active || sort.direction === '') {
      this.tableData2 = data;
    } else {
      this.tableData2 = data.sort((a, b) => {
        const aValue = (a as never)[sort.active];
        const bValue = (b as never)[sort.active];
        return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
      });
    }
  }

  async updateAppointmentStatus(appointment: any, status: 'accepted' | 'rejected') {
    try {
      const res = await api.put(`/doctor/appointments/${appointment._id}/status`, { status });
      appointment.status = res.data.status;
    } catch (error) {
      // Optionally show an error message
    }
  }

  getStatusBadgeClass(status: string): string {
    if (status === 'accepted') return 'badge bg-success';
    if (status === 'rejected') return 'badge bg-danger';
    return 'badge bg-secondary';
  }

  get upcomingAppointment() {
    const now = new Date();
    return this.appointments
      .filter(a => a.date && new Date(a.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  }

  get latestAppointments() {
    if (!this.appointments) return [];
    // Helper to get a Date object from appointment's date and time
    const getDateTime = (a: any) => {
      if (!a.date) return new Date(0); // very old date
      if (a.time) {
        let timeStr = a.time.split('-')[0].trim(); // take start time
        // Normalize time to 24h format if possible
        // If time is in 'hh:mm AM/PM' format, parse accordingly
        let datePart = a.date.length > 10 ? a.date.slice(0, 10) : a.date;
        let dateTimeStr = datePart + 'T' + timeStr;
        let d = new Date(dateTimeStr);
        if (isNaN(d.getTime())) {
          // Try with space instead of T
          dateTimeStr = datePart + ' ' + timeStr;
          d = new Date(dateTimeStr);
        }
        if (isNaN(d.getTime())) {
          // Try appending ':00' for seconds
          dateTimeStr = datePart + 'T' + timeStr + ':00';
          d = new Date(dateTimeStr);
        }
        if (isNaN(d.getTime())) {
          // Fallback to just date
          d = new Date(datePart);
        }
        return d;
      } else {
        return new Date(a.date);
      }
    };
    // Sort by date+time descending (future first)
    const sorted = [...this.appointments].sort((a, b) => getDateTime(b).getTime() - getDateTime(a).getTime());
    return sorted.slice(0, 5);
  }

  async fetchDashboardInvoices() {
    try {
      const doctorId = this.getDoctorIdFromLocalStorage();
      if (!doctorId) {
        this.invoices = [];
        return;
      }
      const res = await api.get(`/invoices/doctor/${doctorId}`, { params: { page: 1, limit: 10 } });
      this.invoices = Array.isArray(res.data.data) ? res.data.data : [];
    } catch (error) {
      this.invoices = [];
    }
  }

  get recentPatients() {
    // Sort appointments by date descending
    const sorted = [...this.appointments]
      .filter(a => a.patient)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const seen = new Set();
    const uniquePatients = [];
    for (const appt of sorted) {
      const pid = appt.patient?._id || appt.patient;
      if (!seen.has(pid)) {
        uniquePatients.push(appt.patient);
        seen.add(pid);
      }
      if (uniquePatients.length === 2) break;
    }
    return uniquePatients;
  }

  getLastAppointmentDate(patient: any): Date | null {
    const appt = this.appointments
      .filter(a => a.patient)
      .find(a => (a.patient?._id || a.patient) === (patient?._id || patient));
    return appt?.date ? new Date(appt.date) : null;
  }

  get weeklyOverviewRange(): string {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: '2-digit' };
    return `${start.toLocaleDateString('en-US', options)} - ${today.toLocaleDateString('en-US', options)}`;
  }

  formatPatientId(id: string | undefined): string {
    if (!id) return '';
    return id.slice(0, 6) + '..';
  }

  get isProfilePending(): boolean {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.isApproved === 'pending';
    } catch {
      return false;
    }
  }
}
