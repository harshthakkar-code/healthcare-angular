import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
  standalone: false,
})
export class AvatarComponent implements OnInit {
  @Input() name: string = '';
  @Input() src: string = '';
  @Input() size: number = 40;
  @Input() gap: number = 10;
  @Input() marginRight: number = 0;
  @Input() marginLeft: number = 0;
  @Input() width?: number;
  @Input() height?: number;


  isDarkMode: boolean = false;

  ngOnInit() {
    const theme = localStorage.getItem('themeColor');
    this.isDarkMode = theme === 'dark-mode';
  }



  getInitials(): string {
    if (!this.name) return '?';
    const parts = this.name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  get avatarWidth(): string {
    return (this.width ?? this.size) + 'px';
  }

  get avatarHeight(): string {
    return (this.height ?? this.size) + 'px';
  }

}
