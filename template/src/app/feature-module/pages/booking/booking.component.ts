import { Component, OnInit } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import { ActivatedRoute } from '@angular/router';
import api from 'src/app/shared/api/axios';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-booking',
  standalone: false,
  
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss'
})
export class BookingComponent implements OnInit {
  routes=routes;
  public selectedFieldSet = [0];
  bsInlineValue = new Date();
  isClinic=true;
  doctorId: string | null = null;
  doctor: any = null; // Holds doctor profile and specialization
  loadingDoctor = false;
  errorDoctor = '';
  selectedSpecialization: any = null;
  selectedServices: string[] = [];
  appointmentTypes = [
    { label: 'Video Call', value: 'video', icon: 'isax isax-video5' },
    { label: 'Audio Call', value: 'audio', icon: 'isax isax-call5' },
    { label: 'Chat', value: 'chat', icon: 'isax isax-messages-15' },
    { label: 'Home Visit', value: 'home', icon: 'isax isax-messages-15' }
  ];
  selectedAppointmentType: string = '';
  slots: any[] = [];
  availableDates: string[] = [];
  selectedDate: string | null = null;
  slotsForSelectedDate: any[] = [];
  availableDatesAsDateObjects: Date[] = [];
  morningSlots: any[] = [];
  afternoonSlots: any[] = [];
  eveningSlots: any[] = [];
  dependants: any[] = [];
  selectedDependant: string | null = null;
  firstName: string = '';
  lastName: string = '';
  phone: string = '';
  email: string = '';
  symptoms: string = '';
  reason: string = '';
  selectedSlot: any = null;
  createdAppointment: any = null;
  patientId: any;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.doctorId = this.route.snapshot.paramMap.get('doctorId');
    if (this.doctorId) {
      this.fetchDoctorDetails(this.doctorId);
      this.fetchSlots();
    }
    this.fetchDependants();
  }

  async fetchDoctorDetails(id: string) {
    this.loadingDoctor = true;
    this.errorDoctor = '';
    try {
      const res = await api.get(`/doctor/public/profile/${id}`);
      this.doctor = res.data;
      // Set default specialization if available
      if (this.doctor?.specializations?.length) {
        this.selectedSpecialization = this.doctor.specializations[0];
      }
    } catch (err: any) {
      this.errorDoctor = err?.message || 'Failed to load doctor details';
    } finally {
      this.loadingDoctor = false;
    }
  }

  async fetchSlots() {
    if (!this.doctorId) return;
    try {
      const res = await api.get(`/slots/${this.doctorId}`);
      this.slots = res.data.slots || [];
      // Extract unique available dates (as yyyy-MM-dd)
      this.availableDates = Array.from(new Set(this.slots.map((slot: any) => formatDate(slot.date, 'yyyy-MM-dd', 'en-US'))));
      this.availableDatesAsDateObjects = this.availableDates.map(d => new Date(d));
      // Optionally, set default selected date to first available
      if (this.availableDates.length) {
        this.selectedDate = this.availableDates[0];
        this.filterSlotsForSelectedDate();
      }
    } catch (err) {
      // handle error if needed
    }
  }

  filterSlotsForSelectedDate() {
    if (!this.selectedDate) {
      this.slotsForSelectedDate = [];
      this.morningSlots = [];
      this.afternoonSlots = [];
      this.eveningSlots = [];
      return;
    }
    this.slotsForSelectedDate = this.slots.filter(
      slot => formatDate(slot.date, 'yyyy-MM-dd', 'en-US') === this.selectedDate
    );
    // Categorize by startTime and filter out booked slots
    this.morningSlots = this.slotsForSelectedDate.filter(slot => {
      const hour = parseInt(slot.startTime.split(':')[0], 10);
      return hour >= 5 && hour < 12 && slot.status === 'available';
    });
    this.afternoonSlots = this.slotsForSelectedDate.filter(slot => {
      const hour = parseInt(slot.startTime.split(':')[0], 10);
      return hour >= 12 && hour < 17 && slot.status === 'available';
    });
    this.eveningSlots = this.slotsForSelectedDate.filter(slot => {
      const hour = parseInt(slot.startTime.split(':')[0], 10);
      return hour >= 17 && hour < 22 && slot.status === 'available';
    });
  }

  onDateSelected(date: Date) {
    this.selectedDate = formatDate(date, 'yyyy-MM-dd', 'en-US');
    this.filterSlotsForSelectedDate();
  }

  showClinic():void{
    this.isClinic=true;
  }
  offClinic():void{
    this.isClinic=false;
  }

  get specializationsDisplay(): string {
    if (this.doctor?.specializations?.length) {
      return this.doctor.specializations.map((s: any) => s.name).join(' · ');
    }
    return '';
  }

  toggleService(serviceId: string) {
    const idx = this.selectedServices.indexOf(serviceId);
    if (idx > -1) {
      this.selectedServices.splice(idx, 1);
    } else {
      this.selectedServices.push(serviceId);
    }
  }

  selectAppointmentType(type: string) {
    this.selectedAppointmentType = type;
  }

  isLastSelectedService(serviceId: string, services: any[]): boolean {
    // Find all selected service ids in this specialization
    const selected = services.filter(s => this.selectedServices.includes(s._id));
    return !!(selected.length && selected[selected.length - 1]._id === serviceId);
  }

  getAppointmentTypeLabel(value: string): string {
    const found = this.appointmentTypes.find(t => t.value === value);
    return found ? found.label : '';
  }

  async fetchDependants() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id || user._id || null;
      this.patientId=userId;
      if (!userId) return;
      const res = await api.get(`/dependants?userId=${userId}`);
      this.dependants = res.data;
    } catch (err) {
      // handle error
    }
  }

  onSlotSelected(slot: any) {
    this.selectedSlot = slot;
  }

  get selectedServicesTotal(): number {
    if (!this.selectedSpecialization) return 0;
    return this.selectedSpecialization.services
      .filter((s: any) => this.selectedServices.includes(s._id))
      .reduce((sum: number, s: any) => sum + (s.price || 0), 0);
  }

  get totalWithTaxAndDiscount(): number {
    // Example: tax = 18, discount = 15
    return this.selectedServicesTotal + 18 + 20 - 15;
  }

  async confirmAndPay() {
    if (!this.selectedSlot || !this.selectedSpecialization) return;
    try {
      const body = {
        user: this.doctorId,
        patient:this.patientId,
        doctor:this.doctorId,
        specialty: this.selectedSpecialization?.name,
        selectedService: this.selectedServices.map(id => {
          const service = this.selectedSpecialization.services.find((s: any) => s._id === id);
          return service ? service.name : '';
        }).join(', '),
        appointmentType: this.selectedAppointmentType,
        date: this.selectedSlot.date,
        time: `${this.selectedSlot.startTime} - ${this.selectedSlot.endTime}`,
        name: this.firstName + ' ' + this.lastName,
        email: this.email,
        phone: this.phone,
        symptoms: this.symptoms,
        price: this.selectedServicesTotal,
        totalPrice: this.totalWithTaxAndDiscount
      };
      const res = await api.post('/doctor/appointments', body);
      this.createdAppointment = res.data;
      this.selectedFieldSet[0] = 5; // Move to step 6
    } catch (err) {
      // Optionally handle error
    }
  }
}
