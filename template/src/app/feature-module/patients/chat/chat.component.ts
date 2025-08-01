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

checkChatWindow(appointments: any[]) {
  this.canChatNow = false;

  if (!Array.isArray(appointments) || appointments.length === 0) {
    console.log('No valid appointments for chat.');
    return;
  }

  const now = new Date();

  for (const appointment of appointments) {
    if (!appointment.date || !appointment.time) continue;

    const dateStr = appointment.date;
    const [startTime, endTime] = appointment.time.split('-').map((t: string) => t.trim());

    // Convert UTC date to local date
    const apptDate = new Date(dateStr);
    const localApptDate = new Date(
      apptDate.getUTCFullYear(),
      apptDate.getUTCMonth(),
      apptDate.getUTCDate()
    );

    // Build full start time
    const [startHour, startMin] = startTime.split(':').map(Number);
    const apptStart = new Date(localApptDate);
    apptStart.setHours(startHour, startMin, 0, 0);

    // Build full end time
    const [endHour, endMin] = endTime.split(':').map(Number);
    const apptEnd = new Date(localApptDate);
    apptEnd.setHours(endHour, endMin, 0, 0);

    console.log('Checking appointment window:');
    console.log('Start:', apptStart);
    console.log('End:', apptEnd);
    console.log('Now:', now);

    // If current time is within this appointment window
    if (now >= apptStart && now <= apptEnd) {
      this.canChatNow = true;
      console.log('✅ Chat is allowed for this appointment.');
      return; // No need to check others
    }
  }

  console.log('❌ No valid appointment found for current time.');
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
      const relevantAppointment = this.appointments.filter(
        apt =>
          apt.doctor &&
          apt.doctor._id === doctor._id &&
          (apt.status === 'accepted' || apt.status === 'completed') &&
          apt.appointmentType &&
          apt.appointmentType.trim().toLowerCase() == 'chat'
      );
      console.log('Relevant appointment:', relevantAppointment);
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
