import { Component, OnInit } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import { DataService } from 'src/app/shared/data/data.service';
@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    standalone: false
})
export class ProfileComponent implements OnInit {
  public routes = routes;
  public profile: any = {};
  public editProfile: any = {};
  public selectedValue = '' ;
  date = new Date();
  myDateValue!: Date ;
  selectedList = [
    {value: 'Choose Status'},
    {value: 'Complete'},
    {value: 'Inprogress'},
  ];
  constructor(private dataService: DataService) {}
  ngOnInit() {
    this.myDateValue = new Date();
    this.dataService.getProfile().subscribe(profile => {
      this.profile = profile;
    });
  }
  openEditModal() {
    this.editProfile = { ...this.profile };
  }
  updateProfile() {
    this.dataService.updateProfile(this.editProfile).subscribe(updated => {
      this.profile = updated;
      // Close modal
      const modal = document.getElementById('edit_personal_details');
      if (modal) {
        (window as any).bootstrap?.Modal.getOrCreateInstance(modal).hide();
      }
    });
  }
  onDateChange(newDate: Date) {
    console.log(newDate);
  }
}
