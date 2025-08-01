import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { routes } from 'src/app/shared/routes/routes';
import { TwilioChatService } from 'src/app/shared/services/twilio-chat.service';
import api from 'src/app/shared/api/axios';

@Component({
    selector: 'app-chat-doctor',
    templateUrl: './chat-doctor.component.html',
    styleUrls: ['./chat-doctor.component.scss'],
    standalone: false
})
export class ChatDoctorComponent implements OnInit {
  public routes = routes;
  public chat = false;
  conversations: any[] = [];
  selectedConversation: any = null;
  messages: any[] = [];
  newMessage: string = '';
  patients: any[] = [];
  currentUserId: string = '';
  currentUserProfileImg: string = '';
  selectedPatient: any = null;
  searchTerm: string = '';
  // patientProfileImg: string = '';
  canChatNow: boolean = false;
  appointments: any[] = [];

  constructor(private twilioChat: TwilioChatService) {}

  async ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.currentUserId = user.id || user._id;
    this.currentUserProfileImg = user.profileImgUrl || user.profileImage || 'assets/img/doctors-dashboard/profile-06.jpg';
    // Optionally set patientProfileImg when a patient is selected
    const identity = this.currentUserId || user.email || 'testuser';
    console.log('Twilio identity used for init:', identity);
    try {
      await this.twilioChat.init(identity);
      const conversations = await this.twilioChat.getConversations();
      console.log('Twilio conversations:', conversations);
      this.conversations = conversations;
    } catch (err) {
      console.error('Twilio chat error:', err);
    }
    await this.fetchPatients();
  }

  async fetchPatients() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const doctorId = user.id || user._id;
    try {
      const res = await api.get(`/doctor/appointments/doctor/${doctorId}`);
      const appointments = res.data || [];
      this.appointments = appointments; // Store all appointments for later lookup
      const patientMap: { [id: string]: any } = {};
      appointments.forEach((apt: any) => {
        if (apt.patient && apt.patient._id) {
          if (
            !patientMap[apt.patient._id] ||
            new Date(apt.date) > new Date(patientMap[apt.patient._id].lastBooking)
          ) {
            patientMap[apt.patient._id] = {
              ...apt.patient,
              lastBooking: apt.date,
              lastAppointment: apt
            };
          }
        }
      });
      this.patients = Object.values(patientMap);
    } catch (err) {
      console.error('Failed to load patients.', err);
      this.patients = [];
    }
  }

  showChat(){
    this.chat = !this.chat;
  }

  async selectConversation(conversation: any) {
    this.selectedConversation = conversation;
    this.messages = [];
    try {
      const paginator = await conversation.getMessages();
      this.messages = paginator.items;
      // Remove previous listeners to avoid duplicates
      if (conversation.removeAllListeners) {
        conversation.removeAllListeners('messageAdded');
      }
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

    // Convert UTC date to local date (remove timezone effect)
    const apptDate = new Date(dateStr);
    const localApptDate = new Date(
      apptDate.getUTCFullYear(),
      apptDate.getUTCMonth(),
      apptDate.getUTCDate()
    );

    const [startHour, startMin] = startTime.split(':').map(Number);
    const apptStart = new Date(localApptDate);
    apptStart.setHours(startHour, startMin, 0, 0);

    const [endHour, endMin] = endTime.split(':').map(Number);
    const apptEnd = new Date(localApptDate);
    apptEnd.setHours(endHour, endMin, 0, 0);

    console.log(`Checking appointment slot from ${apptStart} to ${apptEnd}...`);

    if (now >= apptStart && now <= apptEnd) {
      this.canChatNow = true;
      console.log('✅ Doctor can chat now with patient.');
      return;
    }
  }

  console.log('❌ No valid appointment for current time.');
}


  async startConversationWithPatient(patient: any) {
    this.selectedPatient = patient;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const doctorId = user.id || user._id;
    try {
      const res = await api.post('/twilio/create-conversation', {
        doctorId,
        patientId: patient._id
      });
      // Refresh conversations and select the new/existing one
      const updatedConversations = await this.twilioChat.getConversations();
      this.conversations = updatedConversations;
      // Find the conversation by SID
      const conversation = this.conversations.find((conv: any) => conv.sid === res.data.sid);
      if (conversation) {
        await this.selectConversation(conversation);
      }
      // Find the relevant appointment for chat restriction
      const relevantAppointments = this.appointments.filter(
        apt =>
          apt.patient &&
          apt.patient._id === patient._id &&
          (apt.status === 'accepted' || apt.status === 'completed') &&
          apt.appointmentType &&
          apt.appointmentType.trim().toLowerCase() === 'chat'
      );
      this.checkChatWindow(relevantAppointments);
    } catch (err) {
      console.error('Failed to create/get conversation:', err);
    }
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

  get filteredPatients() {
    if (!this.searchTerm.trim()) return this.patients;
    const term = this.searchTerm.trim().toLowerCase();
    return this.patients.filter(
      p => p.name && p.name.toLowerCase().includes(term)
    );
  }
}
