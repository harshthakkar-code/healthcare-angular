import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { routes } from 'src/app/shared/routes/routes';
import intlTelInput from 'intl-tel-input';
@Component({
    selector: 'app-login-phone-otp',
    templateUrl: './login-phone-otp.component.html',
    styleUrls: ['./login-phone-otp.component.scss'],
    standalone: false
})
export class LoginPhoneOtpComponent {
  public routes = routes;
  public togglePasswordClass = false;
  public selectedFieldSet = [0];

  phoneForm = new FormGroup({
    phone: new FormControl(undefined, [Validators.required]),
  });

  togglePassword() {
    this.togglePasswordClass = !this.togglePasswordClass;
  }

  constructor(private router: Router) {}

  public navigation() {
    this.router.navigate([routes.mobileOtp]);
  }
  ngAfterViewInit(): void {
    const input = document.querySelector('#phone') as HTMLInputElement;
    intlTelInput(input, {
      initialCountry: 'us',
      preferredCountries: ['us', 'gb', 'in'],
      utilsScript: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js'
    }as any);
    // Restrict input to numbers, "+", and allowed characters
    input.addEventListener('input', () => {
      input.value = input.value.replace(/[^0-9+()-\s]/g, ''); // Removes any character not allowed
    });
        
  }
}
