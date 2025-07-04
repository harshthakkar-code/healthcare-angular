import { Component, OnInit } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import api from 'src/app/shared/api/axios';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../../doctor-specialities/confirm-delete-dialog.component';

@Component({
    selector: 'app-doctor-insurance-settings',
    templateUrl: './doctor-insurance-settings.component.html',
    styleUrl: './doctor-insurance-settings.component.scss',
    standalone: false
})
export class DoctorInsuranceSettingsComponent implements OnInit {
  public routes = routes;
  insuranceForm!: FormGroup;
  doctorId!: string | null;
  loading = false;

  constructor(private fb: FormBuilder, private dialog: MatDialog) {}

  ngOnInit() {
    this.doctorId = this.getDoctorId();
    this.insuranceForm = this.fb.group({
      insurances: this.fb.array([])
    });
    if (this.doctorId) {
      this.fetchInsurances();
    }
    if (this.insurancesArray.length > 0) {
      (this.insurancesArray.at(0) as FormGroup).markAllAsTouched();
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

  get insurancesArray() {
    return this.insuranceForm.get('insurances') as FormArray;
  }

  fetchInsurances() {
    if (!this.doctorId) return;
    this.loading = true;
    api.get(`/doctor-settings/${this.doctorId}`)
      .then((response) => {
        const data = response.data;
        const insurancesArr = Array.isArray(data.insuranceSettings)
          ? data.insuranceSettings
          : Array.isArray(data)
            ? data
            : [];
        this.insurancesArray.clear();
        insurancesArr.forEach((ins: any) => {
          this.insurancesArray.push(this.fb.group({
            insuranceName: [ins.insuranceName || '', Validators.required]
          }));
        });
        this.loading = false;
      })
      .catch(() => { this.loading = false; });
  }

  addEducationFunc() {
    this.insurancesArray.push(this.fb.group({
      insuranceName: ['', Validators.required]
    }));
    (this.insurancesArray.at(this.insurancesArray.length - 1) as FormGroup).markAllAsTouched();
  }

  async deleteEducationFunc(index: number) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: { message: 'Are you sure you want to delete this insurance?' }
    });
    const result = await dialogRef.afterClosed().toPromise();
    if (result) {
      this.insurancesArray.removeAt(index);
    }
  }

  saveInsurances() {
    if (this.insuranceForm.invalid || !this.doctorId) {
      this.insuranceForm.markAllAsTouched();
      this.insurancesArray.controls.forEach(c => (c as FormGroup).markAllAsTouched());
      return;
    }
    this.loading = true;
    const payload = {
      doctorId: this.doctorId,
      insuranceSettings: this.insuranceForm.value.insurances
    };
    api.post(`/doctor-settings`, payload)
      .then(() => {
        this.loading = false;
        this.fetchInsurances();
      })
      .catch(() => { this.loading = false; });
  }
}
