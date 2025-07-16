import { Component, OnInit } from '@angular/core';
import { DoctorSpecialitiesService } from './doctor-specialities.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog.component';

interface Service {
  _id?: string;
  name: any;
  price: number;
  about?: string;
}

interface Specialization {
  _id?: string;
  doctorId: string | undefined;
  name: string;
  experience: number;
  services: Service[];
  editMode?: boolean;
}

@Component({
  selector: 'app-doctor-specialities',
  templateUrl: './doctor-specialities.component.html',
  styleUrl: './doctor-specialities.component.scss',
  standalone: false
})
export class DoctorSpecialitiesComponent implements OnInit {
  doctorId: string | null = null;
  specializations: Specialization[] = [];
  loading = false;
  error = '';
  newSpecialization: Partial<Specialization> | null = null;
  attemptedSave = false;

  // Static options for dropdowns
  specialityOptions: any[] = [];
  serviceOptions = ['Surgery', 'General Checkup'];

  constructor(private specService: DoctorSpecialitiesService, private dialog: MatDialog) { }

  getDoctorId(): string | null {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id || user._id || null;
    } catch {
      return null;
    }
  }

  ngOnInit() {
    this.doctorId = this.getDoctorId();
    if (!this.doctorId) {
      this.error = 'Error: Doctor ID not found. Please log in again.';
      this.loading = false;
      return;
    }
    this.fetchSpecialityOptions();
    this.loadSpecializations();
  }

  fetchSpecialityOptions() {
    this.specService.getSpecialityOptions().subscribe((res: any) => {
      this.specialityOptions = Array.isArray(res.data.data) ? res.data.data : [];
      console.log(this.specialityOptions )
    });
  }

  loadSpecializations() {
    if (!this.doctorId) return;
    this.loading = true;
    this.specService.getSpecializations(this.doctorId as string).subscribe({
      next: (response) => {
        console.log('API DATA:', response);
        this.specializations = response.data;
        this.loading = false;
      },
      error: (err) => { this.error = 'Failed to load specializations'; this.loading = false; }
    });
  }

  addSpecialization() {
    this.newSpecialization = {
      doctorId: this.doctorId!,
      name: '',
      experience: 0,
      services: []
    };
  }

  addNewServiceRow() {
    if (
      this.newSpecialization &&
      Array.isArray(this.newSpecialization.services) &&
      this.newSpecialization.services.length < this.serviceOptions.length
    ) {
      this.newSpecialization.services.push({ name: '', price: 0, about: '' });
    }
  }

  deleteNewServiceRow(index: number) {
    if (this.newSpecialization && Array.isArray(this.newSpecialization.services)) {
      this.newSpecialization.services.splice(index, 1);
    }
  }

  saveNewSpecialization() {
    this.attemptedSave = true;
    if (!this.newSpecialization || !this.isSpecializationValid(this.newSpecialization)) {
      this.error = 'Please fill all required fields';
      setTimeout(() => this.error = '', 3000);
      return;
    }
    // Prevent duplicate specialization
    if (this.specializations.some(s => s.name === this.newSpecialization?.name)) {
      this.error = 'This speciality is already added!';
      setTimeout(() => this.error = '', 3000);
      return;
    }
    if (!this.doctorId) return;
    this.specService.createSpecializations(this.doctorId, [this.newSpecialization]).subscribe({
      next: () => {
        this.newSpecialization = null;
        this.attemptedSave = false;
        this.loadSpecializations();
      },
      error: () => {
        this.error = 'Failed to add specialization';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  cancelNewSpecialization() {
    this.newSpecialization = null;
  }

  updateSpecialization(spec: Specialization) {
    this.specService.updateSpecialization(spec._id!, spec).subscribe({
      next: () => this.loadSpecializations(),
      error: () => this.error = 'Failed to update specialization'
    });
  }

  deleteSpecialization(spec: Specialization) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: { message: 'Are you sure you want to delete this specialization?' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.specService.deleteSpecialization(spec._id!).subscribe({
          next: () => this.loadSpecializations(),
          error: () => this.error = 'Failed to delete specialization'
        });
      }
    });
  }

  addService(spec: Specialization) {
    if (spec.services.length >= this.serviceOptions.length) return; // Prevent more than available services
    const newService = { name: '', price: 0, about: '' };
    this.specService.addService(spec._id!, newService).subscribe({
      next: () => this.loadSpecializations(),
      error: () => this.error = 'Failed to add service'
    });
  }

  updateService(spec: Specialization, service: Service) {
    this.specService.updateService(spec._id!, service._id!, service).subscribe({
      next: () => this.loadSpecializations(),
      error: () => this.error = 'Failed to update service'
    });
  }

  deleteService(spec: Specialization, service: Service) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: { message: 'Are you sure you want to delete this service?' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.specService.deleteService(spec._id!, service._id!).subscribe({
          next: () => this.loadSpecializations(),
          error: () => this.error = 'Failed to delete service'
        });
      }
    });
  }

  onEditField(spec: Specialization) {
    spec.editMode = true;
  }

  saveEditSpecialization(spec: Specialization) {
    this.updateSpecialization(spec);
    spec.editMode = false;
  }

  cancelEditSpecialization(spec: Specialization) {
    this.loadSpecializations(); // reloads from API, resets edits
    spec.editMode = false;
  }

  isSpecializationValid(spec: Partial<Specialization> | Specialization): boolean {
    if (!spec || !spec.name) return false;
    if (!spec.services || !spec.services.length) return false;
    for (const s of spec.services) {
      if (!s.name || !s.price || s.price <= 0) return false;
    }
    return true;
  }

  isSpecialityAlreadyAdded(optionName: string, currentName?: string): boolean {
    return this.specializations.some(s => s.name === optionName && s.name !== currentName);
  }

  isServiceAlreadySelected(option: string, services: any[], currentIndex: number): boolean {
    return services.some((s, idx) => s.name === option && idx !== currentIndex);
  }
}
