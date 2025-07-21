import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Client as TwilioConversationsClient, Conversation } from '@twilio/conversations';

@Injectable({
  providedIn: 'root'
})
export class TwilioChatService {
  private client: TwilioConversationsClient | null = null;

  constructor(private http: HttpClient) { }

  async init(identity: string) {
    // 1. Get token from your backend
    const response = await this.http.get<{ token: string }>(`/api/twilio/token?identity=${identity}`).toPromise();
    if (!response || !response.token) throw new Error('Failed to fetch Twilio token');
    // 2. Create Twilio Conversations client
    this.client = await TwilioConversationsClient.create(response.token);
  }

  async getConversations(): Promise<Conversation[]> {
    if (!this.client) throw new Error('Twilio client not initialized');
    const paginator = await this.client.getSubscribedConversations();
    return paginator.items;
  }

  async sendMessage(conversationSid: string, message: string) {
    if (!this.client) throw new Error('Twilio client not initialized');
    const conversation = await this.client.getConversationBySid(conversationSid);
    await conversation.sendMessage(message);
  }

  // Add more methods as needed (listen for new messages, etc.)
}
