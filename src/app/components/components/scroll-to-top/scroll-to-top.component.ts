import { ChangeDetectionStrategy, Component, HostListener, Inject, OnInit } from '@angular/core';
import { AsyncPipe, DOCUMENT, NgClass } from '@angular/common';
import { ScrollToTopService } from '../../services/scroll-to-top.service';
import { filter } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-scroll-to-top',
  templateUrl: './scroll-to-top.component.html',
  styleUrls: ['./scroll-to-top.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass,
    AsyncPipe,
    MatMiniFabButton,
    MatIcon
  ],
  standalone: true
})
export class ScrollToTopComponent implements OnInit {
  windowScrolled: boolean;
  constructor(
    @Inject(DOCUMENT) private document: Document,
    public scrollToTopService: ScrollToTopService,
    private router: Router
  ) {}
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (window.pageYOffset && window.pageYOffset >= 240) {
      this.windowScrolled = true;
    } else if (this.windowScrolled && window.pageYOffset < 240) {
      this.windowScrolled = false;
    }
  }

  ngOnInit(): void {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.scrollToTopService.setDefaultData();
    });
  }

  scrollToTop(): void {
    window.scroll(0, 0);
  }
}
