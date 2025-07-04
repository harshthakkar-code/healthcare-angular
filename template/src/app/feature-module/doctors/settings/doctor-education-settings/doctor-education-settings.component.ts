import { Component, OnInit } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import api from 'src/app/shared/api/axios';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../../doctor-specialities/confirm-delete-dialog.component';

@Component({
    selector: 'app-doctor-education-settings',
    templateUrl: './doctor-education-settings.component.html',
    styleUrl: './doctor-education-settings.component.scss',
    standalone: false
})
export class DoctorEducationSettingsComponent implements OnInit {
  public routes = routes;
  educationForm!: FormGroup;
  doctorId!: string | null;
  loading = false;

  constructor(private fb: FormBuilder, private dialog: MatDialog) {}

  ngOnInit() {
    this.doctorId = this.getDoctorId();
    this.educationForm = this.fb.group({
      education: this.fb.array([])
    });
    if (this.doctorId) {
      this.fetchEducation();
    }
    if (this.educationArray.length > 0) {
      (this.educationArray.at(0) as FormGroup).markAllAsTouched();
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

  get educationArray() {
    return this.educationForm.get('education') as FormArray;
  }

  fetchEducation() {
    if (!this.doctorId) return;
    this.loading = true;
    api.get(`/doctor-settings/${this.doctorId}`)
      .then((response) => {
        const data = response.data;
        const educationArr = Array.isArray(data.educationSettings)
          ? data.educationSettings
          : Array.isArray(data)
            ? data
            : [];
        this.educationArray.clear();
        educationArr.forEach((edu: any) => {
          this.educationArray.push(this.fb.group({
            institution: [edu.institution || '', Validators.required],
            course: [edu.course || '', Validators.required],
            startDate: [edu.startDate || '', Validators.required],
            endDate: [edu.endDate || '', Validators.required],
            years: [edu.years || '', Validators.required],
            description: [edu.description || '', Validators.required]
          }));
        });
        this.loading = false;
      })
      .catch(() => { this.loading = false; });
  }

  addEducationFunc() {
    this.educationArray.push(this.fb.group({
      institution: ['', Validators.required],
      course: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      years: ['', Validators.required],
      description: ['', Validators.required]
    }));
    (this.educationArray.at(this.educationArray.length - 1) as FormGroup).markAllAsTouched();
  }

  async deleteEducationFunc(index: number) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: { message: 'Are you sure you want to delete this education?' }
    });
    const result = await dialogRef.afterClosed().toPromise();
    if (result) {
      this.educationArray.removeAt(index);
    }
  }

  saveEducation() {
    if (this.educationForm.invalid || !this.doctorId) {
      this.educationForm.markAllAsTouched();
      this.educationArray.controls.forEach(c => (c as FormGroup).markAllAsTouched());
      return;
    }
    this.loading = true;
    const payload = {
      doctorId: this.doctorId,
      educationSettings: this.educationForm.value.education
    };
    api.post(`/doctor-settings`, payload)
      .then(() => {
        this.loading = false;
        this.fetchEducation();
      })
      .catch(() => { this.loading = false; });
  }
}
