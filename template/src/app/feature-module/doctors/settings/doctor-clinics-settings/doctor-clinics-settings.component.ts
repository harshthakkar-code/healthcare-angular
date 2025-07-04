import { Component, OnInit } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import api from 'src/app/shared/api/axios';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../../doctor-specialities/confirm-delete-dialog.component';

@Component({
    selector: 'app-doctor-clinics-settings',
    templateUrl: './doctor-clinics-settings.component.html',
    styleUrl: './doctor-clinics-settings.component.scss',
    standalone: false
})
export class DoctorClinicsSettingsComponent implements OnInit {
  public routes = routes;
  clinicsForm!: FormGroup;
  doctorId!: string | null;
  loading = false;

  constructor(private fb: FormBuilder, private dialog: MatDialog) {}

  ngOnInit() {
    this.doctorId = this.getDoctorId();
    this.clinicsForm = this.fb.group({
      clinics: this.fb.array([])
    });
    if (this.doctorId) {
      this.fetchClinics();
    }
    if (this.clinicsArray.length > 0) {
      (this.clinicsArray.at(0) as FormGroup).markAllAsTouched();
    }
  }

  private getDoctorId(): string | null {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id || user._id || null;
    } catch {
      return null;
    }
  }

  get clinicsArray() {
    return this.clinicsForm.get('clinics') as FormArray;
  }

  fetchClinics() {
    if (!this.doctorId) return;
    this.loading = true;
    api.get(`/doctor-settings/${this.doctorId}`)
      .then((response) => {
        const data = response.data;
        const clinicsArr = Array.isArray(data.clinicsSettings)
          ? data.clinicsSettings
          : Array.isArray(data)
            ? data
            : [];
        this.clinicsArray.clear();
        clinicsArr.forEach((clinic: any) => {
          this.clinicsArray.push(this.fb.group({
            clinicName: [clinic.clinicName || '', Validators.required],
            location: [clinic.location || '', Validators.required],
            address: [clinic.address || '', Validators.required],
            gallery: this.fb.array((clinic.gallery || []).map((img: string) => this.fb.control(img)))
          }));
        });
        this.loading = false;
      })
      .catch(() => { this.loading = false; });
  }

  addEducationFunc() {
    this.clinicsArray.push(this.fb.group({
      clinicName: ['', Validators.required],
      location: ['', Validators.required],
      address: ['', Validators.required],
      gallery: this.fb.array([])
    }));
    (this.clinicsArray.at(this.clinicsArray.length - 1) as FormGroup).markAllAsTouched();
  }

  async deleteEducationFunc(index: number) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: { message: 'Are you sure you want to delete this clinic?' }
    });
    const result = await dialogRef.afterClosed().toPromise();
    if (result) {
      this.clinicsArray.removeAt(index);
    }
  }

  saveClinics() {
    if (this.clinicsForm.invalid || !this.doctorId) {
      this.clinicsForm.markAllAsTouched();
      this.clinicsArray.controls.forEach(c => (c as FormGroup).markAllAsTouched());
      return;
    }
    this.loading = true;
    const payload = {
      doctorId: this.doctorId,
      clinicsSettings: this.clinicsForm.value.clinics
    };
    api.post(`/doctor-settings`, payload)
      .then(() => {
        this.loading = false;
        this.fetchClinics();
      })
      .catch(() => { this.loading = false; });
  }

  getGalleryArray(clinicIndex: number): FormArray {
    return (this.clinicsArray.at(clinicIndex) as FormGroup).get('gallery') as FormArray;
  }

  addGalleryImage(clinicIndex: number, imageUrl: string) {
    this.getGalleryArray(clinicIndex).push(this.fb.control(imageUrl));
  }

  removeGalleryImage(clinicIndex: number, imgIndex: number) {
    this.getGalleryArray(clinicIndex).removeAt(imgIndex);
  }

  onGalleryFileChange(event: Event, clinicIndex: number) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const imageUrl = reader.result as string;
        this.addGalleryImage(clinicIndex, imageUrl);
      };
      reader.readAsDataURL(file);
    }
  }
}
