import { ChangeDetectionStrategy, Component, computed, inject, input, signal, ViewChild } from '@angular/core';
import { IVideoCarouselBlockFields, IVideoCard, IVideoCategoryTab } from '../models/contentful';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { HelperService } from '../../../services/helper.service';
import { LinkBehavior } from '@careboxhealth/core';
import { CarouselModule, OwlOptions, CarouselComponent, NavData, SlidesOutputData } from 'ngx-owl-carousel-o';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { OneRowNavigationComponent } from '../../../shared-features/ui/components/one-row-navigation/one-row-navigation.component';

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
    NgClass,
    CarouselModule,
    MatFormFieldModule,
    MatSelectModule,
    OneRowNavigationComponent
  ]
})
export class VideoCarouselBlockComponent {
  @ViewChild('owlCarousel', { static: true }) owlCarousel?: CarouselComponent;

  readonly videoCarouselBlockFields = input.required<IVideoCarouselBlockFields>();
  readonly fields = computed(() => this.videoCarouselBlockFields());
  readonly selectedCategory = signal<string>('all');
  readonly isPrevDisabled = signal(true);
  readonly isNextDisabled = signal(false);
  readonly scrollProgress = signal<number>(0);

  private readonly helperService = inject(HelperService);

  readonly maxVisibleCards = computed(() => this.fields()?.maxVisibleCards || 3);

  readonly filteredVideos = computed(() => {
    const fields = this.fields();
    const category = this.selectedCategory();
    if (!fields?.videoCards) return [];
    if (category === 'all') {
      return fields.videoCards;
    }
    return fields.videoCards.filter(card => card.fields.filterTag === category);
  });

  readonly customOptions = computed<OwlOptions>(() => ({
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1,
        slideBy: 1,
        dots: true,
        stagePadding: 20
      },
      600: {
        items: 2,
        slideBy: 2,
        dots: true,
        stagePadding: 40
      },
      992: {
        items: this.maxVisibleCards(),
        slideBy: this.maxVisibleCards(),
        dots: false,
        stagePadding: 0
      }
    },
    nav: false
  }));

  onCategoryClick(category: IVideoCategoryTab): void {
    this.selectedCategory.set(category.fields.filterValue);
    this.owlCarousel?.to(0);
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

  onNavData(data: NavData): void {
    this.isPrevDisabled.set(data.prev.disabled);
    this.isNextDisabled.set(data.next.disabled);
  }

  onChanged(data: SlidesOutputData): void {
    if (data.startPosition !== undefined && this.owlCarousel) {
      const totalSlides = this.filteredVideos().length;
      const visibleSlides = this.owlCarousel.slidesData.itemsCount;

      if (totalSlides > visibleSlides) {
        const lastPossibleStartPosition = totalSlides - visibleSlides;
        if (lastPossibleStartPosition > 0) {
          const progress = (data.startPosition / lastPossibleStartPosition) * 100;
          this.scrollProgress.set(Math.min(100, Math.max(0, progress)));
        } else {
          this.scrollProgress.set(data.startPosition > 0 ? 100 : 0);
        }
      } else {
        this.scrollProgress.set(0);
      }
    }
  }

  next(): void {
    this.owlCarousel?.next();
  }

  prev(): void {
    this.owlCarousel?.prev();
  }
}
