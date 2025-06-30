import { Component } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';

@Component({
  selector: 'app-two-factor-authentication',
  standalone: false,
  
  templateUrl: './two-factor-authentication.component.html',
  styleUrl: './two-factor-authentication.component.scss'
})
export class TwoFactorAuthenticationComponent {
routes=routes;

}
