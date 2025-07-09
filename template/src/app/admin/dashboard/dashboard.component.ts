/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ViewChild } from '@angular/core';
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
export class DashboardComponent {
  public routes = routes;

  public doctorCount = 0;
  public patientCount = 0;
  public appointmentCount = 0;
  public doctorList: any[] = [];
  public patientList: any[] = [];
  public appointmentList: any[] = [];
  public revenue: number = 0;

  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions1: Partial<ChartOptions>;
  public chartOptions2: Partial<ChartOptions>;

  constructor(private data: DataService) {
    this.chartOptions1 = {
      series: [
        {
          name: "Revenue",
          data: [60, 100, 240, 120, 80, 100, 300],
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
        categories: [
          "2013",
          "2014",
          "2015",
          "2016",
          "2017",
          "2018",
          "2019"
        ]
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
          data: [100, 20, 90, 50, 120],
          color: '#1b5a90',
        },
        {
          name: 'Patients',
          data: [30, 60, 120, 80, 150],
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
        categories: ['2015', '2016', '2017', '2018', '2019'],
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
    this.data.getDoctorList().subscribe(res => {
      this.doctorCount = res.totalData;
      this.doctorList = res.data.slice(0, 5); // Top 5 doctors
    });
    this.data.getPatientList().subscribe(res => {
      this.patientCount = res.totalData;
      this.patientList = res.data.slice(0, 5); // Top 5 patients
    });
    this.data.getAppointmentList().subscribe(res => {
      this.appointmentCount = res.totalData;
      this.appointmentList = res.data.slice(0, 5); // Top 5 appointments
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
