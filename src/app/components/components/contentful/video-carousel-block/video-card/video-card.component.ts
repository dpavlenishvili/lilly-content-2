import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  input,
  signal,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { IVideoCard } from '../../models/contentful';
import { MediaContentComponent } from '../../media-content/media-content/media-content.component';
import { MediaContentType } from "../../media-content/media-content-type.enum";

@Component({
  selector: 'lilly-video-card',
  templateUrl: './video-card.component.html',
  styleUrl: './video-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatIcon, MediaContentComponent],
})
export class VideoCardComponent {
  // --- INPUTS ---
  readonly video = input.required<IVideoCard>();

  // --- STATE ---
  readonly isPlaying = signal(false);

  // --- PUBLIC METHODS ---
  togglePlay(event: Event): void {
    event.stopPropagation();
    this.isPlaying.update(playing => !playing);
  }

  protected readonly MediaContentType = MediaContentType;
}
