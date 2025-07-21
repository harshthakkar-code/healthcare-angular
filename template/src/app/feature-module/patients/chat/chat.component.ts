import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { routes } from 'src/app/shared/routes/routes';
import { TwilioChatService } from 'src/app/shared/services/twilio-chat.service';
import api from 'src/app/shared/api/axios';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
    standalone: false
})
export class ChatComponent implements OnInit {
  public routes = routes;
  public chat = false;
  conversations: any[] = [];
  selectedConversation: any = null;
  messages: any[] = [];
  newMessage: string = '';
  doctors: any[] = [];
  selectedDoctor: any = null;
  currentUserId: string = '';
  currentUserProfileImg: string = '';
  searchTerm: string = '';
  canChatNow: boolean = false;
  appointments: any[] = [];

  constructor(private twilioChat: TwilioChatService) {}

  async ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.currentUserId = user.id || user._id;
    this.currentUserProfileImg = user.profileImgUrl || 'assets/img/doctors-dashboard/profile-06.jpg';
    const identity = user.id || user.email || 'testuser';
    console.log('Twilio identity used for init:', identity);
    try {
      await this.twilioChat.init(identity);
      const conversations = await this.twilioChat.getConversations();
      console.log('Twilio conversations:', conversations);
      this.conversations = conversations;
    } catch (err) {
      console.error('Twilio chat error:', err);
    }
    await this.fetchDoctors();
  }

  async fetchDoctors() {
    try {
      const res = await api.get('/patient/appointments');
      console.log('Appointments API response:', res.data);
      const appointments = Array.isArray(res.data.appointments) ? res.data.appointments : [];
      this.appointments = appointments; // Store all appointments for later lookup
      const doctorMap: { [id: string]: any } = {};
      appointments
        .filter((apt: any) => apt.status === 'accepted' || apt.status === 'completed')
        .forEach((apt: any) => {
          if (apt.doctor && apt.doctor._id) {
            if (
              !doctorMap[apt.doctor._id] ||
              new Date(apt.date) > new Date(doctorMap[apt.doctor._id].lastBooking)
            ) {
              doctorMap[apt.doctor._id] = {
                ...apt.doctor,
                lastBooking: apt.date,
                lastAppointment: apt
              };
            }
          }
        });
      this.doctors = Object.values(doctorMap);
    } catch (err) {
      console.error('Failed to load doctors.', err);
      this.doctors = [];
    }
  }

  checkChatWindow(appointment: any) {
    if (
      !appointment ||
      !appointment.date ||
      !appointment.time
      // Optionally add appointmentType check here
    ) {
      this.canChatNow = false;
      return;
    }
    const dateStr = appointment.date; // e.g., "2025-07-21T00:00:00.000Z"
    const [startTime, endTime] = appointment.time.split('-').map((t: string) => t.trim()); // e.g., "15:15", "15:45"
    const today = new Date();

    // Parse the appointment date
    const apptDate = new Date(dateStr);

    // Parse start time
    const [startHour, startMin] = startTime.split(':').map(Number);
    const apptStart = new Date(apptDate);
    apptStart.setHours(startHour, startMin, 0, 0);

    // Parse end time
    const [endHour, endMin] = endTime.split(':').map(Number);
    const apptEnd = new Date(apptDate);
    apptEnd.setHours(endHour, endMin, 0, 0);

    // Check if now is within the window
    this.canChatNow = today >= apptStart && today <= apptEnd;
  }

  async startConversationWithDoctor(doctor: any) {
    this.selectedDoctor = doctor;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const patientId = user.id || user._id;
    try {
      const res = await api.post('/twilio/create-conversation', {
        doctorId: doctor._id,
        patientId
      });
      const updatedConversations = await this.twilioChat.getConversations();
      this.conversations = updatedConversations;
      const conversation = this.conversations.find((conv: any) => conv.sid === res.data.sid);
      if (conversation) {
        await this.selectConversation(conversation);
      }
      // Find the relevant appointment for chat restriction
      const relevantAppointment = this.appointments.find(
        apt =>
          apt.doctor &&
          apt.doctor._id === doctor._id &&
          (apt.status === 'accepted' || apt.status === 'completed') &&
          apt.appointmentType &&
          apt.appointmentType.trim().toLowerCase() === 'chat'
      );
      this.checkChatWindow(relevantAppointment);
    } catch (err) {
      console.error('Failed to create/get conversation:', err);
    }
  }

  showChat(){
    this.chat = !this.chat;
  }
  public onlineList: OwlOptions = {
    margin: 0,
    nav: false,
    loop: false,
    dots: false,
    autoplaySpeed: 2000,
    responsive: {
      0: {
        items: 5,
      },
      768: {
        items: 5,
      },
      1170: {
        items: 5,
      },
    },
  };

  async selectConversation(conversation: any) {
    this.selectedConversation = conversation;
    this.messages = [];
    try {
      const paginator = await conversation.getMessages();
      this.messages = paginator.items;
      conversation.on('messageAdded', (msg: any) => {
        this.messages = [...this.messages, msg];
      });
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  }

  async sendMessage() {
    if (!this.selectedConversation || !this.newMessage.trim()) return;
    try {
      await this.selectedConversation.sendMessage(this.newMessage.trim());
      this.newMessage = '';
      // The message will be added by the messageAdded event
    } catch (err) {
      console.error('Error sending message:', err);
    }
  }

  get filteredDoctors() {
    if (!this.searchTerm.trim()) return this.doctors;
    const term = this.searchTerm.trim().toLowerCase();
    return this.doctors.filter(
      d => d.name && d.name.toLowerCase().includes(term)
    );
  }
}
