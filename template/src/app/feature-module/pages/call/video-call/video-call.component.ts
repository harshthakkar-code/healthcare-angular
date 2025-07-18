import { Component, ElementRef, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VideoService } from 'src/app/shared/video.service';
import { routes } from 'src/app/shared/routes/routes';
import { Room, RemoteTrack, RemoteVideoTrack } from 'twilio-video';

@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.scss'],
  standalone: false
})
export class VideoCallComponent implements AfterViewInit, OnDestroy {
  public routes = routes;
  public micIcon = true;
  public videoIcon = true;
  elem = document.documentElement;

  @ViewChild('localVideo', { static: false }) localVideo!: ElementRef;
  @ViewChild('remoteVideo', { static: false }) remoteVideo!: ElementRef;

  room?: Room;
  identity: string = '';
  roomName: string = '';

  constructor(private videoService: VideoService, private route: ActivatedRoute) {}

  ngAfterViewInit() {
    // Get doctorId and patientId from query params
    this.route.queryParams.subscribe(params => {
      const doctorId = params['doctorId'];
      const patientId = params['patientId'];
    
      // Always sort IDs to make roomName consistent for both doctor & patient
      const ids = [doctorId, patientId].sort();
      this.roomName = `room-${ids[0]}-${ids[1]}`;
    
      // Get logged-in user ID (identity)
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      this.identity = user?.id || user?._id || 'guest-' + Date.now();
    
      this.startCall();
    });
    
  }

  async startCall() {
    this.videoService.getToken(this.identity, this.roomName).subscribe(async token => {
      this.room = await this.videoService.joinRoom(token, this.roomName);
      // Attach local video
      this.room.localParticipant.videoTracks.forEach(publication => {
        const track = publication.track;
        if (track && typeof track.attach === 'function') {
          this.localVideo.nativeElement.appendChild(track.attach());
        }
      });
      // Attach remote video
      this.room.on('participantConnected', participant => {
        participant.tracks.forEach(publication => {
          const track = publication.track;
          if (track && track.kind === 'video' && typeof track.attach === 'function') {
            this.remoteVideo.nativeElement.appendChild(track.attach());
          }
        });
        participant.on('trackSubscribed', (track: RemoteTrack) => {
          if (track.kind === 'video' && typeof (track as RemoteVideoTrack).attach === 'function') {
            this.remoteVideo.nativeElement.appendChild((track as RemoteVideoTrack).attach());
          }
        });
      });
      // Attach already connected participants
      this.room.participants.forEach(participant => {
        participant.tracks.forEach(publication => {
          const track = publication.track;
          if (track && track.kind === 'video' && typeof track.attach === 'function') {
            this.remoteVideo.nativeElement.appendChild(track.attach());
          }
        });
        participant.on('trackSubscribed', (track: RemoteTrack) => {
          if (track.kind === 'video' && typeof (track as RemoteVideoTrack).attach === 'function') {
            this.remoteVideo.nativeElement.appendChild((track as RemoteVideoTrack).attach());
          }
        });
      });
    });
  }

  changeMicIcon() {
    this.micIcon = !this.micIcon;
    // TODO: Mute/unmute local audio track
  }
  changeVideoIcon() {
    this.videoIcon = !this.videoIcon;
    // TODO: Enable/disable local video track
  }
  fullscreen() {
    if(!document.fullscreenElement) {
      this.elem.requestFullscreen();
    }
    else {
      document.exitFullscreen();
    }
  }
  leaveRoom() {
    this.room?.disconnect();
  }
  ngOnDestroy() {
    this.leaveRoom();
  }
}
