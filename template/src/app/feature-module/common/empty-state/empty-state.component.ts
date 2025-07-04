import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss'],
  standalone: false
})
export class EmptyStateComponent {
  @Input() icon: string = 'fa-solid fa-calendar-check';
  @Input() title: string = 'No Data';
  @Input() message: string = 'There is nothing to show.';
} 