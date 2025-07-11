import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { uploadImage } from 'src/app/shared/api/image-upload';
import api from 'src/app/shared/api/axios';
import { routes } from 'src/app/shared/routes/routes';
@Component({
    selector: 'app-profile-settings',
    templateUrl: './profile-settings.component.html',
    styleUrls: ['./profile-settings.component.scss'],
    standalone: false
})
export class ProfileSettingsComponent implements OnInit {
  public routes = routes;
  date = new Date();
  myDateValue!: Date ;
  profile: any = null;
  user: any = null;
  loading = true;
  error: string | null = null;
  profileForm: FormGroup;
  profileImgUrl: string = '';
  uploading: boolean = false;

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dob: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      blood: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      pincode: ['', Validators.required],
      // Add other fields as needed, matching the profile object
    });
  }

  ngOnInit() {
    this.loadProfile();
    this.myDateValue = new Date();
  }

  loadProfile() {
    this.loading = true;
    api.get('/patient/profile')
      .then(res => {
        this.profile = res.data;
        this.user = res.data.user;
        this.profileForm.patchValue(this.profile); // Patch form values
        this.profileImgUrl = this.profile.profileImgUrl || '';
        this.loading = false;
      })
      .catch(() => {
        this.error = 'Failed to load profile.';
        this.loading = false;
      });
  }

  updateProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    api.put('/patient/profile', this.profileForm.value)
      .then(res => {
        this.profile = res.data;
        this.profileForm.patchValue(this.profile); // Keep form in sync
        this.loading = false;
      })
      .catch((err) => {
        // If profile not found, create it
        if (err.response && (err.response.status === 404 || (err.response.data && err.response.data.message && err.response.data.message.includes('not found')))) {
          this.createProfile(this.profileForm.value);
        } else {
          this.error = 'Failed to update profile.';
          this.loading = false;
        }
      });
  }

  createProfile(data: any) {
    api.post('/patient/profile', data)
      .then(res => {
        this.profile = res.data.profile;
        this.profileForm.patchValue(this.profile);
        this.loading = false;
        this.loadProfile();
      })
      .catch(() => {
        this.error = 'Failed to create profile.';
        this.loading = false;
      });
  }

  onDateChange(newDate: Date) {
    // Optionally update form if needed
  }

  async onProfileImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.uploading = true;
    try {
      const imageUrl = await uploadImage(file);
      this.profileImgUrl = imageUrl;
      this.uploading = false;
      this.patchPatientProfileImage(imageUrl);
    } catch (err) {
      this.uploading = false;
      // Optionally show error
    }
  }

  patchPatientProfileImage(imageUrl: string) {
    const payload = {
      profileImgUrl: imageUrl,
      // ...other fields as needed
    };
    api.put('/patient/profile', payload).then(() => {
      // Optionally show success
    });
  }

  removeProfileImage() {
    this.profileImgUrl = '';
    this.patchPatientProfileImage('');
  }

  saveChanges() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    const payload = {
      ...this.profileForm.value,
      profileImgUrl: this.profileImgUrl || ''
    };
    api.put('/patient/profile', payload).then(() => {
      // Optionally show success
    });
  }
}
