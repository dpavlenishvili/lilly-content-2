import { AfterViewInit, Component, ElementRef, OnDestroy, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { NgClass } from '@angular/common';

@Component({
  selector: 'lilly-one-row-navigation',
  standalone: true,
  templateUrl: './one-row-navigation.component.html',
  imports: [
    MatButtonModule,
    NgClass
  ],
  styleUrl: './one-row-navigation.component.scss'
})
export class OneRowNavigationComponent implements AfterViewInit, OnDestroy {
  @ViewChild('menu') menu: ElementRef;
  @ViewChild('menuContainer') menuContainer!: ElementRef;
  @ViewChild('menuWrapper') menuWrapper!: ElementRef;
  resizeObserver: ResizeObserver;
  showScroll = signal(false);
  isMenuSticky = false;

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(() => {
      const containerElement = this.menuContainer.nativeElement as HTMLElement;
      const needsScroll = containerElement.scrollWidth > containerElement.clientWidth;
      this.showScroll.set(needsScroll);
    });

    this.resizeObserver.observe(this.menuContainer.nativeElement);
    this.resizeObserver.observe(this.menu.nativeElement);
  }

  scrollRight(): void {
    this.menuContainer.nativeElement.scrollTo({
      left: this.menuContainer.nativeElement.scrollLeft + 150,
      behavior: 'smooth'
    });
  }

  scrollLeft(): void {
    this.menuContainer.nativeElement.scrollTo({
      left: this.menuContainer.nativeElement.scrollLeft - 150,
      behavior: 'smooth'
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }
}
