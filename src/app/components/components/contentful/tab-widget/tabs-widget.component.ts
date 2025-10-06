import { NgClass, NgForOf, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, HostBinding,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID
} from '@angular/core';
import { ITabContent, ITabsWidgetFields } from '../models/contentful';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { TabContentComponent } from './tab-content/tab-content.component';
import { MatIconButton } from '@angular/material/button';

interface ITabContentCustom extends ITabContent {
  tabIndex: number;
}

@Component({
  selector: 'lilly-tabs-widget',
  templateUrl: './tabs-widget.component.html',
  styleUrls: ['./tabs-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass,
    MatTabGroup,
    NgForOf,
    MatTab,
    TabContentComponent,
    NgIf,
    MatIconButton
  ],
  standalone: true
})
export class TabsWidgetComponent implements OnInit, OnDestroy {

  public animationEnabled = false;
  @HostBinding('class.hasOneSlide') hasOneSlide = false;
  @HostBinding('class.disabled-animations') animationDisabled = true;
  @Input()
  set tabsWidgetFields(value: ITabsWidgetFields) {
    if (!value) {
      return;
    }
    this.tabs = value?.tabs?.map((tab, i) => ({ tabIndex: i, ...tab }));
    this.hasOneSlide = (this.tabs.length === 1);
  }

  tabs: ITabContentCustom[] = [];
  tabActiveIndex = 0;
  tabInterval = 10000;
  tabsTimerId: ReturnType<typeof setInterval>;
  currentTabTitle: string;

  constructor(private cdr: ChangeDetectorRef, @Inject(PLATFORM_ID) protected platformId) {
  }

  onTabChange(): void {
    this.currentTabTitle = this.tabs.find((tba, i) => this.tabActiveIndex === i).fields.heading;
    this.animationEnabled = true;
    this.cdr.markForCheck();
  }

  ngOnInit() {
    this.startTimer();
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  startTimer() {
    this.stopTimer();
    this.tabsTimerId = setInterval(() => {
      this.animationDisabled = false;

      this.nextTab();
      this.cdr.markForCheck();
    }, this.tabInterval);
  }

  stopTimer() {
    if (this.tabsTimerId) {
      window.clearInterval(this.tabsTimerId);
    }
  }

  onSwipe(evt) {
    Math.abs(evt.deltaX) > 21 ? (evt.deltaX > 0 ? this.prevTab() : this.nextTab()) : '';
  }

  nextTab() {
    this.tabActiveIndex = (this.tabActiveIndex + 1) % this.tabs?.length;
    this.cdr.markForCheck();
  }

  prevTab() {
    this.tabActiveIndex =
      this.tabActiveIndex > 0 ? (this.tabActiveIndex - 1) % this.tabs?.length : this.tabs?.length - 1;
    this.cdr.markForCheck();
  }
}
