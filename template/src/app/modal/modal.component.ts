/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexStroke,
  ApexGrid,
  ApexPlotOptions,
  ApexYAxis,
  ApexLegend,
  ApexTooltip,
  ApexResponsive,
  ApexFill,
} from 'ng-apexcharts';
import { Router } from '@angular/router';
import { SlotService } from '../feature-module/doctors/available-timings/slot.service';
import { SlotModalService } from '../feature-module/doctors/available-timings/slot-modal.service';
import { forkJoin } from 'rxjs';
import { DependantService } from '../feature-module/patients/dependent/dependant.service';
import { DependantEditService } from 'src/app/shared/data/dependant-edit.service';
import { uploadImage } from 'src/app/shared/api/image-upload';

export type ChartOptions = {
  series: ApexAxisChartSeries | any;
  chart: ApexChart | any;
  xaxis: ApexXAxis | any;
  dataLabels: ApexDataLabels | any;
  grid: ApexGrid | any;
  stroke: ApexStroke | any;
  title: ApexTitleSubtitle | any;
  plotOptions: ApexPlotOptions | any;
  yaxis: ApexYAxis | any;
  legend: ApexLegend | any;
  tooltip: ApexTooltip | any;
  responsive: ApexResponsive[] | any;
  fill: ApexFill | any;
  labels: string[] | any;
  colors: any;
  markers: any;
  subtitle: any;
};

@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.scss'],
    standalone: false
})
export class ModalComponent implements OnInit {
  public routes = routes;
  myDateValue!: Date;
  date = new Date();
  public time1 = [0];
  public time2 = [0];
  public time3 = [0];
  public hours = [0];

  @ViewChild('chart') chart!: ChartComponent;
  public chartOptionsOne!: Partial<ChartOptions>;
  public chartOptionsTwo!: Partial<ChartOptions>;
  public chartOptionsThree!: Partial<ChartOptions>;
  public chartOptionsFour!: Partial<ChartOptions>;

  @Output() slotCreated = new EventEmitter<void>();
  addSlotForm = {
    startTime: '',
    endTime: '',
    duration: 30,
    interval: 0,
    fees: 0,
    spaces: 1,
    // Add more fields as needed
  };
  savingSlot = false;
  slotApiError: string = '';

  durationOptions = [15, 30, 45, 60];
  selectedDuration = 30;
  slotStartTime = '';
  slotEndTime = '';
  slotError = '';

  // Add Dependant Modal fields
  addDepName = '';
  addDepRelation = '';
  addDepGender = '';
  addDepDob = '';
  addDepProfileImage = '';
  addDepStatus = 'active';
  addDepBloodGroup = '';
  addDepLoading = false;
  addDepProfileImgUrl = '';

  editDependant: any = {};

  constructor(
    private router:Router,
    private slotService: SlotService,
    public slotModalService: SlotModalService,
    private dependantService: DependantService,
    private dependantEditService: DependantEditService
  ) {
    this.chartOptionsOne = {
      series: [
        {
          name: 'BMI',
          data: [10, 41, 35, 51, 49, 62, 69, 91, 148],
        },
      ],
      chart: {
        height: 350,
        type: 'line',
        responsive: true,
        zoom: {
          enabled: false,
        },
      },
      responsive: true,
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'straight',
      },
      title: {
        align: 'left',
      },
      grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'],
          opacity: 0.5,
        },
      },
      xaxis: {
        categories: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
        ],
      },
    };
    this.chartOptionsTwo = {
      series: [
        {
          name: 'HeartRate',
          data: [4, 3, 10, 9, 29, 19, 22, 9, 12, 7, 19, 5, 13, 9, 17, 2, 7, 5],
        },
      ],
      chart: {
        height: 350,
        type: 'line',
      },
      stroke: {
        width: 7,
        curve: 'smooth',
      },
      xaxis: {
        type: 'datetime',
        categories: [
          '1/11/2000',
          '2/11/2000',
          '3/11/2000',
          '4/11/2000',
          '5/11/2000',
          '6/11/2000',
          '7/11/2000',
          '8/11/2000',
          '9/11/2000',
          '10/11/2000',
          '11/11/2000',
          '12/11/2000',
          '1/11/2001',
          '2/11/2001',
          '3/11/2001',
          '4/11/2001',
          '5/11/2001',
          '6/11/2001',
        ],
        tickAmount: 10,
      },
      title: {
        align: 'left',
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          gradientToColors: ['#0de0fe'],
          shadeIntensity: 1,
          type: 'horizontal',
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 100, 100, 100],
        },
      },
      markers: {
        size: 4,
        colors: ['#15558d'],
        strokeColors: '#fff',
        strokeWidth: 2,
        hover: {
          size: 7,
        },
      },
      yaxis: {
        min: -10,
        max: 40,
        title: {},
      },
    };
    this.chartOptionsThree = {
      series: [
        {
          name: 'FBC',
          data: [2.3, 3.1, 4.0, 10.1, 4.0, 3.6, 3.2, 2.3, 1.4, 0.8, 0.5, 0.2],
        },
      ],
      chart: {
        height: 350,
        type: 'bar',
      },
      plotOptions: {
        bar: {
          borderRadius: 10,
          dataLabels: {
            position: 'top',
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val: string) {
          return val + '%';
        },
        offsetY: -20,
        style: {
          fontSize: '12px',
          colors: ['#304758'],
        },
      },

      xaxis: {
        categories: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ],
        position: 'top',
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        crosshairs: {
          fill: {
            type: 'gradient',
            gradient: {
              colorFrom: '#0de0fe',
              colorTo: '#0de0fe',
              stops: [0, 100],
              opacityFrom: 0.4,
              opacityTo: 0.5,
            },
          },
        },
        tooltip: {
          enabled: true,
        },
      },
      yaxis: {
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          show: false,
          formatter: function (val: string) {
            return val + '%';
          },
        },
      },
      title: {
        floating: true,
        offsetY: 330,
        align: 'center',
        style: {
          color: '#444',
        },
      },
    };
    this.chartOptionsFour = {
      series: [
        {
          name: 'Weight',
          data: [34, 44, 54, 21, 12, 43, 33, 23, 66, 66, 58],
        },
      ],
      chart: {
        type: 'line',
        height: 350,
      },
      stroke: {
        curve: 'stepline',
      },
      dataLabels: {
        enabled: false,
      },
      title: {
        align: 'left',
      },
      markers: {
        hover: {
          sizeOffset: 4,
        },
      },
    };
  }
  addTime1() {
    this.time1.push(1);
  }
  addTime2() {
    this.time2.push(1);
  }
  addTime3() {
    this.time3.push(1);
  }
  dltTime1(index: number) {
    this.time1.splice(index, 1);
  }
  dltTime2(index: number) {
    this.time2.splice(index, 1);
  }
  dltTime3(index: number) {
    this.time3.splice(index, 1);
  }
  addHours() {
    this.hours.push(1);
  }
  dltHours(index: number) {
    this.hours.splice(index, 1);
  }
  ngOnInit() {
    // Expose updateEditEndTime for external calls (e.g., from available-timings)
    (window as any).modalComponentRef = this;
    this.myDateValue = new Date();
    this.durationOptions = [15, 30, 45, 60];
    this.setupSlotFormWatchers();
    this.dependantEditService.dependant$.subscribe(dep => {
      if (dep && dep.dob && typeof dep.dob === 'string') {
        dep = { ...dep, dob: new Date(dep.dob) };
      }
      this.editDependant = dep || {};
    });
  }
  onDateChange(newDate: Date) {
    console.log(newDate);
  }
  prescription: any[] = [{}];
  bill: any[] = [{}];


  addPrescription() {
    this.prescription.push({});
  }
  addBill() {
    this.bill.push({});
  }

  dltPrescription(index: number) {
    this.prescription.splice(index, 1);
  }
  dltBill(index: number) {
    this.bill.splice(index, 1);
  }

  async saveSlot() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const doctorId = user._id || user.id || null;
    if (!doctorId) return;
    this.savingSlot = true;
    this.slotApiError = '';
    // Compute the date for the selected day in the current week
    const daysOfWeek = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    monday.setDate(today.getDate() + diff);
    const selectedDay = this.slotModalService.slotForm.day || 'Monday';
    const targetIndex = daysOfWeek.indexOf(selectedDay);
    const mondayIndex = 1; // Monday
    const offset = targetIndex - mondayIndex;
    const date = new Date(monday);
    date.setDate(monday.getDate() + offset);
    // Always get the latest fees value from the form
    const latestFees = this.slotModalService.slotForm.fees;
    const slotData = {
      doctorId,
      date: date.toISOString().slice(0, 10),
      startTime: this.slotModalService.slotForm.startTime,
      endTime: this.slotModalService.slotForm.endTime,
      duration: this.slotModalService.slotForm.duration,
      interval: this.slotModalService.slotForm.interval,
      fees: latestFees,
      spaces: this.slotModalService.slotForm.spaces,
      day: selectedDay,
    };
    // Check for overlap before emitting
    try {
      const res = await this.slotService.checkSlotOverlap(slotData).toPromise();
      console.log(res)
      if (res?.data?.overlap) {
        this.savingSlot = false;
        this.slotApiError = `Slot conflicts with: ${res.data.conflictTimes.join(', ')}`;
        if (this.slotApiError) {
          setTimeout(() => { this.slotApiError = ''; }, 3000);
        }
        // Do NOT close the modal
        return;
      }
    } catch (err) {
      this.savingSlot = false;
      this.slotApiError = 'Error checking slot overlap.';
      setTimeout(() => { this.slotApiError = ''; }, 3000);
      // Do NOT close the modal
      return;
    }
    // No overlap, emit slotData to parent
    this.savingSlot = false;
    this.slotApiError = '';
    this.slotModalService.emitSlotCreated(slotData);
    this.slotModalService.resetForm();
    const modal = document.getElementById('add_slot');
    if (modal) (window as any).bootstrap?.Modal.getOrCreateInstance(modal).hide();
  }

  onSubmit():void{
    this.router.navigateByUrl('/authentication/login-email')
  }

  deleteAllSlotsForDay() {
    console.log("deleteslote")
    const slotIds = this.slotModalService.slotsToDelete || [];
    if (!slotIds.length) return;
    const deleteObservables = slotIds.map(id => this.slotService.deleteSlot(id));
    forkJoin(deleteObservables).subscribe({
      next: () => {
        this.slotModalService.emitSlotsDeleted();
      },
      error: (err) => {
        alert('Failed to delete slots');
        console.error('Delete slots error:', err);
      }
    });
  }

  closeModal() {
    const modal = document.getElementById('delete_slot');
    if (modal) {
      (window as any).bootstrap?.Modal.getOrCreateInstance(modal).hide();
    }
  }

  onStartTimeChange() {
    this.updateEndTime();
  }

  onDurationChange() {
    this.updateEndTime();
  }

  updateEndTime() {
    const startTime = this.slotModalService.slotForm.startTime;
    const duration = this.slotModalService.slotForm.duration;
    if (!startTime || !duration) {
      this.slotModalService.slotForm.endTime = '';
      return;
    }
    const [h, m] = startTime.split(':').map(Number);
    const start = new Date();
    start.setHours(h, m, 0, 0);
    const end = new Date(start.getTime() + duration * 60000);
    const endH = end.getHours().toString().padStart(2, '0');
    const endM = end.getMinutes().toString().padStart(2, '0');
    this.slotModalService.slotForm.endTime = `${endH}:${endM}`;
    this.validateSlotTimes();
  }

  validateSlotTimes() {
    const startTime = this.slotModalService.slotForm.startTime;
    const endTime = this.slotModalService.slotForm.endTime;
    if (startTime && endTime && startTime >= endTime) {
      this.slotError = 'Start time must be before end time.';
    } else {
      this.slotError = '';
    }
  }

  setupSlotFormWatchers() {
    // If using Angular forms, use valueChanges. If not, use a polling or event-based approach.
    // For template-driven forms, use setters or call updateEndTime in (ngModelChange) in the template.
    // Here, we patch the logic to be called from the template:
  }

  getPatientId(): string | null {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id || user._id || null;
    } catch {
      return null;
    }
  }

  async onAddDepImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      try {
        // Optionally, show a loading indicator here
        const url = await uploadImage(file);
        this.addDepProfileImgUrl = url;
      } catch (err) {
        alert('Image upload failed');
      }
    }
  }

  addDependantFromModal(event: Event) {
    event.preventDefault();
    const userId = this.getPatientId();
    if (!userId) return;
    this.addDepLoading = true;
    const data = {
      userId,
      name: this.addDepName,
      relation: this.addDepRelation,
      gender: this.addDepGender,
      dob: this.addDepDob,
      profileImgUrl: this.addDepProfileImgUrl, // <-- use the new variable
      status: this.addDepStatus,
      bloodGroup: this.addDepBloodGroup
    };
    this.dependantService.addDependant(data).subscribe({
      next: () => {
        this.addDepLoading = false;
        this.dependantService.notifyDependantsChanged();
        const modal = document.getElementById('add_dependent');
        if (modal) (window as any).bootstrap?.Modal.getOrCreateInstance(modal).hide();
        this.addDepName = '';
        this.addDepRelation = '';
        this.addDepGender = '';
        this.addDepDob = '';
        this.addDepProfileImgUrl = '';
        this.addDepStatus = 'active';
        this.addDepBloodGroup = '';
      },
      error: () => {
        this.addDepLoading = false;
      }
    });
  }

  removeEditDepImage() {
    if (this.editDependant) {
      this.editDependant.profileImage = null;
      this.editDependant.profileImagePreview = '';
      this.editDependant.profileImgUrl = '';
      this.editDependant._imageRemoved = true; // flag for backend update
    }
  }

  saveEditDependant() {
    if (!this.editDependant || !this.editDependant._id) return;
    let data: any = { ...this.editDependant };
    if (data.dob instanceof Date) {
      data.dob = data.dob.toISOString();
    }
    // Always send profileImgUrl (can be empty string)
    data.profileImgUrl = this.editDependant.profileImgUrl || '';
    // Remove temp preview and flag before sending
    delete data.profileImagePreview;
    delete data._imageRemoved;
    this.dependantService.updateDependant(data._id, data).subscribe({
      next: () => {
        this.dependantService.notifyDependantsChanged();
        const modal = document.getElementById('edit_dependent');
        if (modal) (window as any).bootstrap?.Modal.getOrCreateInstance(modal).hide();
      }
    });
  }

  async onFileChange(input: HTMLInputElement) {
    if (this.editDependant && input.files && input.files.length > 0) {
      const file = input.files[0];
      this.editDependant.profileImage = file;
      // Show preview for the new file
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editDependant.profileImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);

      // Upload to AWS and set the URL
      try {
        const url = await uploadImage(file);
        this.editDependant.profileImgUrl = url;
      } catch (err) {
        alert('Image upload failed');
      }
    }
  }

  deleteDependant() {
    if (!this.editDependant || !this.editDependant._id) return;
    this.dependantService.deleteDependant(this.editDependant._id).subscribe({
      next: () => {
        this.dependantService.notifyDependantsChanged();
        const modal = document.getElementById('delete_modal');
        if (modal) (window as any).bootstrap?.Modal.getOrCreateInstance(modal).hide();
      }
    });
  }

  confirmDeleteGlobal() {
    window.dispatchEvent(new CustomEvent('confirmDelete'));
  }

  savingEditSlot = false;
  editSlotError: string = '';

  async updateSlot() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const doctorId = user._id || user.id || null;
    if (!doctorId) return;
    this.savingEditSlot = true;
    this.slotApiError = '';
    // Compute the date for the selected day in the current week
    const daysOfWeek = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    monday.setDate(today.getDate() + diff);
    const selectedDay = this.slotModalService.editSlotForm.day || 'Monday';
    const targetIndex = daysOfWeek.indexOf(selectedDay);
    const mondayIndex = 1; // Monday
    const offset = targetIndex - mondayIndex;
    const date = new Date(monday);
    date.setDate(monday.getDate() + offset);
    const latestFees = this.slotModalService.editSlotForm.fees;
    const slotData = {
      doctorId,
      date: date.toISOString().slice(0, 10),
      startTime: this.slotModalService.editSlotForm.startTime,
      endTime: this.slotModalService.editSlotForm.endTime,
      duration: this.slotModalService.editSlotForm.duration,
      interval: this.slotModalService.editSlotForm.interval,
      fees: latestFees,
      spaces: this.slotModalService.editSlotForm.spaces,
      day: selectedDay,
    };
    const slotId = this.slotModalService.editSlotForm.id;
    // Check for overlap before updating
    try {
      const res = await this.slotService.checkSlotOverlap({ ...slotData, id: slotId }).toPromise();
      if (res?.data?.overlap) {
        this.savingEditSlot = false;
        this.editSlotError = `Slot conflicts with: ${res.data.conflictTimes.join(', ')}`;
        if (this.editSlotError) {
          setTimeout(() => { this.editSlotError = ''; }, 3000);
        }
        return;
      }
    } catch (err) {
      this.savingEditSlot = false;
      this.editSlotError = 'Error checking slot overlap.';
      setTimeout(() => { this.editSlotError = ''; }, 3000);
      return;
    }
    // Call backend to update slot
    try {
      await this.slotService.updateSlot(slotId, slotData).toPromise();
      this.savingEditSlot = false;
      this.editSlotError = '';
      this.slotModalService.emitSlotUpdated({ ...slotData, id: slotId });
      this.slotModalService.resetEditForm();
      const modal = document.getElementById('edit_slot');
      if (modal) (window as any).bootstrap?.Modal.getOrCreateInstance(modal).hide();
    } catch (err: any) {
      this.savingEditSlot = false;
      this.editSlotError = err?.error?.error || 'Failed to update slot.';
      setTimeout(() => { this.editSlotError = ''; }, 3000);
    }
  }

  onEditStartTimeChange() {
    this.updateEditEndTime();
  }

  onEditDurationChange() {
    this.updateEditEndTime();
  }

  updateEditEndTime() {
    const startTime = this.slotModalService.editSlotForm.startTime;
    const duration = this.slotModalService.editSlotForm.duration;
    if (!startTime || !duration) {
      this.slotModalService.editSlotForm.endTime = '';
      return;
    }
    const [h, m] = startTime.split(':').map(Number);
    const start = new Date();
    start.setHours(h, m, 0, 0);
    const end = new Date(start.getTime() + duration * 60000);
    const endH = end.getHours().toString().padStart(2, '0');
    const endM = end.getMinutes().toString().padStart(2, '0');
    this.slotModalService.editSlotForm.endTime = `${endH}:${endM}`;
    this.validateEditSlotTimes();
  }

  validateEditSlotTimes() {
    const startTime = this.slotModalService.editSlotForm.startTime;
    const endTime = this.slotModalService.editSlotForm.endTime;
    if (startTime && endTime && startTime >= endTime) {
      this.editSlotError = 'Start time must be before end time.';
    } else {
      this.editSlotError = '';
    }
  }
}
