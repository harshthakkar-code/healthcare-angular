import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from 'src/app/shared/routes/routes';
import api from 'src/app/shared/api/axios';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from 'src/app/feature-module/doctors/doctor-specialities/confirm-delete-dialog.component';

@Component({
  selector: 'app-delete-account',
  standalone: false,
  
  templateUrl: './delete-account.component.html',
  styleUrl: './delete-account.component.scss'
})
export class DeleteAccountComponent {
  routes=routes;

  constructor(private router: Router, private dialog: MatDialog) {}

  async deleteAccount() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || user._id;
    if (!userId) {
      // Optionally show a dialog for error
      return;
    }
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: { message: 'Are you sure you want to Permanent delete your account?.' }
    });
    const result = await dialogRef.afterClosed().toPromise();
    if (!result) return;
    try {
      await api.delete(`/auth/user/${userId}`);
      localStorage.clear();
      this.router.navigate(['/login']);
    } catch (err: any) {
      // Optionally show a dialog for error
    }
  }
}
