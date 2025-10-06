import {AfterViewInit, Component, Inject, Input, OnDestroy, OnInit} from '@angular/core';
import {IArticleFields, IPageFields} from '../models/contentful';
import {Subject, Subscription} from 'rxjs';
import {HelperService} from '../../../services/helper.service';
import { takeUntil } from 'rxjs/operators';
import { PageSectionsStateService } from '../../../services/page-sections-state.service';
import { NavTabsComponent } from './nav-tabs/nav-tabs.component';
import { DOCUMENT } from '@angular/common';
import { ScrollSpyElDirective } from '../../../shared-features/ui/directives/scroll-spy-el/scroll-spy-el.directive';
import {SectionWrapperModule} from '../../../shared-features/ui/components/section-wrapper/section-wrapper.module';

@Component({
  selector: 'lilly-nav-elements-tabs',
  templateUrl: './nav-elements-tabs.component.html',
  styleUrls: ['./nav-elements-tabs.component.scss'],
  imports: [
    NavTabsComponent,
    ScrollSpyElDirective,
    SectionWrapperModule
  ],
  standalone: true
})
export class NavElementsTabsComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() pageFields: IPageFields | IArticleFields;
  @Input() activeTab = '';
  @Input() hideNavOnMob = false;
  headerMenuWrapSubscription: Subscription;
  headerMenuWrap$ = null;
  navbarTabs: any = [];
  sections: string[] = [];

  private _onDestroy = new Subject<void>();

  constructor(
    private helperService: HelperService,
    private sectionsService: PageSectionsStateService,
    @Inject(DOCUMENT) protected document: Document,
  ) {}

  ngOnInit(): void {
    this.sectionsService.sectionsVisibility$.pipe(
      takeUntil(this._onDestroy),
    ).subscribe(visibility => {
      this.navbarTabs = [];
      this.sections = [];
      this.pageFields?.navElements?.map(el => {

        if (el?.fields?.sectionId in visibility && !visibility[el?.fields?.sectionId]) {
          if (this.activeTab === el.fields.sectionId) {
            this.activeTab = null;
          }
          return;
        }
        this.navbarTabs.push({ sectionId: el?.fields?.sectionId, title: el?.fields?.navTitle });
        this.sections.push(el?.fields?.sectionId);
      });
      if (!this.activeTab) {
        this.activeTab = this.navbarTabs[0]?.sectionId;
      }
    });
  }
  ngAfterViewInit(): void {
    this.headerMenuWrapSubscription = this.helperService.headerMenuWrapObs$.subscribe(wrap => {
      this.headerMenuWrap$ = wrap;
    });

  }
  ngOnDestroy() {
    this._onDestroy.next();
    this.headerMenuWrapSubscription.unsubscribe();
  }

  onSectionChange(sectionId: string) {
    this.activeTab = sectionId;
    this.scrollTabIntoView();
    this.helperService.onSectionChangeListener(sectionId);
  }

  scrollTo(sectionId: string): void {
    this.helperService.scrollToSection(sectionId);
  }

  scrollTabIntoView() {
    const sectionIndex = this.pageFields?.navElements.findIndex(el => el.fields.sectionId === this.activeTab);
    const activeTabElement = this.document.querySelectorAll('.tab')[sectionIndex];
    const arrowWidth = this.document.querySelector('.host__nav .mat-mdc-button-touch-target')?.getBoundingClientRect().width;
    const menu = this.document.querySelector('.host__content');
    if (arrowWidth && activeTabElement) {
      if(activeTabElement.getBoundingClientRect()?.left < 0) {
        menu.scrollTo({
          left: menu.scrollLeft + activeTabElement.getBoundingClientRect().left - arrowWidth,
          behavior: 'smooth'
        });
      }

      if (activeTabElement.getBoundingClientRect().right > this.document.documentElement.clientWidth) {
        menu.scrollTo({
          left: menu.scrollLeft + activeTabElement.getBoundingClientRect().right - this.document.documentElement.clientWidth + 2 * arrowWidth,
          behavior: 'smooth'
        });
      }
    }
  }

  get pageTitle(): string {
    return (this.pageFields as IPageFields)?.mainTitle?.replace('# ', '') || (this.pageFields as IArticleFields)?.title || '';
  }
}
