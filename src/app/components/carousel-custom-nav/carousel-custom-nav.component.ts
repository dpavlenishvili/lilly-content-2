import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-carousel-custom-nav',
  templateUrl: './carousel-custom-nav.component.html',
  styleUrl: './carousel-custom-nav.component.scss',
  standalone: true,
})
export class CarouselCustomNavComponent {
  isPrevDisabled = input<boolean>(false);
  isNextDisabled = input<boolean>(false);
  pages = input<number[]>([]);
  activeIndex = input<number>(0);
  goPrevEmit = output<void>();
  goNextEmit = output<void>();

  goPrev(): void {
    this.goPrevEmit.emit();
  }

  goNext(): void {
    this.goNextEmit.emit();
  }
}
