import { Component, OnInit } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import api from 'src/app/shared/api/axios';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../../doctor-specialities/confirm-delete-dialog.component';
import { uploadImage } from 'src/app/shared/api/image-upload';

@Component({
    selector: 'app-doctor-experience-settings',
    templateUrl: './doctor-experience-settings.component.html',
    styleUrl: './doctor-experience-settings.component.scss',
    standalone: false
})
export class DoctorExperienceSettingsComponent implements OnInit {
  public routes = routes;
  experiencesForm!: FormGroup;
  doctorId!: string | null;
  loading = false;
  logoPreviews: string[] = [];

  constructor(private fb: FormBuilder, private dialog: MatDialog) {}

  ngOnInit() {
    this.doctorId = this.getDoctorId();
    this.experiencesForm = this.fb.group({
      experiences: this.fb.array([])
    });
    if (this.doctorId) {
      this.fetchExperiences();
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

  get experiences() {
    return this.experiencesForm.get('experiences') as FormArray;
  }

  fetchExperiences() {
    if (!this.doctorId) return;
    this.loading = true;
    api.get(`/doctor-settings/${this.doctorId}`)
      .then((response) => {
        const data = response.data;
        const experiencesArr = Array.isArray(data.experienceSettings)
          ? data.experienceSettings
          : Array.isArray(data)
            ? data
            : [];
        this.experiences.clear();
        this.logoPreviews = [];
        experiencesArr.forEach((exp: any) => {
          this.experiences.push(this.fb.group({
            title: [exp.title || '', Validators.required],
            hospital: [exp.hospital || '', Validators.required],
            year: [exp.year || '', Validators.required],
            location: [exp.location || '', Validators.required],
            employment: [exp.employment || ''],
            description: [exp.description || '', Validators.required],
            startDate: [exp.startDate ? new Date(exp.startDate) : '', Validators.required],
            endDate: [exp.endDate ? new Date(exp.endDate) : '', Validators.required],
            currentlyWorking: [exp.currentlyWorking || false],
            logo: [exp.logo || '']
          }));
          this.logoPreviews.push(exp.logo || '');
        });
        this.loading = false;
      })
      .catch(() => { this.loading = false; });
  }

  addEducationFunc() {
    this.experiences.push(this.fb.group({
      title: ['', Validators.required],
      hospital: ['', Validators.required],
      year: ['', Validators.required],
      location: ['', Validators.required],
      employment: [''],
      description: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      currentlyWorking: [false],
      logo: ['']
    }));
    this.logoPreviews.push('');
    (this.experiences.at(this.experiences.length - 1) as FormGroup).markAllAsTouched();
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
        this.experiences.at(index).get('logo')?.setValue(imageUrl);
        this.logoPreviews[index] = imageUrl;
      } catch (e) {
        // Optionally show error
        this.logoPreviews[index] = '';
      }
    }
  }

  async deleteEducationFunc(index: number) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: { message: 'Are you sure you want to delete this experience?' }
    });
    const result = await dialogRef.afterClosed().toPromise();
    if (result) {
      this.experiences.removeAt(index);
      this.logoPreviews.splice(index, 1);
    }
  }

  saveExperiences() {
    if (this.experiencesForm.invalid || !this.doctorId) {
      this.experiencesForm.markAllAsTouched();
      this.experiences.controls.forEach(c => (c as FormGroup).markAllAsTouched());
      return;
    }
    this.loading = true;
    const payload = {
      doctorId: this.doctorId,
      experienceSettings: this.experiencesForm.value.experiences
    };
    api.post(`/doctor-settings`, payload)
      .then(() => {
        this.loading = false;
        this.fetchExperiences();
      })
      .catch(() => { this.loading = false; });
  }
}
