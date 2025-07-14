import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { routes } from 'src/app/shared/routes/routes';
import api from 'src/app/shared/api/axios';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from '../../doctor-specialities/confirm-delete-dialog.component';
import { uploadImage } from 'src/app/shared/api/image-upload';

export interface Fruit {
  name: string;
}
interface medical {
  value?: string;
}

@Component({
    selector: 'app-doctor-profile-settings',
    templateUrl: './doctor-profile-settings.component.html',
    styleUrl: './doctor-profile-settings.component.scss',
    standalone: false
})
export class DoctorProfileSettingsComponent implements OnInit {
  public routes = routes;

  public education = [0];
  public experience = [0];
  public awards = [0];
  public memberships = [0];
  public registrations = [0];

  settingsForm: FormGroup;
  doctorId: string | null = null;
  apiUrl = '/doctor-settings';

  languageOptions = ['English', 'German', 'portugese'];

  knownLanguages: string[] = [];
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  profileImgUrl: string = '';
  uploading: boolean = false;

  getDoctorId(): string | null {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id || user._id || null;
    } catch {
      return null;
    }
  }

  constructor(private fb: FormBuilder, private http: HttpClient, private dialog: MatDialog) {
    this.settingsForm = this.fb.group({
      profileSettings: this.fb.group({
        fullName: ['', Validators.required],
        lastName: ['', Validators.required],
        displayName: ['', Validators.required],
        designation: ['', Validators.required],
        phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
        email: ['', [Validators.required, Validators.email]],
        knownLanguages: ['', Validators.required],
        memberships: this.fb.array([
          this.fb.group({
            title: ['', Validators.required],
            aboutMembership: [''],
          })
        ]),
      }),
    });
    // Mark the default membership as touched for validation
    const memberships = this.settingsForm.get('profileSettings.memberships') as FormArray;
    memberships.at(0).markAllAsTouched();
  }

  get membershipsFormArray(): FormArray {
    return (this.settingsForm.get('profileSettings.memberships') as FormArray);
  }

  fetchAndPatchUserFields() {
    api.get('/auth/me').then((response: any) => {
      const user = response.data;
      console.log(user);
      this.settingsForm.get('profileSettings')?.patchValue({
        fullName: user.fullName || user.name || '',
        lastName: user.lastName || '',
        displayName: user.displayName || '',
        designation: user.designation || '',
        phone: user.phone || '',
        email: user.email || '',
        knownLanguages: Array.isArray(user.knownLanguages)
          ? user.knownLanguages.join(', ')
          : user.knownLanguages || '',
        // Add any other fields you want to sync
      });
      // Patch memberships array if present
      if (user.memberships && Array.isArray(user.memberships)) {
        const membershipsArray = this.membershipsFormArray;
        membershipsArray.clear();
        user.memberships.forEach((m: any) => {
          membershipsArray.push(this.fb.group({
            title: [m.title, Validators.required],
            aboutMembership: [m.aboutMembership]
          }));
        });
        if (user.memberships.length === 0) {
          membershipsArray.push(this.fb.group({
            title: ['', Validators.required],
            aboutMembership: ['']
          }));
        }
      }
    });
  }

  ngOnInit() {
    this.doctorId = this.getDoctorId();
    this.fetchAndPatchUserFields();
    if (this.doctorId) {
      this.getDoctorSettings();
    }
  }

  getDoctorSettings() {
    if (!this.doctorId) return;
    api.get(`${this.apiUrl}/${this.doctorId}`)
      .then((response) => {
        const data = response.data;
        if (data && Array.isArray(data.profileSettings) && data.profileSettings.length > 0) {
          const profile = data.profileSettings[0];
          this.knownLanguages = Array.isArray(profile.knownLanguages) ? profile.knownLanguages : [];
          this.settingsForm.get('profileSettings.knownLanguages')?.setValue(this.knownLanguages);

          // Patch memberships dynamically
          const membershipsArray = this.membershipsFormArray;
          membershipsArray.clear();
          if (Array.isArray(profile.memberships) && profile.memberships.length > 0) {
            profile.memberships.forEach((m: any) => {
              membershipsArray.push(this.fb.group({
                title: [m.title, Validators.required],
                aboutMembership: [m.aboutMembership]
              }));
            });
          } else {
            membershipsArray.push(this.fb.group({
              title: ['', Validators.required],
              aboutMembership: ['']
            }));
          }

          // Patch the rest of the profile fields (excluding memberships)
          const { memberships, ...restProfile } = profile;
          this.settingsForm.get('profileSettings')?.patchValue(restProfile);

          // Set profile image URL for preview
          this.profileImgUrl = profile.profileImgUrl || '';
        }
      })
      .catch((err) => {
        // Optionally handle not found or other errors
      });
  }

  addLanguage(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && !this.knownLanguages.includes(value)) {
      this.knownLanguages.push(value);
      this.settingsForm.get('profileSettings.knownLanguages')?.setValue(this.knownLanguages);
    }
    if (event.chipInput) {
      event.chipInput.clear();
    }
  }

  removeLanguage(lang: string): void {
    const index = this.knownLanguages.indexOf(lang);
    if (index >= 0) {
      this.knownLanguages.splice(index, 1);
      this.settingsForm.get('profileSettings.knownLanguages')?.setValue(this.knownLanguages);
    }
  }

  saveChanges() {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      this.membershipsFormArray.controls.forEach(c => (c as FormGroup).markAllAsTouched());
      return;
    }
    if (!this.doctorId) return;
    // Get the latest memberships array values
    const memberships = this.membershipsFormArray.value;
    // Get the current profileSettings from the form
    const profileSettingsForm = this.settingsForm.value.profileSettings;
    // Ensure image URL and time are included
    const profileSettings = {
      ...profileSettingsForm,
      memberships,
      profileImgUrl: this.profileImgUrl || '',
      profileImgUpdatedAt: this.profileImgUrl ? new Date().toISOString() : profileSettingsForm.profileImgUpdatedAt
    };
    const payload = {
      doctorId: this.doctorId,
      ...this.settingsForm.value,
      profileSettings: [profileSettings]
    };
    api.post(this.apiUrl, payload)
      .then((res) => {
        // Optionally show success message
      })
      .catch((err) => {
        // Optionally show error message
      });
  }

  removeProfileImage() {
    this.profileImgUrl = '';
    this.patchDoctorProfileImage('');
  }

  addEducationFunc() {
    this.education.push(1);
  }
  dltEducationFunc(index: number) {
    this.education.splice(index, 1);
  }

  addExperienceFunc() {
    this.experience.push(1);
  }
  dltExperienceFunc(index: number) {
    this.experience.splice(index, 1);
  }

  addAwardsFunc() {
    this.awards.push(1);
  }
  dltAwardsFunc(index: number) {
    this.awards.push(index, 1);
  }

  addMembershipsFunc() {
    const group = this.fb.group({
      title: ['', Validators.required],
      aboutMembership: ['']
    });
    group.markAsTouched(); 
    this.membershipsFormArray.push(group);
  }
  
  async dltMembershipsFunc(index: number) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: { message: 'Are you sure you want to delete this membership?' }
    });
    const result = await dialogRef.afterClosed().toPromise();
    if (result) {
      this.membershipsFormArray.removeAt(index);
    }
  }

  addRegistrationsFunc() {
    this.registrations.push(1);
  }
  dltRegistrationsFunc(index: number) {
    this.registrations.splice(index, 1);
  }

  medical: medical[] = [{}];

  addMedical() {
    this.medical.push({});
  }

  dltMedical(index: number) {
    this.medical.splice(index, 1);
  }

  getMembershipGroup(i: number): FormGroup {
    return this.membershipsFormArray.at(i) as FormGroup;
  }

  onProfileImageSelected = async (event: any) => {
    const file = event.target.files[0];
    if (!file) return;
    this.uploading = true;
    console.log(file)
    try {
      const imageUrl = await uploadImage(file);
      this.profileImgUrl = imageUrl; // For preview
      this.uploading = false;
      this.patchDoctorProfileImage(imageUrl);
    } catch (err) {
      this.uploading = false;
      // Optionally show error
    }
  }

  patchDoctorProfileImage(imageUrl: string) {
    if (!this.doctorId) return;
    // Get the current profileSettings from the form
    const currentProfile = this.settingsForm.value.profileSettings;
    const updatedProfile = {
      ...currentProfile,
      profileImgUrl: imageUrl,
      profileImgUpdatedAt: new Date().toISOString()
    };
    const payload = {
      doctorId: this.doctorId,
      profileSettings: [updatedProfile]
    };
    api.post(this.apiUrl, payload)
      .then((res) => {
        // Optionally update local state, show success, etc.
      })
      .catch((err) => {
        // Optionally show error
      });
  }
}
