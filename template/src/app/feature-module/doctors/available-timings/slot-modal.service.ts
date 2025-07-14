import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SlotModalService {
  // Form state for the modal
  slotForm = {
    startTime: '',
    endTime: '',
    duration: 30,
    interval: 10,
    fees: 0,
    spaces: 1,
    day: 'Monday',
  };

  // Event for when a slot is created
  private slotCreatedSource = new Subject<any>();
  slotCreated$ = this.slotCreatedSource.asObservable();

  // Call this after slot data is selected in modal
  emitSlotCreated(slotData: any) {
    this.slotCreatedSource.next(slotData);
  }

  // Optionally, reset the form
  resetForm() {
    this.slotForm = {
      startTime: '',
      endTime: '',
      duration: 30,
      interval: 10,
      fees: 0,
      spaces: 1,
      day: 'Monday',
    };
  }

  // Form state for editing a slot
  editSlotForm = {
    id: '',
    startTime: '',
    endTime: '',
    duration: 30,
    interval: 10,
    fees: 0,
    spaces: 1,
    day: 'Monday',
  };

  // Event for when a slot is updated
  private slotUpdatedSource = new Subject<any>();
  slotUpdated$ = this.slotUpdatedSource.asObservable();

  emitSlotUpdated(slotData: any) {
    this.slotUpdatedSource.next(slotData);
  }

  resetEditForm() {
    this.editSlotForm = {
      id: '',
      startTime: '',
      endTime: '',
      duration: 30,
      interval: 10,
      fees: 0,
      spaces: 1,
      day: 'Monday',
    };
  }

  public slotsToDelete: string[] = [];
  private slotsDeletedSource = new Subject<void>();
  public slotsDeleted$ = this.slotsDeletedSource.asObservable();

  emitSlotsDeleted() {
    this.slotsDeletedSource.next();
  }
} 