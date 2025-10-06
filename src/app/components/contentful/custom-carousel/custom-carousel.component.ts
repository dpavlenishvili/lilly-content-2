import {
  AfterViewInit, ChangeDetectorRef,
  Component,
  computed,
  ContentChild,
  effect,
  HostListener, inject,
  input,
  Signal,
  TemplateRef, Type,
  ViewChild
} from '@angular/core';
import { CarouselComponent, CarouselModule, OwlOptions, SlidesOutputData } from 'ngx-owl-carousel-o';
import { CarouselCustomNavComponent } from '../carousel-custom-nav/carousel-custom-nav.component';
import { NgClass, NgTemplateOutlet } from '@angular/common';

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
  items = input([]);
  maxVisibleCards = input<number>(3);
  customCarouselStyleClass = input<string>('');
  optionsOverride = input<Partial<OwlOptions>>();
  shouldShowNavigation = input<boolean>(true);
  @ContentChild('slideTemplate', { read: TemplateRef }) slideTemplate: TemplateRef<Type<unknown>>;
  @ViewChild('owlCar') owlCar: CarouselComponent;
  carouselWasLoaded = false;
  activeIndex: number = 0;
  pages: number[] = [];
  totalPages: number = 0;
  cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  viewportState: 'at-start' | 'in-middle' | 'at-end' = 'at-start';
  finalOptions: Signal<OwlOptions> = computed(() => {
    const defaultOptions: OwlOptions = {
      nav: false,
      navSpeed: 500,
      dots: false,
      slideBy: 1,
      mouseDrag: true,
      margin: 24,
      stagePadding: 16,
      navText: ['', ''],
      responsive: {
       0: {
          items: 1,
          margin: 16,
          stagePadding: 16,
        },
        576: {
          items: 2,

        },
        992: {
          items: this.maxVisibleCards(),

        },
        1339: {
          stagePadding: 170,
          items: this.maxVisibleCards()
        }
      }
    };

    return this.optionsOverride()
      ? this.optionsOverride()
      : defaultOptions;
  });
  itemsHandleEffect = effect(() => {
    const currentItems = this.items();
    if (currentItems && currentItems.length) {
      this.carouselWasLoaded = true;
      this.activeIndex = 0;
      this.buildPages();
      this.updateViewportState();
    } else {
      this.carouselWasLoaded = false;
    }
    this.cdr.markForCheck();
  });
  @HostListener('window:resize')
  onWindowResize(): void {
    this.buildPages();
    if (this.activeIndex > this.totalPages - 1) {
      this.activeIndex = Math.max(0, this.totalPages - 1);
      if (this.owlCar) {
        this.owlCar.moveByDot(`dot-${this.activeIndex}`);
      }
    }
    this.updateViewportState();
  }

  ngAfterViewInit(): void {
    if (this.carouselWasLoaded) {
      const resizeEvent = new Event('resize');
      window.dispatchEvent(resizeEvent);
    }
  }

  onTranslated(data: SlidesOutputData): void {
    if (data && typeof data.startPosition === 'number') {
      this.activeIndex = data.startPosition;
      this.updateViewportState();
    }
  }

  goPrev(): void {
    if (this.owlCar) {
      this.activeIndex = Math.max(0, this.activeIndex - 1);
      this.updateViewportState();
      this.owlCar.prev();
    }
  }

  goNext(): void {
    if (this.owlCar) {
      this.activeIndex = Math.min(this.totalPages - 1, this.activeIndex + 1);
      this.updateViewportState();
      this.owlCar.next();
    }
  }

  isPrevDisabled(): boolean {
    return this.activeIndex <= 0;
  }

  isNextDisabled(): boolean {
    return this.activeIndex >= this.totalPages - 1;
  }

  private updateViewportState(): void {
    if (this.isPrevDisabled()) {
      this.viewportState = 'at-start';
    } else if (this.isNextDisabled()) {
      this.viewportState = 'at-end';
    } else {
      this.viewportState = 'in-middle';
    }
  }

  private buildPages(): void {
    const vis = Math.max(1, this.visibleItems);
    const len = this.totalItems;
    const pages = Math.max(0, len - vis) + 1;
    this.totalPages = pages;
    this.pages = Array.from({ length: pages }, (_, i) => i);
  }

  private get visibleItems(): number {
    const win = typeof window !== 'undefined' ? window : undefined;
    const width = win?.innerWidth || 0;
    const responsive = this.finalOptions().responsive as Record<number, { items?: number }> | undefined;

    if (responsive) {
      const breakpoints = Object.keys(responsive)
        .map(Number)
        .sort((a, b) => a - b);

      let itemsAtWidth: number | undefined;
      for (const bp of breakpoints) {
        if (width >= bp) {
          const conf = responsive[bp];
          if (conf && typeof conf.items === 'number') {
            itemsAtWidth = conf.items;
          }
        }
      }
      if (typeof itemsAtWidth === 'number') return itemsAtWidth;
    }
    return this.maxVisibleCards();
  }

  private get totalItems(): number {
    return this.items()?.length || 0;
  }
}
