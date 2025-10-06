import {ChangeDetectionStrategy, Component, Input, ViewChild } from '@angular/core';
import { ICardArrangementWidgetFields } from '../models/contentful';
import { CarouselModule, CarouselComponent } from 'ngx-owl-carousel-o';
import { ICmsAnalytics } from '../models/cmsanalytics';
import { CardWidget2Component } from './card-widget-2/card-widget-2.component';
import { NgClass } from '@angular/common';
import { CarouselCustomNavComponent } from './carousel-custom-nav/carousel-custom-nav.component';
import { CustomCarouselComponent } from './custom-carousel/custom-carousel.component';

@Component({
  selector: 'lilly-card-arrangement-widget',
  templateUrl: './card-arrangement-widget.component.html',
  styleUrls: ['./card-arrangement-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CardWidget2Component,
    CarouselModule,
    NgClass,
    CarouselCustomNavComponent,
    CustomCarouselComponent
  ],
  standalone: true
})
export class CardArrangementWidgetComponent {
  private _cardArrangementWidgetFields: ICardArrangementWidgetFields;
  @Input() cmsAnalytics: ICmsAnalytics;
  @Input() sectionshowTitle: boolean;
  @ViewChild('owlCar') owlCar: CarouselComponent;

  @Input()
  set cardArrangementWidgetFields(value: ICardArrangementWidgetFields) {
    this._cardArrangementWidgetFields = value;
  }

  get cardArrangementWidgetFields(): ICardArrangementWidgetFields {
    return this._cardArrangementWidgetFields;
  }

  get showCarousel(): boolean {
    const len = this._cardArrangementWidgetFields?.cards?.length || 0;
    const maxVis = this._cardArrangementWidgetFields?.maxVisibleCards || 3;
    return len > 1 && len !== maxVis;
  }
}
