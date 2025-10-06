import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  computed,
  ContentChild,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
  TemplateRef,
  Type,
  ViewChild
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
export class CustomCarouselComponent implements AfterViewInit {
  readonly items = input([]);
  readonly maxVisibleCards = input<number>(3);
  readonly customCarouselStyleClass = input<string>('');
  readonly optionsOverride = input<Partial<OwlOptions>>();
  readonly shouldShowNavigation = input<boolean>(true);
  readonly shouldShowProgressBar = input<boolean>(false);
  readonly breakpoints = input<CarouselBreakpoints>(DEFAULT_BREAKPOINTS);

  readonly carouselChanged = output<SlidesOutputData>();

  @ContentChild('slideTemplate', { read: TemplateRef }) slideTemplate: TemplateRef<Type<unknown>>;
  @ViewChild('owlCar') owlCar: CarouselComponent;

  readonly carouselWasLoaded = signal<boolean>(false);
  readonly currentSlideIndex = signal<number>(0);
  readonly currentSlideBy = signal<number>(1);
  readonly visibleSlides = signal<number>(1);

  readonly totalSlides = computed(() => this.items().length);

  readonly totalPages = computed(() => {
    const total = this.totalSlides();
    const slideBy = this.currentSlideBy();
    return Math.max(1, Math.ceil(total / slideBy));
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

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      const currentItems = this.items();
      if (currentItems && currentItems.length) {
        this.carouselWasLoaded.set(true);
        this.currentSlideIndex.set(0);
      } else {
        this.carouselWasLoaded.set(false);
      }
      this.cdr.markForCheck();
    }, {allowSignalWrites: true});

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

  ngAfterViewInit(): void {
    if (this.carouselWasLoaded()) {
      setTimeout(() => {
        const resizeEvent = new Event('resize');
        window.dispatchEvent(resizeEvent);
      }, 0);
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

    this.carouselChanged.emit(event);
  }

  goPrev(): void {
    if (this.owlCar && !this.isPrevDisabled()) {
      this.owlCar.prev();
    }
  }

  goNext(): void {
    if (this.owlCar && !this.isNextDisabled()) {
      this.owlCar.next();
    }
  }

  goToPage(pageIndex: number): void {
    const current = this.currentPage();
    const diff = pageIndex - current;

    if (diff === 0) return;

    const iterations = Math.abs(diff);

    if (diff > 0) {
      for (let i = 0; i < iterations; i++) {
        this.owlCar?.next();
      }
    } else {
      for (let i = 0; i < iterations; i++) {
        this.owlCar?.prev();
      }
    }
  }

  toSlide(position: string): void {
    this.owlCar?.to(position);
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
