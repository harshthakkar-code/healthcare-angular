import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { connect, Room, ConnectOptions } from 'twilio-video';
import api from './api/axios';

@Injectable({ providedIn: 'root' })
export class VideoService {
  getToken(identity: string, room: string): Observable<string> {
    // Use axios and wrap the promise in an Observable
    return from(
      api.post('/video/token', { identity, room }).then(res => res.data.token)
    );
  }

  joinRoom(token: string, roomName: string, options: Partial<ConnectOptions> = {}): Promise<Room> {
    return connect(token, { name: roomName, ...options });
  }
  getUserById(userId: string) {
  return api.get(`/auth/user/${userId}`); // auth header is auto-attached if setup in interceptor
}
} 