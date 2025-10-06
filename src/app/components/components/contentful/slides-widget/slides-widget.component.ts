import { AfterViewInit, ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ISlidesWidgetFields } from '../models/contentful';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { MdToHtmlPipe } from '../../../pipes/md-to-html.pipe';

@Component({
  selector: 'lilly-slides-widget',
  templateUrl: './slides-widget.component.html',
  styleUrls: ['./slides-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CarouselModule,
    MdToHtmlPipe
  ],
  standalone: true
})
export class SlidesWidgetComponent implements AfterViewInit {
  @Input() slidesWidgetFields: ISlidesWidgetFields;

  customOptions: OwlOptions = {
    nav: true,
    navSpeed: 500,
    dots: true,
    mouseDrag: false,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      }
    }
  };

  ngAfterViewInit(): void {
    // For correct carousel view after view init
    window.dispatchEvent(new Event('resize'));
  }
}
