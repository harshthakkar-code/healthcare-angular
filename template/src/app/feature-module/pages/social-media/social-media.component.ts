import { Component, OnInit } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import api from 'src/app/shared/api/axios';
import jwt_decode from 'jwt-decode';

interface MedicalData {
  id: number;
}

interface DecodedToken {
  id: string;
  name: string;
  role: string;
  // ...other fields if needed
}

@Component({
    selector: 'app-social-media',
    templateUrl: './social-media.component.html',
    styleUrls: ['./social-media.component.scss'],
    standalone: false
})
export class SocialMediaComponent implements OnInit {
  public routes = routes;

  medical: Array<MedicalData> = [];

  userId: string = '';
  name: string = '';
  role: string = '';
  socialMedia: any = {};

  facebookUrl: string = '';
  linkedinUrl: string = '';
  twitterUrl: string = '';
  instagramUrl: string = '';

  showPassword: boolean[] = [false, false, false, false];

  saveSuccess: boolean = false;
  saveError: string = '';

  ngOnInit() {
      this.userId = this.getDoctorId() || '';
      this.getSocialMedia();

  }
  getDoctorId(): string | null {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id || user._id || null;
    } catch {
      return null;
    }
  }
  getSocialMedia() {
    api.get(`/social-media/${this.userId}`)
      .then(res => {
        this.socialMedia = res.data;
        this.facebookUrl = res.data.facebook || '';
        this.linkedinUrl = res.data.linkedin || '';
        this.twitterUrl = res.data.twitter || '';
        this.instagramUrl = res.data.instagram || '';
      })
      .catch(() => {
        this.socialMedia = {};
      });
  }

  upsertSocialMediaAuto() {
    const data = {
      facebook: this.facebookUrl,
      linkedin: this.linkedinUrl,
      twitter: this.twitterUrl,
      instagram: this.instagramUrl,
    };
    this.upsertSocialMedia(data);
  }

  upsertSocialMedia(data: any) {
    api.post('/social-media', data)
      .then(res => {
        this.socialMedia = res.data;
        this.saveSuccess = true;
        this.saveError = '';
        setTimeout(() => { this.saveSuccess = false; }, 2000);
      })
      .catch(() => {
        this.saveError = 'Failed to save.';
        this.saveSuccess = false;
      });
  }

  togglePassword(index: number) {
    this.showPassword[index] = !this.showPassword[index];
  }

  addMedical() {
    const newRecord: MedicalData = {
      id: 1,
    };
    this.medical.push(newRecord);
  }
}
