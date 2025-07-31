import { Component, OnInit } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import api from 'src/app/shared/api/axios';

@Component({
    selector: 'app-my-patients',
    templateUrl: './my-patients.component.html',
    styleUrls: ['./my-patients.component.scss'],
    standalone: false
})
export class MyPatientsComponent implements OnInit {
  public routes = routes;
  public filter = false;
  bsValue = new Date();
  bsRangeValue: Date[];
  maxDate = new Date();
  patients: any[] = [];
  activePatients: any[] = [];
  inactivePatients: any[] = [];
  loading = true;
  error: string | null = null;
  activeTab: 'active' | 'inactive' = 'active';
  searchTerm: string = '';
  filteredActivePatients: any[] = [];
  filteredInactivePatients: any[] = [];

  constructor() {
    this.maxDate.setDate(this.maxDate.getDate() + 7);
    this.bsRangeValue = [this.bsValue, this.maxDate];
  }

  ngOnInit() {
    const doctorId = this.getDoctorId();
    this.fetchPatients(doctorId);
  }

  getDoctorId() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id || user._id;
    } catch {
      return null;
    }
  }

  fetchPatients(doctorId: string) {
    this.loading = true;
    api.get(`/doctor/appointments/doctor/${doctorId}`)
      .then((res: any) => {
        const appointments = res.data || [];
        const patientMap: { [id: string]: any } = {};
        appointments.forEach((apt: any) => {
          if (apt.patient && apt.patient._id) {
            if (
              !patientMap[apt.patient._id] ||
              new Date(apt.date) > new Date(patientMap[apt.patient._id].lastBooking)
            ) {
              patientMap[apt.patient._id] = {
                ...apt.patient,
                lastBooking: apt.date,
                lastAppointment: apt
              };
            }
          }
        });
        this.patients = Object.values(patientMap);
        this.splitActiveInactive();
        this.applyFilters();
        this.loading = false;
      })
      .catch(() => {
        this.loading = false;
        this.error = 'Failed to load patients.';
      });
  }

  splitActiveInactive() {
    const now = new Date();
    this.activePatients = [];
    this.inactivePatients = [];
    this.patients.forEach(patient => {
      const lastBooking = new Date(patient.lastBooking);
      const diffMonths = (now.getTime() - lastBooking.getTime()) / (1000 * 60 * 60 * 24 * 30.44); // average month
      if (diffMonths > 6) {
        this.inactivePatients.push(patient);
      } else {
        this.activePatients.push(patient);
      }
    });
  }

  applyFilters() {
    // Date range filter
    let start: Date | null = null;
    let end: Date | null = null;
    if (this.bsRangeValue && this.bsRangeValue.length === 2) {
      start = this.bsRangeValue[0];
      end = this.bsRangeValue[1];
    }
    // Search filter
    const search = (this.searchTerm || '').toLowerCase();
    const filterFn = (patient: any) => {
      const nameMatch = !search || (patient.name && patient.name.toLowerCase().includes(search));
      let dateMatch = true;
      if (start && end) {
        const lastBooking = new Date(patient.lastBooking);
        dateMatch = lastBooking >= start && lastBooking <= end;
      }
      return nameMatch && dateMatch;
    };
    this.filteredActivePatients = this.activePatients.filter(filterFn);
    this.filteredInactivePatients = this.inactivePatients.filter(filterFn);
  }

  setTab(tab: 'active' | 'inactive') {
    this.activeTab = tab;
  }

  public showFilter(){
    this.filter = !this.filter
  }
}
