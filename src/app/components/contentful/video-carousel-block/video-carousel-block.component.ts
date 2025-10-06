import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  signal,
  viewChild
} from '@angular/core';
import { IVideoCard, IVideoCarouselBlockFields, IVideoCategoryTab } from '../models/contentful';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { HelperService } from '../../../services/helper.service';
import { LinkBehavior } from '@careboxhealth/core';
import { CarouselComponent, CarouselModule, OwlOptions, SlidesOutputData } from 'ngx-owl-carousel-o';
import {
  OneRowNavigationComponent
} from '../../../shared-features/ui/components/one-row-navigation/one-row-navigation.component';
import { AppIconRegistry } from '../../../services/app-icon-registry.service';
import { VideoCardComponent } from './video-card/video-card.component';
import { fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs/operators';

export const BREAKPOINTS = {
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
    CarouselModule,
    OneRowNavigationComponent,
    VideoCardComponent
  ]
})
export class VideoCarouselBlockComponent {
  readonly owlCarousel = viewChild<CarouselComponent>('owlCarousel');

  readonly videoCarouselBlockFields = input.required<IVideoCarouselBlockFields>();
  readonly fields = computed(() => this.videoCarouselBlockFields());
  readonly selectedCategory = signal<string>('all');

  readonly currentSlideIndex = signal<number>(0);
  readonly currentSlideBy = signal<number>(1);
  readonly visibleSlides = signal<number>(1);

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
  readonly totalSlides = computed(() => this.filteredVideos().length);
  readonly carouselOptions = computed<OwlOptions>(() => {
    const maxVisibleCards = this.fields()?.maxVisibleCards || 3;

    return {
      loop: false,
      mouseDrag: true,
      touchDrag: true,
      pullDrag: true,
      dots: false,
      nav: true,
      navSpeed: 600,
      responsive: {
        0: {
          items: 1,
          slideBy: 1,
          stagePadding: 0,
          margin: 24,
          nav: false
        },
        [BREAKPOINTS.MOBILE]: {
          items: 2,
          slideBy: 2,
          stagePadding: 0,
          margin: 24,
          nav: false
        },
        [BREAKPOINTS.TABLET]: {
          items: maxVisibleCards,
          slideBy: maxVisibleCards,
          stagePadding: 0,
          margin: 24,
          nav: true
        }
      },
      autoWidth: false,
      autoHeight: false
    };
  });
  readonly totalPages = computed(() => {
    const total = this.totalSlides();
    const slideBy = this.currentSlideBy();
    return Math.ceil(total / slideBy);
  });
  readonly currentPage = computed(() => {
    const current = this.currentSlideIndex();
    const slideBy = this.currentSlideBy();
    return Math.floor(current / slideBy);
  });
  readonly paginationPages = computed(() => {
    return Array(this.totalPages()).fill(0);
  });
  readonly progressPercentage = computed(() => {
    const total = this.totalSlides();
    const visible = this.visibleSlides();
    const current = this.currentSlideIndex();

    if (total <= visible) return 100;

    const maxIndex = total - visible;
    return Math.min(100, (current / maxIndex) * 100);
  });

  readonly helperService: HelperService = inject(HelperService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  constructor(iconRegistry: AppIconRegistry,) {
    iconRegistry.addSvgIcon('play', '/assets/svg/lilly/play.svg');
    fromEvent(window, 'resize')
      .pipe(
        debounceTime(150),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        const slideByValue = this.getSlideByFromWidth();
        this.currentSlideBy.set(slideByValue);
      });
  }

  onCategoryClick(category: IVideoCategoryTab): void {
    this.selectedCategory.set(category?.fields?.filterValue);
    this.owlCarousel()?.to('0');
  }

  onCategoryChange(value: string): void {
    this.selectedCategory.set(value);
    this.owlCarousel()?.to('0');
  }

  onVideoClick(video: IVideoCard): void {
    if (video?.fields?.videoUrl) {
      this.helperService.goToLink(video?.fields?.videoUrl, LinkBehavior.NewTab);
    }
  }

  onCtaClick(): void {
    const ctaButton = this.fields()?.ctaButton;
    if (ctaButton?.fields) {
      this.helperService.goToLink(
        ctaButton?.fields?.link,
        ctaButton?.fields?.linkBehavior as LinkBehavior
      );
    }
  }

  onCarouselChanged(event: SlidesOutputData): void {
    if (event.startPosition !== undefined) {
      this.currentSlideIndex.set(event.startPosition);
    }

    const visibleCount = event.slides?.length || 1;
    this.visibleSlides.set(visibleCount);

    const slideByValue = this.getSlideByFromWidth();
    this.currentSlideBy.set(slideByValue);
  }

  goToPage(pageIndex: number): void {
    const current = this.currentPage();
    const diff = pageIndex - current;

    if (diff === 0) return;

    const iterations = Math.abs(diff);

    if (diff > 0) {
      for (let i = 0; i < iterations; i++) {
        this.owlCarousel()?.next();
      }
    } else {
      for (let i = 0; i < iterations; i++) {
        this.owlCarousel()?.prev();
      }
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

  private getSlideByFromWidth(): number {
    const width = window.innerWidth;
    const maxVisibleCards = this.fields()?.maxVisibleCards || 3;

    if (width < BREAKPOINTS.MOBILE) return 1;
    if (width < BREAKPOINTS.TABLET) return 2;
    return maxVisibleCards;
  }
}
