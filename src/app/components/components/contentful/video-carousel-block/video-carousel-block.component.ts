import { ChangeDetectionStrategy, Component, computed, inject, input, signal, viewChild } from '@angular/core';
import { IVideoCard, IVideoCarouselBlockFields, IVideoCategoryTab } from '../models/contentful';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { HelperService } from '../../../services/helper.service';
import { LinkBehavior } from '@careboxhealth/core';
import {
  OneRowNavigationComponent
} from '../../../shared-features/ui/components/one-row-navigation/one-row-navigation.component';
import { AppIconRegistry } from '../../../services/app-icon-registry.service';
import { VideoCardComponent } from './video-card/video-card.component';
import { CustomCarouselComponent } from '../custom-carousel/custom-carousel.component';
import { CarouselCustomNavComponent } from '../carousel-custom-nav/carousel-custom-nav.component';

export const VIDEO_CAROUSEL_BREAKPOINTS = {
  MOBILE: 600,
  TABLET: 992
} as const;

@Component({
  selector: 'lilly-content-video-carousel-block',
  templateUrl: './video-carousel-block.component.html',
  styleUrl: './video-carousel-block.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatButton,
    MatIcon,
    MatFormField,
    MatSelect,
    MatOption,
    OneRowNavigationComponent,
    VideoCardComponent,
    CustomCarouselComponent,
    CarouselCustomNavComponent
  ]
})
export class VideoCarouselBlockComponent {
  readonly customCarousel = viewChild<CustomCarouselComponent>('customCarousell');
  readonly videoCarouselBlockFields = input.required<IVideoCarouselBlockFields>();
  readonly fields = computed(() => this.videoCarouselBlockFields());
  readonly selectedCategory = signal<string>('all');
  readonly filteredVideos = computed(() => {
    const fields = this.fields();
    const category = this.selectedCategory();

    if (!fields?.videoCards) return [];

    if (category === 'all') {
      return fields.videoCards;
    }

    return fields.videoCards.filter(card =>
      card?.fields?.filterTag === category
    );
  });

  readonly carouselBreakpoints = VIDEO_CAROUSEL_BREAKPOINTS;

  readonly helperService: HelperService = inject(HelperService);

  constructor(iconRegistry: AppIconRegistry) {
    iconRegistry.addSvgIcon('play', '/assets/svg/lilly/play.svg');
    iconRegistry.addSvgIcon('play', '/assets/svg/lilly/pause.svg');
  }

  onCategoryClick(category: IVideoCategoryTab): void {
    this.selectedCategory.set(category?.fields?.filterValue);
    this.customCarousel()?.toSlide('0');
  }

  onCategoryChange(value: string): void {
    this.selectedCategory.set(value);
    this.customCarousel()?.toSlide('0');
  }

  onVideoClick(video: IVideoCard): void {
    if (video?.fields?.videoUrl) {
      // this.helperService.goToLink(video?.fields?.videoUrl, LinkBehavior.NewTab);
    }
  }

  onCtaClick(): void {
    const ctaButton = this.fields()?.ctaButton;
    if (ctaButton?.fields) {
      this.helperService.goToLink(
        ctaButton?.fields?.link,
        ctaButton?.fields?.linkBehavior
      );
    }
  }

  onViewAllClick(event: Event): void {
    event.preventDefault();
    const viewAllButton = this.fields()?.viewAllButton;
    if (viewAllButton?.fields) {
      this.helperService.goToLink(
        viewAllButton?.fields?.link,
        viewAllButton?.fields?.linkBehavior
      );
    }
  }
}
