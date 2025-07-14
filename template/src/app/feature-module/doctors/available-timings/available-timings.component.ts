/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, Renderer2, OnInit } from '@angular/core';
import { CommonService } from 'src/app/shared/common/common.service';
import { routes } from 'src/app/shared/routes/routes';
import { SlotService } from './slot.service';
import { SlotModalService } from './slot-modal.service';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-available-timings',
    templateUrl: './available-timings.component.html',
    styleUrls: ['./available-timings.component.scss'],
    standalone: false
})
export class AvailableTimingsComponent implements OnInit, OnDestroy {
  public routes = routes;
  public base = '';
  public page = '';
  public last = '';
  selectedClinic: any;
  clinics = [
    {
      name: 'The Family Dentistry Clinic',
      value: 'family_dentistry',
      image: 'assets/img/doctors-dashboard/clinic-01.jpg',
    },
    {
      name: 'Dentistry Clinic',
      value: 'dentistry',
      image: 'assets/img/doctors-dashboard/clinic-02.jpg',
    },
  ];
  public slotsByDay: { [key: string]: any[] } = {};
  public clinicSlotsByDay: { [key: string]: any[] } = {};
  public loading = false;
  public daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  public doctorId: string | null = null;
  public appointmentFees: number = 0;
  public selectedDay: string = 'Monday';
  public selectedSlotId: string | null = null;
  public updateError: string | null = null;
  public pendingSlots: any[] = [];

  constructor(
    private renderer: Renderer2,
    private common: CommonService,
    private slotService: SlotService,
    private slotModalService: SlotModalService
  ) {
    this.selectedClinic = this.clinics[0];
    this.common.base.subscribe((base: string) => {
      this.base = base;
    });
    this.common.page.subscribe((page: string) => {
      this.page = page;
    });
    this.common.last.subscribe((last: string) => {
      this.last = last;
    });
    if (this.page == 'available-timings') {
      this.renderer.addClass(document.body, 'available-timings-img-select');
    }
  }

  ngOnInit(): void {
    this.doctorId = this.getDoctorIdFromLocalStorage();
    console.log('ngOnInit doctorId:', this.doctorId);
    if (this.doctorId) {
      this.fetchSlots();
      this.fetchClinicSlots();
    }
    this.slotModalService.slotCreated$.subscribe((slotData: any) => {
      // Instead of fetching from backend, add to pendingSlots
      if (slotData) {
        this.pendingSlots.push(slotData);
      }
      // this.fetchSlots();
      // this.fetchClinicSlots();
    });
    this.slotModalService.slotsDeleted$.subscribe(() => {
      this.fetchSlots();
      this.fetchClinicSlots();
    });
    this.slotModalService.slotUpdated$.subscribe((slotData: any) => {
      // After editing, refetch slots
      this.fetchSlots();
      this.fetchClinicSlots();
    });
  }

  getDoctorIdFromLocalStorage(): string | null {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
       return user.id || user._id || null;
    } catch {
      return null;
    }
  }
  

  fetchSlots(): void {
    this.loading = true;
    console.log('Fetching slots for doctor:', this.doctorId);
    this.slotService.getSlots(this.doctorId!).subscribe({
      next: (res) => {
        console.log('API response (general):', res);
        const slots = res.data.slots || [];
        this.slotsByDay = {};
        for (const day of this.daysOfWeek) {
          this.slotsByDay[day] = [];
        }
        for (const slot of slots) {
          const date = new Date(slot.date);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
          const normalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1).toLowerCase();
          const weekDate = this.getDateForWeekday(normalizedDay);
          const slotDate = new Date(slot.date).toISOString().slice(0, 10);
          const weekDateISO = new Date(weekDate).toISOString().slice(0, 10);
          console.log(`Checking slot: slotDate=${slotDate}, weekDate=${weekDateISO}, day=${normalizedDay}`);
          if (this.slotsByDay[normalizedDay] && slotDate === weekDateISO) {
            this.slotsByDay[normalizedDay].push(slot);
          }
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('API error (general):', err);
        this.loading = false;
      }
    });
  }

  onClinicChange(): void {
    this.fetchClinicSlots();
  }

  fetchClinicSlots(): void {
    if (!this.doctorId || !this.selectedClinic) return;
    this.loading = true;
    console.log('Fetching clinic slots for doctor:', this.doctorId, 'clinic:', this.selectedClinic);
    this.slotService.getSlots(this.doctorId!).subscribe({
      next: (res) => {
        console.log('API response (clinic):', res);
        const slots = res.slots || [];
        const filtered = slots;
        this.clinicSlotsByDay = {};
        for (const day of this.daysOfWeek) {
          this.clinicSlotsByDay[day] = [];
        }
        for (const slot of filtered) {
          const date = new Date(slot.date);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
          const normalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1).toLowerCase();
          const weekDate = this.getDateForWeekday(normalizedDay);
          const slotDate = new Date(slot.date).toISOString().slice(0, 10);
          const weekDateISO = new Date(weekDate).toISOString().slice(0, 10);
          console.log(`Checking clinic slot: slotDate=${slotDate}, weekDate=${weekDateISO}, day=${normalizedDay}`);
          if (this.clinicSlotsByDay[normalizedDay] && slotDate === weekDateISO) {
            this.clinicSlotsByDay[normalizedDay].push(slot);
          }
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('API error (clinic):', err);
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'available-timings-img-select');
  }

  openAddSlotModal() {
    this.slotModalService.slotForm.fees = this.appointmentFees;
    this.slotModalService.slotForm.day = this.selectedDay;
    const modal = document.getElementById('add_slot');
    if (modal) {
      (window as any).bootstrap?.Modal.getOrCreateInstance(modal).show();
    }
  }

  onDayChange(day: string) {
    this.selectedDay = day;
    const slots = this.slotsByDay[day] || [];
    // Log the slots and their dates for the selected day
    console.log('Selected day changed:', day, 'Slots:', slots.map(slot => ({ startTime: slot.startTime, endTime: slot.endTime, date: slot.date })));
  }

  getSelectedDayDate(): string {
    const daysOfWeek = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const today = new Date();
    const targetDayIndex = daysOfWeek.indexOf(this.selectedDay);
    const date = new Date(today);
    date.setDate(today.getDate() + ((7 + targetDayIndex - today.getDay()) % 7));
    return date.toISOString().slice(0, 10);
  }

  getDateForWeekday(weekday: string): string {
    const daysOfWeek = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
    const monday = new Date(today);
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    monday.setDate(today.getDate() + diff);
    const targetIndex = daysOfWeek.indexOf(weekday);
    const mondayIndex = 1; // Monday
    const offset = targetIndex - mondayIndex;
    const date = new Date(monday);
    date.setDate(monday.getDate() + offset);
    return date.toISOString().slice(0, 10);
  }

  formatTime12(time: string): string {
    if (!time) return '';
    const [hourStr, minuteStr] = time.split(':');
    let hour = parseInt(hourStr, 10);
    const minute = minuteStr.padStart(2, '0');
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minute} ${ampm}`;
  }

  onSlotSelect(slot: any) {
    console.log("test", slot)

    if (slot && slot.fees !== undefined) {
      this.appointmentFees = slot.fees;
      this.selectedSlotId = slot._id || slot.id || null;
    }
  }

  openDeleteSlotModal(slotIds: string[]) {
    this.slotModalService.slotsToDelete = slotIds;
    const modal = document.getElementById('delete_slot');
    if (modal) {
      (window as any).bootstrap?.Modal.getOrCreateInstance(modal).show();
    }
  }

  deleteAllGeneralSlotsForSelectedDay() {
    const slots = this.slotsByDay[this.selectedDay] || [];
    const slotIds = slots.map(slot => slot._id || slot.id);
    this.openDeleteSlotModal(slotIds);
  }

  deleteAllClinicSlotsForSelectedDay() {
    const slots = this.clinicSlotsByDay[this.selectedDay] || [];
    const slotIds = slots.map(slot => slot._id || slot.id);
    this.openDeleteSlotModal(slotIds);
  }

  updateSlotFees() {
    this.updateError = null; // Clear previous error
    if (!this.selectedSlotId) {
      this.updateError = 'No slot selected!';
      setTimeout(() => this.updateError = null, 3000);
      return;
    }
    this.slotService.updateSlot(this.selectedSlotId, { fees: this.appointmentFees }).subscribe({
      next: () => {
        this.fetchSlots();
        this.fetchClinicSlots();
        this.updateError = null; // Clear error on success
      },
      error: (err) => {
        this.updateError = 'Failed to update fees. Please try again.';
        setTimeout(() => this.updateError = null, 3000);
        console.error('Update slot error:', err);
      }
    });
  }

  openEditSlotModal(slot: any) {
    // Copy slot data to editSlotForm
    this.slotModalService.editSlotForm = {
      id: slot._id || slot.id || '',
      startTime: slot.startTime,
      endTime: slot.endTime,
      duration: slot.duration != null ? slot.duration : 30,
      interval: slot.interval != null ? slot.interval : 10,
      fees: slot.fees,
      spaces: slot.spaces,
      day: slot.day || this.selectedDay,
    };
    // Ensure end time is recalculated based on start time and duration
    if ((window as any).modalComponentRef && (window as any).modalComponentRef.updateEditEndTime) {
      (window as any).modalComponentRef.updateEditEndTime();
    }
    const modal = document.getElementById('edit_slot');
    if (modal) {
      (window as any).bootstrap?.Modal.getOrCreateInstance(modal).show();
    }
  }

  // New method to save all pending slots after checking overlap
  async saveAllSlots() {
    if (!this.pendingSlots.length) return;
    this.loading = true;
    try {
      // Update all pending slots with the latest appointmentFees
      for (const slot of this.pendingSlots) {
        slot.fees = this.appointmentFees;
      }
      for (const slot of this.pendingSlots) {
        await this.slotService.createSlots(slot).toPromise();
      }
      this.pendingSlots = [];
      this.fetchSlots();
      this.fetchClinicSlots();
      this.updateError = null;
    } catch (err : any) {
      this.updateError = err?.error?.error  || err?.response?.data?.error || 'Failed to save slot';
      if (this.updateError) {
        setTimeout(() => { this.updateError = ''; }, 3000);
      }
    }
    this.loading = false;
  }

  get hasAnySlotsForSelectedDay(): boolean {
    const selected = (this.selectedDay || '').toLowerCase();
    const saved = (this.slotsByDay[this.selectedDay] || []).length > 0;
    const pending = this.pendingSlots.some(slot => (slot.day || '').toLowerCase() === selected);
    return saved || pending;
  }

  get pendingSlotsForSelectedDay(): any[] {
    return this.pendingSlots.filter(slot => slot.day === this.selectedDay);
  }
}
