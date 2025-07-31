import {
  Component,
  ElementRef,
  ViewChild,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VideoService } from 'src/app/shared/video.service';
import { routes } from 'src/app/shared/routes/routes';
import {
  Room,
  RemoteTrack,
  RemoteVideoTrack,
  RemoteAudioTrack,
  LocalTrackPublication,
  RemoteTrackPublication,
  LocalVideoTrack,
  LocalAudioTrack
} from 'twilio-video';

@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.scss'],
  standalone: false,
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
  currentUser: any;
  showUser: { name: string; profileImgUrl: string; } | undefined;

  constructor(private videoService: VideoService, private route: ActivatedRoute) {}

  ngAfterViewInit() {
    this.route.queryParams.subscribe((params) => {
      const doctorId = params['doctorId'];
      const patientId = params['patientId'];

      const ids = [doctorId, patientId].sort();
      this.roomName = `room-${ids[0]}-${ids[1]}`;

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      this.currentUser = user;
       const otherUserId = user.role === 'patient' ? doctorId : patientId;

    // 🔹 Fetch other user's details (name & profileImage)
    this.videoService.getUserById(otherUserId)
      .then((res: any) => {
        this.showUser = {
          name: res.data?.name ?? res.name ?? 'Unknown',
          profileImgUrl: res.data?.profileImgUrl ?? res.profileImgUrl ?? 'assets/img/patients/patient1.jpg',
        };
      })
      .catch(() => {
        this.showUser = {
          name: 'Unknown',
          profileImgUrl: 'assets/img/patients/patient1.jpg'
        };
      });
      this.identity = user?.id || user?._id || 'guest-' + Date.now();

      this.startCall();
    });
  }

  async startCall() {
    this.videoService.getToken(this.identity, this.roomName).subscribe(async (token) => {
      this.room = await this.videoService.joinRoom(token, this.roomName);

      // Attach local tracks
      this.room.localParticipant.videoTracks.forEach((publication: LocalTrackPublication) => {
        // const track = publication.track as LocalVideoTrack;
        // if (track) {
        //   this.localVideo.nativeElement.appendChild(track.attach());
        // }
        const track = publication.track as LocalVideoTrack;
if (track) {
  const videoEl = track.attach();
  videoEl.style.width = '100%';
  videoEl.style.height = '100%';
  videoEl.style.objectFit = 'contain'; // ✅ Avoid zooming
  videoEl.style.backgroundColor = 'black'; // Optional
  this.localVideo.nativeElement.appendChild(videoEl);
}

      });

      this.room.localParticipant.audioTracks.forEach((publication: LocalTrackPublication) => {
        const track = publication.track as LocalAudioTrack;
        if (track) {
          document.body.appendChild(track.attach());
        }
      });

      const attachTrack = (track: RemoteTrack) => {
        if (track.kind === 'video') {
          this.remoteVideo.nativeElement.appendChild((track as RemoteVideoTrack).attach());
        } else if (track.kind === 'audio') {
          document.body.appendChild((track as RemoteAudioTrack).attach());
        }
      };

      const handleParticipant = (participant: any) => {
        participant.tracks.forEach((publication: RemoteTrackPublication) => {
          if (publication.isSubscribed && publication.track) {
            attachTrack(publication.track);
          }
        });

        participant.on('trackSubscribed', (track: RemoteTrack) => {
          attachTrack(track);
        });
      };

      // Attach already connected participants
      this.room.participants.forEach(handleParticipant);

      // Listen for new participants
      this.room.on('participantConnected', handleParticipant);
    });
  }

  changeMicIcon() {
    this.micIcon = !this.micIcon;
    this.room?.localParticipant.audioTracks.forEach((publication: LocalTrackPublication) => {
      const track = publication.track as LocalAudioTrack;
      if (track) {
        this.micIcon ? track.enable() : track.disable();
      }
    });
  }

  changeVideoIcon() {
    this.videoIcon = !this.videoIcon;
    this.room?.localParticipant.videoTracks.forEach((publication: LocalTrackPublication) => {
      const track = publication.track as LocalVideoTrack;
      if (track) {
        this.videoIcon ? track.enable() : track.disable();
      }
    });
  }

  fullscreen() {
    if (!document.fullscreenElement) {
      this.elem.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  leaveRoom() {
    this.room?.disconnect();
  }

  endCall() {
  this.leaveRoom();
  window.history.back(); 
}


  ngOnDestroy() {
    this.leaveRoom();
  }
}
