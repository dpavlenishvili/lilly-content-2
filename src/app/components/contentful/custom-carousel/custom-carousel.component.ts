import {
  Component,
  computed,
  contentChild,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
  TemplateRef,
  Type,
  viewChild
} from '@angular/core';
import { CarouselComponent, CarouselModule, OwlOptions, SlidesOutputData } from 'ngx-owl-carousel-o';
import { CarouselCustomNavComponent } from '../carousel-custom-nav/carousel-custom-nav.component';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs/operators';

export interface CarouselBreakpoints {
  MOBILE: number;
  TABLET: number;
}

export const DEFAULT_BREAKPOINTS: CarouselBreakpoints = {
  MOBILE: 600,
  TABLET: 992
} as const;

@Component({
  selector: 'app-custom-carousel',
  templateUrl: './custom-carousel.component.html',
  styleUrls: ['./custom-carousel.component.scss'],
  standalone: true,
  imports: [
    CarouselModule,
    NgClass,
    NgTemplateOutlet,
    CarouselCustomNavComponent
  ],
})
export class CustomCarouselComponent {
  readonly items = input([]);
  readonly maxVisibleCards = input<number>(3);
  readonly customCarouselStyleClass = input<string>('');
  readonly optionsOverride = input<Partial<OwlOptions>>();
  readonly shouldShowNavigation = input<boolean>(true);
  readonly shouldShowProgressBar = input<boolean>(false);
  readonly breakpoints = input<CarouselBreakpoints>(DEFAULT_BREAKPOINTS);

  readonly carouselChanged = output<SlidesOutputData>();

  readonly slideTemplate = contentChild('slideTemplate', { read: TemplateRef<Type<unknown>> });
  readonly owlCar = viewChild<CarouselComponent>('owlCar');

  readonly carouselWasLoaded = signal<boolean>(false);
  readonly currentSlideIndex = signal<number>(0);
  readonly currentSlideBy = signal<number>(this.getSlideByFromWidth());
  readonly visibleSlides = signal<number>(1);

  // Track the current page index directly instead of deriving from startPosition
  // This fixes the issue where partially-filled last slides report incorrect startPosition
  readonly currentPageIndex = signal<number>(0);

  readonly totalSlides = computed(() => this.items().length);

  readonly totalPages = computed(() => {
    const total = this.totalSlides();
    const slideBy = this.currentSlideBy();
    return Math.max(1, Math.ceil(total / slideBy));
  });

  readonly currentPage = computed(() => this.currentPageIndex());

  readonly paginationPages = computed(() => {
    return Array(this.totalPages()).fill(0);
  });

  readonly progressPercentage = computed(() => {
    const totalPagesCount = this.totalPages();
    const currentPageIndex = this.currentPage();

    // If there's only one page, show 100% filled
    if (totalPagesCount <= 1) return 100;

    // Calculate progress based on pages/slides, not individual items
    // Add 1 to currentPageIndex so the first page shows as filled (e.g., 25% for 4 total pages)
    return Math.min(100, ((currentPageIndex + 1) / totalPagesCount) * 100);
  });

  readonly isPrevDisabled = computed(() => this.currentPage() <= 0);

  readonly isNextDisabled = computed(() => this.currentPage() >= this.totalPages() - 1);

  readonly carouselOptions = computed<OwlOptions>(() => {
    const maxCards = this.maxVisibleCards();
    const bp = this.breakpoints();

    const defaultOptions: OwlOptions = {
      loop: false,
      mouseDrag: true,
      touchDrag: true,
      pullDrag: true,
      dots: false,
      nav: true,
      navSpeed: 600,
      navText: ['', ''],
      responsive: {
        0: {
          items: 1,
          slideBy: 1,
          stagePadding: 0,
          margin: 24,
          nav: false
        },
        [bp.MOBILE]: {
          items: 2,
          slideBy: 2,
          stagePadding: 0,
          margin: 24,
          nav: false
        },
        [bp.TABLET]: {
          items: maxCards,
          slideBy: maxCards,
          stagePadding: 0,
          margin: 24,
          nav: true
        }
      },
      autoWidth: false,
      autoHeight: false
    };

    return this.optionsOverride()
      ? { ...defaultOptions, ...this.optionsOverride() }
      : defaultOptions;
  });

  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      const currentItems = this.items();
      if (currentItems && currentItems.length) {
        this.carouselWasLoaded.set(true);
        this.currentSlideIndex.set(0);
        this.currentPageIndex.set(0);
      } else {
        this.carouselWasLoaded.set(false);
      }
    }, { allowSignalWrites: true });

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

  onCarouselChanged(event: SlidesOutputData): void {
    const slideByValue = this.getSlideByFromWidth();
    this.currentSlideBy.set(slideByValue);

    const visibleCount = event.slides?.length || 1;
    this.visibleSlides.set(visibleCount);

    if (event.startPosition !== undefined) {
      this.currentSlideIndex.set(event.startPosition);

      // Calculate the correct page index
      // For partially-filled last slides, Owl Carousel may report a different startPosition
      // to keep the viewport full, so we need to detect if we're on the last page
      const totalItems = this.items().length;
      const startPos = event.startPosition;
      const isLastPage = startPos + slideByValue >= totalItems;

      if (isLastPage) {
        const totalPagesCount = Math.ceil(totalItems / slideByValue);
        this.currentPageIndex.set(totalPagesCount - 1);
      } else {
        const calculatedPage = Math.floor(startPos / slideByValue);
        this.currentPageIndex.set(calculatedPage);
      }
    }

    this.carouselChanged.emit(event);
  }

  goPrev(): void {
    const carousel = this.owlCar();
    if (carousel && !this.isPrevDisabled()) {
      carousel.prev();
    }
  }

  goNext(): void {
    const carousel = this.owlCar();
    if (carousel && !this.isNextDisabled()) {
      carousel.next();
    }
  }

  goToPage(pageIndex: number): void {
    const current = this.currentPage();
    const diff = pageIndex - current;

    if (diff === 0) return;

    const carousel = this.owlCar();
    const iterations = Math.abs(diff);

    if (diff > 0) {
      for (let i = 0; i < iterations; i++) {
        carousel?.next();
      }
    } else {
      for (let i = 0; i < iterations; i++) {
        carousel?.prev();
      }
    }
  }

  toSlide(position: string): void {
    this.owlCar()?.to(position);
    this.currentPageIndex.set(0);
  }

  private getSlideByFromWidth(): number {
    const width = window.innerWidth;
    const maxCards = this.maxVisibleCards();
    const bp = this.breakpoints();

    if (width < bp.MOBILE) return 1;
    if (width < bp.TABLET) return 2;
    return maxCards;
  }
}
