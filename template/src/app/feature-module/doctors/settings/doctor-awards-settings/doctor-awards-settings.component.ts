import { Component, OnInit } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import api from 'src/app/shared/api/axios';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../../doctor-specialities/confirm-delete-dialog.component';

@Component({
    selector: 'app-doctor-awards-settings',
    templateUrl: './doctor-awards-settings.component.html',
    styleUrl: './doctor-awards-settings.component.scss',
    standalone: false
})
export class DoctorAwardsSettingsComponent implements OnInit {
  public routes = routes;
  awardsForm!: FormGroup;
  doctorId!: string | null;
  loading = false;

  constructor(private fb: FormBuilder, private dialog: MatDialog) {}

  ngOnInit() {
    this.doctorId = this.getDoctorId();
    this.awardsForm = this.fb.group({
      awards: this.fb.array([])
    });
    if (this.doctorId) {
      this.fetchAwards();
    }
    if (this.awardsArray.length > 0) {
      (this.awardsArray.at(0) as FormGroup).markAllAsTouched();
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

  get awardsArray() {
    return this.awardsForm.get('awards') as FormArray;
  }

  fetchAwards() {
    if (!this.doctorId) return;
    this.loading = true;
    api.get(`/doctor-settings/${this.doctorId}`)
      .then((response) => {
        const data = response.data;
        const awardsArr = Array.isArray(data.awardsSettings)
          ? data.awardsSettings
          : Array.isArray(data)
            ? data
            : [];
        this.awardsArray.clear();
        awardsArr.forEach((award: any) => {
          this.awardsArray.push(this.fb.group({
            awardName: [award.awardName || '', Validators.required],
            year: [award.year || '', Validators.required],
            description: [award.description || '', Validators.required]
          }));
        });
        this.loading = false;
      })
      .catch(() => { this.loading = false; });
  }

  addAward() {
    this.awardsArray.push(this.fb.group({
      awardName: ['', Validators.required],
      year: ['', Validators.required],
      description: ['', Validators.required]
    }));
    (this.awardsArray.at(this.awardsArray.length - 1) as FormGroup).markAllAsTouched();
  }

  async deleteAward(index: number) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: { message: 'Are you sure you want to delete this award?' }
    });
    const result = await dialogRef.afterClosed().toPromise();
    if (result) {
      this.awardsArray.removeAt(index);
    }
  }

  saveAwards() {
    if (this.awardsForm.invalid || !this.doctorId) {
      this.awardsForm.markAllAsTouched();
      this.awardsArray.controls.forEach(c => (c as FormGroup).markAllAsTouched());
      return;
    }
    this.loading = true;
    const payload = {
      doctorId: this.doctorId,
      awardsSettings: this.awardsForm.value.awards
    };
    api.post(`/doctor-settings`, payload)
      .then(() => {
        this.loading = false;
        this.fetchAwards();
      })
      .catch(() => { this.loading = false; });
  }
}
