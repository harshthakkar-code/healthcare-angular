import { Component, OnInit } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import api from 'src/app/shared/api/axios';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../../doctor-specialities/confirm-delete-dialog.component';
import { uploadImage } from 'src/app/shared/api/image-upload';

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
  logoPreviews: string[] = [];

  constructor(private fb: FormBuilder, private dialog: MatDialog) {}

  ngOnInit() {
    this.doctorId = this.getDoctorId();
    this.educationForm = this.fb.group({
      education: this.fb.array([])
    });
    if (this.doctorId) {
      this.fetchEducation();
    }
    // Removed markAllAsTouched() from here to prevent showing errors on initial load
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
        this.logoPreviews = [];
        educationArr.forEach((edu: any) => {
          this.educationArray.push(this.fb.group({
            institution: [edu.institution || '', Validators.required],
            course: [edu.course || '', Validators.required],
            startDate: [edu.startDate ? new Date (edu.startDate) : '', Validators.required],
            endDate: [edu.endDate ? new Date (edu.endDate) : '', Validators.required],
            years: [edu.years || '', Validators.required],
            description: [edu.description || '', Validators.required],
            logo: [edu.logo || '']
          }));
          this.logoPreviews.push(edu.logo || '');
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
      description: ['', Validators.required],
      logo: ['']
    }));
    this.logoPreviews.push('');
    (this.educationArray.at(this.educationArray.length - 1) as FormGroup).markAllAsTouched();
  }

  async onLogoChange(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      // Show local preview
      this.logoPreviews[index] = URL.createObjectURL(file);
      // Upload to server
      try {
        const imageUrl = await uploadImage(file);
        this.educationArray.at(index).get('logo')?.setValue(imageUrl);
        this.logoPreviews[index] = imageUrl;
      } catch (e) {
        // Optionally show error
        this.logoPreviews[index] = '';
      }
    }
  }

  async deleteEducationFunc(index: number) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: { message: 'Are you sure you want to delete this education?' }
    });
    const result = await dialogRef.afterClosed().toPromise();
    if (result) {
      this.educationArray.removeAt(index);
      this.logoPreviews.splice(index, 1);
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
