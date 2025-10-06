import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-carousel-custom-nav',
  templateUrl: './carousel-custom-nav.component.html',
  styleUrl: './carousel-custom-nav.component.scss',
  standalone: true,
})
export class CarouselCustomNavComponent {
  // Navigation state
  readonly isPrevDisabled = input<boolean>(false);
  readonly isNextDisabled = input<boolean>(false);

  // Pagination
  readonly paginationPages = input<number[]>([]);
  readonly currentPage = input<number>(0);

  // Outputs
  readonly goPrevEmit = output<void>();
  readonly goNextEmit = output<void>();
  readonly goToPageEmit = output<number>();

  goPrev(): void {
    if (!this.isPrevDisabled()) {
      this.goPrevEmit.emit();
    }
  }

  goNext(): void {
    if (!this.isNextDisabled()) {
      this.goNextEmit.emit();
    }
  }

  goToPage(pageIndex: number): void {
    this.goToPageEmit.emit(pageIndex);
  }
}
