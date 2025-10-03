import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, signal, ViewChild } from '@angular/core';
import { IVideoCarouselBlockFields, IVideoCard, IVideoCategoryTab } from '../models/contentful';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { NgClass } from '@angular/common';
import { HelperService } from '../../../services/helper.service';
import { LinkBehavior } from '@careboxhealth/core';

@Component({
  selector: 'lilly-content-video-carousel-block',
  templateUrl: './video-carousel-block.component.html',
  styleUrls: ['./video-carousel-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatButton,
    MatIconButton,
    MatIcon,
    MatFormField,
    MatSelect,
    MatOption,
    NgClass
  ]
})
export class VideoCarouselBlockComponent {
  readonly videoCarouselBlockFields = input.required<IVideoCarouselBlockFields>();
  readonly fields = computed(() => this.videoCarouselBlockFields());

  readonly selectedCategory = signal<string>('all');

  @ViewChild('carousel', { read: ElementRef }) carousel?: ElementRef<HTMLDivElement>;

  private readonly helperService = inject(HelperService);

  readonly filteredVideos = computed(() => {
    const fields = this.fields();
    const category = this.selectedCategory();

    if (!fields?.videoCards) return [];

    if (category === 'all') {
      return fields.videoCards;
    }

    return fields.videoCards.filter(card =>
      card.fields.filterTag === category
    );
  });

  onCategoryClick(category: IVideoCategoryTab): void {
    this.selectedCategory.set(category.fields.filterValue);
  }

  onVideoClick(video: IVideoCard): void {
    if (video.fields.videoUrl) {
      this.helperService.goToLink(video.fields.videoUrl, LinkBehavior.NewTab);
    }
  }

  onCtaClick(): void {
    const ctaButton = this.fields()?.ctaButton;
    if (ctaButton?.fields) {
      this.helperService.goToLink(
        ctaButton.fields.link,
        ctaButton.fields.linkBehavior as LinkBehavior
      );
    }
  }

  scrollCarousel(direction: 'next' | 'prev'): void {
    const carouselEl = this.carousel?.nativeElement;
    if (!carouselEl) return;

    const scrollAmount = direction === 'next'
      ? carouselEl.offsetWidth
      : -carouselEl.offsetWidth;

    carouselEl.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  }
}
