/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ViewChild, OnInit } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTooltip,
  ApexStroke,
  ApexMarkers,
  ApexLegend,
} from "ng-apexcharts";
import { DataService } from 'src/app/shared/data/data.service';

export type ChartOptions = {
  series: ApexAxisChartSeries | any;
  chart: ApexChart | any;
  xaxis: ApexXAxis | any;
  stroke: ApexStroke | any;
  tooltip: ApexTooltip | any;
  dataLabels: ApexDataLabels | any;
  legend: ApexLegend |any;
  markers: ApexMarkers |any;
};
@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    standalone: false
})
export class DashboardComponent implements OnInit {
  public routes = routes;

  public doctorCount = 0;
  public patientCount = 0;
  public appointmentCount = 0;
  public doctorList: any[] = [];
  public patientList: any[] = [];
  public appointmentList: any[] = [];
  public revenue: number = 0;
  public loading = true;

  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions1: Partial<ChartOptions>;
  public chartOptions2: Partial<ChartOptions>;

  constructor(private data: DataService) {
    // Initialize charts with empty data
    this.chartOptions1 = {
      series: [
        {
          name: "Revenue",
          data: [],
          color: "#1b5a90"
        },
      ],
      chart: {
        height: 350,
        type: "area",
        toolbar: {
          show: false
        },
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "smooth",
        width: 2
      },
      xaxis: {
        categories: []
      },
      markers: {
        size: 4,
        strokeWidth: 0,
        hover: {
          sizeOffset: 3
        }
      },
    };
    this.chartOptions2 = {
      series: [
        {
          name: 'Doctors',
          data: [],
          color: '#1b5a90',
        },
        {
          name: 'Patients',
          data: [],
          color: '#ff9d00',
        },
      ],
      chart: {
        height: 350,
        width: '100%',
        type: 'line',
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: false,
      },
      stroke: {
        show: true,
        curve: 'smooth',
        width: 2,
        dashArray: 0,
    },
      xaxis: {
        categories: [],
      },
      markers: {
        size: 4,
        strokeWidth: 0,
        hover: {
          sizeOffset: 3
        }
      },
    };
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.data.getDashboardData().subscribe({
      next: (dashboardData) => {
        // Update counts
        this.doctorCount = dashboardData.counts?.doctors || 0;
        this.patientCount = dashboardData.counts?.patients || 0;
        this.appointmentCount = dashboardData.counts?.appointments || 0;
        this.revenue = dashboardData.revenue || 0;

        // Update revenue chart
        if (dashboardData.revenueChartData && dashboardData.revenueChartData.length > 0) {
          this.chartOptions1.series[0].data = dashboardData.revenueChartData.map((item: any) => item.revenue);
          this.chartOptions1.xaxis.categories = dashboardData.revenueChartData.map((item: any) => item.month);
        }

        // Update growth chart
        if (dashboardData.growthChartData) {
          const doctorData = dashboardData.growthChartData.doctors || [];
          const patientData = dashboardData.growthChartData.patients || [];
          
          this.chartOptions2.series[0].data = doctorData.map((item: any) => item.count);
          this.chartOptions2.series[1].data = patientData.map((item: any) => item.count);
          this.chartOptions2.xaxis.categories = doctorData.map((item: any) => item.period);
        }

        // Update top doctors list
        if (dashboardData.topDoctors) {
          this.doctorList = dashboardData.topDoctors.map((doctor: any, index: number) => ({
            id: index + 1,
            doctorName: doctor.doctorName,
            speciality: doctor.speciality || 'General',
            earned: doctor.totalEarned?.toString() || '0',
            avgRating: 4.5, // Default rating, can be enhanced later
            reviewCount: doctor.appointmentCount || 0,
            img: 'assets/admin/img/doctors/doctor-thumb-01.jpg'
          }));
        }

        // Update recent appointments
        if (dashboardData.recentAppointments) {
          this.appointmentList = dashboardData.recentAppointments.map((appointment: any, index: number) => ({
            id: index + 1,
            doctorName: appointment.doctor?.name || appointment.doctorName || '',
            speciality: appointment.specialty || '',
            patientName: appointment.patient?.name || appointment.name || '',
            appointmentTime: appointment.time || '',
            appointmentDate: appointment.date || '',
            amount: appointment.totalPrice?.toString() || '',
            isStatus: appointment.status === 'accepted',
            appointmentId: appointment._id,
          }));
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
        // Fallback to static data if API fails
        this.loadFallbackData();
      }
    });
  }

  loadFallbackData(): void {
    // Load individual data as fallback
    this.data.getDoctorList().subscribe(res => {
      this.doctorCount = res.totalData;
      this.doctorList = res.data.slice(0, 5);
    });
    this.data.getPatientList().subscribe(res => {
      this.patientCount = res.totalData;
      this.patientList = res.data.slice(0, 5);
    });
    this.data.getAppointmentList().subscribe(res => {
      this.appointmentCount = res.totalData;
      this.appointmentList = res.data.slice(0, 5);
    });
    this.data.getTotalRevenue().subscribe(res => {
      this.revenue = res.totalPaid || 0;
    });
  }

  onDashboardAppointmentToggle(appointment: any, index: number) {
    const appointmentId = appointment.appointmentId;
    const newStatus = appointment.isStatus ? 'accepted' : 'rejected';
    this.data.updateAppointmentStatus(appointmentId, newStatus).subscribe({
      next: (res) => {
        // Optionally show a success message
      },
      error: (err) => {
        // Optionally revert the toggle or show an error
        appointment.isStatus = !appointment.isStatus;
      }
    });
  }
}
