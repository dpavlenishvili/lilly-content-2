import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { IVideoCard } from '../../models/contentful';

@Component({
  selector: 'lilly-video-card',
  templateUrl: './video-card.component.html',
  styleUrl: './video-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatIcon],
})
export class VideoCardComponent {
  readonly video = input.required<IVideoCard>();
  readonly cardClick = output<IVideoCard>();
  readonly playClick = output<Event>();
}
