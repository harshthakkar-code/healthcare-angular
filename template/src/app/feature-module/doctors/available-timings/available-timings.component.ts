/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, Renderer2, OnInit } from '@angular/core';
import { CommonService } from 'src/app/shared/common/common.service';
import { routes } from 'src/app/shared/routes/routes';
import { SlotService } from './slot.service';
import { SlotModalService } from './slot-modal.service';
import { forkJoin } from 'rxjs';
import api from 'src/app/shared/api/axios';

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
  clinics: Array<{ clinicName: string; logo?: string; [key: string]: any }> = [];
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
  public selectedDay: string = 'Monday';
  public selectedSlotId: string | null = null;
  public updateError: string | null = null;
  public pendingSlots: any[] = [];
  // Remove selectedType property
  activeTabType: 'general' | 'clinic' = 'general';
  pendingSlotEditIndex: number | null = null;
  private pendingSlotOriginalKey: { startTime: string, day: string, type: string } | null = null;
  slotListError: string | null = null;
  public specializations: any[] = [];
  public isSpecializationMissing: boolean = false;
  public isStripeConnected: boolean = false;
  public stripeLoading: boolean = false;

  constructor(
    private renderer: Renderer2,
    private common: CommonService,
    private slotService: SlotService,
    private slotModalService: SlotModalService
  ) {
    // this.selectedClinic = this.clinics[0];
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
    this.activeTabType = 'general';
    // Remove selectedType = 'general';
    this.doctorId = this.getDoctorIdFromLocalStorage();
    console.log('ngOnInit doctorId:', this.doctorId);
    if (this.doctorId) {
      this.getSpecializations(); // Fetch specializations
      this.checkStripeStatus(); // Check Stripe connection
      api.get(`/doctor/public/profile/${this.doctorId}`).then(response => {
        const profile = response.data;
        console.log(profile)
        if (profile && profile.clinicsSettings) {
          this.clinics = profile.clinicsSettings;
          this.selectedClinic = this.clinics[0];
          console.log(this.selectedClinic , this.clinics)
        }
      }).catch(error => {
        console.error('Failed to fetch doctor profile:', error);
      });
      this.fetchSlots();
      this.fetchClinicSlots();
    }
    this.slotModalService.slotCreated$.subscribe((slotData: any) => {
      if (slotData) {
        // Ensure type is set
        if (!slotData.type) {
          slotData.type = this.activeTabType;
        }
        // Ensure clinicName is set for clinic slots
        if (slotData.type === 'clinic' && !slotData.clinicName) {
          slotData.clinicName = this.selectedClinic?.name || '';
        }
        this.addPendingSlot(slotData); // Use deduplicating add
      }
      // this.fetchSlots();
      // this.fetchClinicSlots();
    });
    this.slotModalService.slotsDeleted$.subscribe(() => {
      this.fetchSlots();
      this.fetchClinicSlots();
    });
    this.slotModalService.slotUpdated$.subscribe((slotData: any) => {
      console.log(slotData)
      // If the slot has no id, it's a pending slot: update it in pendingSlots
      if (!slotData.id && !slotData._id && this.pendingSlotOriginalKey) {
        const idx = this.pendingSlots.findIndex(
          s =>
            s.startTime === this.pendingSlotOriginalKey!.startTime &&
            s.day === this.pendingSlotOriginalKey!.day &&
            s.type === this.pendingSlotOriginalKey!.type
        );
        if (idx !== -1) {
          this.pendingSlots[idx] = { ...slotData };
        }
        this.pendingSlotOriginalKey = null; // Clear after update
      } else if ((slotData.id || slotData._id)) {
        // Update saved slot in slotsByDay or clinicSlotsByDay and mark as pending
        const day = slotData.day;
        const type = slotData.type;
        slotData.isPending = true; // Mark as pending until batch save
        if (type === 'clinic') {
          const arr = this.clinicSlotsByDay[day] || [];
          const idx = arr.findIndex(s => (s._id || s.id) === (slotData._id || slotData.id));
          if (idx !== -1) {
            arr[idx] = { ...arr[idx], ...slotData, isPending: true };
            this.clinicSlotsByDay[day] = [...arr];
          }
        } else {
          const arr = this.slotsByDay[day] || [];
          const idx = arr.findIndex(s => (s._id || s.id) === (slotData._id || slotData.id));
          if (idx !== -1) {
            arr[idx] = { ...arr[idx], ...slotData, isPending: true };
            this.slotsByDay[day] = [...arr];
          }
        }
      }
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
    this.slotService.getSlots(this.doctorId!, { type: 'general' }).subscribe({
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
    this.slotService.getSlots(this.doctorId!, { type: 'clinic' }).subscribe({
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

  getSpecializations() {
    const doctorId = this.doctorId;
    if (!doctorId) return;
    api.get(`/specialization?doctorId=${doctorId}`).then((res: any) => {
      this.specializations = res.data || [];
      this.isSpecializationMissing = this.specializations.length === 0;
    });
  }

  checkStripeStatus() {
    this.stripeLoading = true;
    api.get('/doctor/stripe/status')
      .then(res => {
        this.isStripeConnected = !!res.data.connected;
        this.stripeLoading = false;
      })
      .catch(() => {
        this.isStripeConnected = false;
        this.stripeLoading = false;
      });
  }

  openAddSlotModal(type: 'general' | 'clinic' = 'general') {
    if (this.isSpecializationMissing || !this.isStripeConnected) return;
    this.slotModalService.slotForm.day = this.selectedDay;
    this.slotModalService.slotForm.type = type;
    this.slotModalService.slotForm.fees = 0; // Set default value
    if (type === 'clinic') {
      this.slotModalService.slotForm.clinicName = this.selectedClinic?.name || '';
    } else {
      this.slotModalService.slotForm.clinicName = '';
    }
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
    this.slotService.updateSlot(this.selectedSlotId, { fees: this.slotModalService.slotForm.fees }).subscribe({
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
    if (this.isPendingSlot(slot)) {
      this.pendingSlotEditIndex = this.pendingSlots.findIndex(
        s =>
          s.startTime === slot.startTime &&
          s.day === slot.day &&
          s.type === slot.type
      );
      this.pendingSlotOriginalKey = {
        startTime: slot.startTime,
        day: slot.day,
        type: slot.type
      };
      this.slotModalService.editSlotForm = { ...slot };
    } else {
      this.pendingSlotEditIndex = null;
      this.pendingSlotOriginalKey = null;
      this.slotModalService.editSlotForm = {
        id: slot._id || slot.id || '',
        startTime: slot.startTime,
        endTime: slot.endTime,
        duration: slot.duration != null ? slot.duration : 30,
        // interval: slot.interval, // commented out
        fees: slot.fees,
        spaces: slot.spaces,
        day: slot.day || this.selectedDay,
        type: slot.type || 'general',
        clinicName: slot.clinicName || '',
      };
    }
    // Ensure end time is recalculated based on start time and duration
    if ((window as any).modalComponentRef && (window as any).modalComponentRef.updateEditEndTime) {
      (window as any).modalComponentRef.updateEditEndTime();
    }
    const modal = document.getElementById('edit_slot');
    if (modal) {
      (window as any).bootstrap?.Modal.getOrCreateInstance(modal).show();
    }
  }

  // async saveAllSlots() {
  //   if (!this.pendingSlots.length && !this.hasAnyEditedSavedSlots()) return;
  //   this.loading = true;
  //   try {
  //     const failedPending: any[] = [];
  
  //     // Validate and create all pending slots
  //     for (const slot of this.pendingSlots) {
  //       const allSlotsForType = slot.type === 'clinic'
  //         ? [...(this.clinicSlotsByDay[slot.day] || [])]
  //         : [...(this.slotsByDay[slot.day] || [])];
  
  //       const { overlap, slot: overlappingSlot } = isSlotOverlapping(slot, allSlotsForType);
  //       if (overlap && overlappingSlot) {
  //         slot.error = `Slot Time overlaps with ${overlappingSlot.startTime} - ${overlappingSlot.endTime}`;
  //         failedPending.push(slot);
  //         continue;
  //       }
  
  //       try {
  //         await this.slotService.createSlots(slot).toPromise();
  //       } catch (err: any) {
  //         slot.error = err?.error?.error || err?.response?.data?.error || 'Failed to save slot';
  //         failedPending.push(slot);
  //       }
  //     }
  
  //     // Update saved slots that are edited (marked as isPending)
  //     for (const day of this.daysOfWeek) {
  //       // General slots
  //       for (const slot of this.slotsByDay[day] || []) {
  //         if (slot.isPending && (slot.id || slot._id)) {
  //           const otherSlots = (this.slotsByDay[day] || []).filter(
  //             s => (s.id || s._id) !== (slot.id || slot._id)
  //           );
  //           const { overlap, slot: overlappingSlot } = isSlotOverlapping(slot, otherSlots, slot.id || slot._id);
  //           if (overlap && overlappingSlot) {
  //             slot.error = `Slot Time overlaps with ${overlappingSlot.startTime} - ${overlappingSlot.endTime}`;
  //             continue;
  //           }
  //           try {
  //             await this.slotService.updateSlot(slot.id || slot._id, slot).toPromise();
  //             slot.isPending = false;
  //             slot.error = undefined;
  //           } catch (err: any) {
  //             slot.error = err?.error?.error || err?.response?.data?.error || 'Failed to update slot';
  //           }
  //         }
  //       }
  
  //       // Clinic slots
  //       // for (const slot of this.clinicSlotsByDay[day] || []) {
  //       //   if (slot.isPending && (slot.id || slot._id)) {
  //       //     const otherSlots = (this.clinicSlotsByDay[day] || []).filter(
  //       //       s => (s.id || s._id) !== (slot.id || slot._id)
  //       //     );
  //       //     const { overlap, slot: overlappingSlot } = isSlotOverlapping(slot, otherSlots, slot.id || slot._id);
  //       //     if (overlap && overlappingSlot) {
  //       //       slot.error = `Slot Time overlaps with ${overlappingSlot.startTime} - ${overlappingSlot.endTime}`;
  //       //       continue;
  //       //     }
  //       //     try {
  //       //       await this.slotService.updateSlot(slot.id || slot._id, slot).toPromise();
  //       //       slot.isPending = false;
  //       //       slot.error = undefined;
  //       //     } catch (err: any) {
  //       //       slot.error = err?.error?.error || err?.response?.data?.error || 'Failed to update slot';
  //       //     }
  //       //   }
  //       // }
  //     }
  
  //     this.pendingSlots = failedPending;
  
  //     const firstErrorSlot = failedPending.find(slot => slot.error);
  //     if (firstErrorSlot && firstErrorSlot.error) {
  //       this.slotListError = firstErrorSlot.error;
  //       setTimeout(() => { this.slotListError = null; }, 3000);
  //     } else {
  //       this.slotListError = null;
  //     }
  
  //     this.fetchSlots();
  //     // this.fetchClinicSlots();
  //     this.updateError = null;
  //   } catch (err: any) {
  //     this.updateError = err?.error?.error || err?.response?.data?.error || 'Failed to save slot';
  //     setTimeout(() => { this.updateError = ''; }, 3000);
  //   }
  //   this.loading = false;
  // }

  // Helper to deduplicate slots by startTime, day, and type
  
  async saveAllSlots() {
  if (!this.pendingSlots.length && !this.hasAnyEditedSavedSlots()) return;
  this.loading = true;
  const failedPending: any[] = [];
  let firstErrorMessage: string | null = null;

  try {
    // Create new (pending) slots
    for (const slot of this.pendingSlots) {
      const allSlotsForType = slot.type === 'clinic'
        ? [...(this.clinicSlotsByDay[slot.day] || [])]
        : [...(this.slotsByDay[slot.day] || [])];

      const { overlap, slot: overlappingSlot } = isSlotOverlapping(slot, allSlotsForType);
      if (overlap && overlappingSlot) {
        const errorMsg = `Slot overlaps with ${overlappingSlot.startTime} - ${overlappingSlot.endTime}`;
        slot.error = errorMsg;
        firstErrorMessage ||= errorMsg;
        failedPending.push(slot);
        continue;
      }

      try {
        await this.slotService.createSlots(slot).toPromise();
      } catch (err: any) {
        const errorMsg = err?.error?.error || err?.response?.data?.error || 'Failed to save slot';
        slot.error = errorMsg;
        firstErrorMessage ||= errorMsg;
        failedPending.push(slot);
      }
    }

    // Update edited saved slots
    for (const day of this.daysOfWeek) {
      for (const slot of this.slotsByDay[day] || []) {
        if (slot.isPending && (slot.id || slot._id)) {
          const otherSlots = (this.slotsByDay[day] || []).filter(
            s => (s.id || s._id) !== (slot.id || slot._id)
          );
          const { overlap, slot: overlappingSlot } = isSlotOverlapping(slot, otherSlots, slot.id || slot._id);

          if (overlap && overlappingSlot) {
            const errorMsg = `Slot overlaps with ${overlappingSlot.startTime} - ${overlappingSlot.endTime}`;
            slot.error = errorMsg;
            firstErrorMessage ||= errorMsg;
            continue;
          }

          try {
            await this.slotService.updateSlot(slot.id || slot._id, slot).toPromise();
            slot.isPending = false;
            slot.error = undefined;
          } catch (err: any) {
            const errorMsg = err?.error?.error || err?.response?.data?.error || 'Failed to update slot';
            slot.error = errorMsg;
            firstErrorMessage ||= errorMsg;
          }
        }
      }

      for (const slot of this.clinicSlotsByDay[day] || []) {
        if (slot.isPending && (slot.id || slot._id)) {
          const otherSlots = (this.clinicSlotsByDay[day] || []).filter(
            s => (s.id || s._id) !== (slot.id || slot._id)
          );
          const { overlap, slot: overlappingSlot } = isSlotOverlapping(slot, otherSlots, slot.id || slot._id);

          if (overlap && overlappingSlot) {
            const errorMsg = `Slot overlaps with ${overlappingSlot.startTime} - ${overlappingSlot.endTime}`;
            slot.error = errorMsg;
            firstErrorMessage ||= errorMsg;
            continue;
          }

          try {
            await this.slotService.updateSlot(slot.id || slot._id, slot).toPromise();
            slot.isPending = false;
            slot.error = undefined;
          } catch (err: any) {
            const errorMsg = err?.error?.error || err?.response?.data?.error || 'Failed to update slot';
            slot.error = errorMsg;
            firstErrorMessage ||= errorMsg;
          }
        }
      }
    }

    this.pendingSlots = failedPending;

    this.slotListError = firstErrorMessage;
    if (this.slotListError) {
      setTimeout(() => (this.slotListError = null), 15000);
    }

    // Only fetch slots if no errors
    if (this.pendingSlots.length === 0 && !this.hasAnyEditedSavedSlots()) {
      this.fetchSlots();
      // this.fetchClinicSlots();
    }

    this.updateError = null;
  } catch (err: any) {
    this.updateError = err?.error?.error || err?.response?.data?.error || 'Failed to save slot';
    setTimeout(() => (this.updateError = null), 3000);
  }

  this.loading = false;
}

  deduplicateSlots(slots: any[]): any[] {
    return slots.filter((slot, index, self) =>
      index === self.findIndex(
        s =>
          s.startTime === slot.startTime &&
          s.day === slot.day &&
          s.type === slot.type
      )
    );
  }

  // Add a pending slot only if it does not already exist
  addPendingSlot(slot: any) {
    // Only add to pendingSlots if the slot is new (no id/_id)
    if (slot.id || slot._id) {
      // Do not add saved slots to pendingSlots
      return;
    }
    const exists = this.pendingSlots.some(
      s =>
        s.startTime === slot.startTime &&
        s.day === slot.day &&
        s.type === slot.type
    );
    if (!exists) {
      this.pendingSlots.push(slot);
    }
  }

  get hasAnySlotsForSelectedDay(): boolean {
    const selected = (this.selectedDay || '').toLowerCase();
    const saved = (this.slotsByDay[this.selectedDay] || []).length > 0;
    const pending = this.pendingSlots.some(slot => (slot.day || '').toLowerCase() === selected);
    return saved || pending;
  }

  // Get all slots for the selected day, deduplicated (backend + pending)
  get allSlotsForSelectedDay(): any[] {
    const backendSlots = this.slotsByDay[this.selectedDay] || [];
    const pending = this.pendingSlotsForSelectedDay;
    return this.deduplicateSlots([...backendSlots, ...pending]);
  }

  onTabChange(type: 'general' | 'clinic') {
    this.activeTabType = type;
  }

  get pendingSlotsForSelectedDay(): any[] {
    return this.pendingSlots.filter(slot => slot.day === this.selectedDay && slot.type === this.activeTabType);
  }

  isPendingSlot(slot: any): boolean {
    return !slot._id && !slot.id;
  }

  hasAnyEditedSavedSlots(): boolean {
    for (const day of this.daysOfWeek) {
      if ((this.slotsByDay[day] || []).some(slot => slot.isPending && (slot.id || slot._id))) return true;
      if ((this.clinicSlotsByDay[day] || []).some(slot => slot.isPending && (slot.id || slot._id))) return true;
    }
    return false;
  }
}

// Utility functions (must be outside the class)
function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function normalizeDate(date: string): string {
  return date.length > 10 ? date.slice(0, 10) : date;
}

function isSlotOverlapping(
  newSlot: { startTime: string, endTime: string, date: string, type: string, id?: any, _id?: any },
  existingSlots: Array<{ startTime: string, endTime: string, date: string, type: string, id?: any, _id?: any }>,
  excludeId?: any
): { overlap: boolean; slot?: any } {
  const newStart = toMinutes(newSlot.startTime);
  const newEnd = toMinutes(newSlot.endTime);
  const newDate = normalizeDate(newSlot.date);

  for (const slot of existingSlots) {
    const slotStart = toMinutes(slot.startTime);
    const slotEnd = toMinutes(slot.endTime);
    const slotDate = normalizeDate(slot.date);
    const isSameType = slot.type === newSlot.type;
    const isSameDate = slotDate === newDate;
    const isNotExcluded = excludeId ? (slot.id || slot._id) !== excludeId : true;

    const isOverlap = slotStart < newEnd && slotEnd > newStart;

    if (isSameDate && isSameType && isNotExcluded && isOverlap) {
      return { overlap: true, slot };
    }
  }

  return { overlap: false };
}

