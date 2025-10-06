import { Component, Input, OnInit } from '@angular/core';
import { ISection, ISectionFields } from '../models/contentful';
import { SearchCriteria } from '../models/search-criteria';
import { PageType } from '../../blog/enums/page-type.enum';
import { HelperService } from 'src/app/services/helper.service';
import { Observable, of } from 'rxjs';
import { PageSectionsStateService } from '../../../services/page-sections-state.service';
import { AsyncPipe, NgClass, NgStyle } from '@angular/common';
import { ImageTileWidgetComponent } from '../image-tile-widget/image-tile-widget.component';
import { AccordionWidgetComponent } from '../accordion-widget/accordion-widget.component';
import { TextWidgetComponent } from '../text-widget/text-widget.component';
import { CardArrangementWidgetComponent } from '../card-arrangement-widget/card-arrangement-widget.component';
import { SlidesWidgetComponent } from '../slides-widget/slides-widget.component';
import { TrialsWidgetComponent } from '../trials-widget/trials-widget.component';
import { AlertMeWidgetComponent } from '../alert-me-widget/alert-me-widget.component';
import { ImageLinkWidgetComponent } from '../image-link-widget/image-link-widget.component';
import { QuestionnaireWidgetComponent } from '../questionnaire-widget/questionnaire-widget.component';
import { QuizWidgetComponent } from '../quiz-widget/quiz-widget.component';
import { BmiCalculatorWidgetComponent } from '../bmi-calculator-widget/bmi-calculator-widget.component';
import { FindClinicalTrialWidgetComponent } from '../find-clinical-trial-widget/find-clinical-trial-widget.component';
import { BlockquoteWidgetComponent } from '../blockquote-widget/blockquote-widget.component';
import { SectionWrapperModule } from '../../../shared-features/ui/components/section-wrapper/section-wrapper.module';
import { ClinicalTrialEssentialsWidgetComponent } from '../clinical-trial-essentials-widget/clinical-trial-essentials-widget.component';
import { FindTrialWidgetComponent } from '../find-trial-widget/find-trial-widget.component';
import { TrialConnectWidgetComponent } from '../trial-connect-widget/trial-connect-widget.component';

@Component({
  selector: 'lilly-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.scss'],
  imports: [
    NgClass,
    NgStyle,
    ImageTileWidgetComponent,
    AccordionWidgetComponent,
    TextWidgetComponent,
    CardArrangementWidgetComponent,
    SlidesWidgetComponent,
    TrialsWidgetComponent,
    AlertMeWidgetComponent,
    ImageLinkWidgetComponent,
    QuestionnaireWidgetComponent,
    QuizWidgetComponent,
    BmiCalculatorWidgetComponent,
    FindClinicalTrialWidgetComponent,
    BlockquoteWidgetComponent,
    AsyncPipe,
    SectionWrapperModule,
    ClinicalTrialEssentialsWidgetComponent,
    FindTrialWidgetComponent,
    TrialConnectWidgetComponent
  ],
  standalone: true
})
export class SectionComponent implements OnInit {
  @Input() background = '#F5F5F5';
  @Input() hasSideMenu = false;
  @Input() navElements: ISection[] = [];

  protected _section: ISection;

  @Input() set section(section: ISection) {
    this._section = section;
    this.showSection$ = this.sectionsService.getSectionVisibility$(section);
    if (!this.trials) {
      return;
    }
    this.updateSectionsVisibility();
  }

  get section(): ISection {
    return this._section;
  }

  _trials: any[];

  @Input() set trials(trials: any[]) {
    this._trials = trials;
    if (!this.section) {
      return;
    }
    this.updateSectionsVisibility();
  }

  get trials(): any[] {
    return this._trials;
  }

  @Input() filters: SearchCriteria;
  @Input() subsiteName: string;


  showSection$: Observable<boolean> = of(true);

  filterWidgets(widgets: ISectionFields['widgets']): ISectionFields['widgets'] {
    if (this.trials?.length > 0) {
      return widgets;
    }
    return widgets.filter(widget => {
      const shouldHide =  ('hideIfNoTrials' in widget.fields) && widget.fields.hideIfNoTrials;
      return !shouldHide;
    });
  }

  getTextExcludedWidgets(itemsObj: unknown) {
    return Object.values(itemsObj).filter(item => item.sys?.contentType?.sys?.id !== 'textWidget').length;
  }

  private _pageType: PageType;
  @Input()
  set pageType(pageType: PageType) {
    this._pageType = pageType;
    this.analyticsFilters = {
      ...this.filters,
      actionsArr: [
        this.helperService.getActionNameByPageType(pageType, 'LinkClick'),
        this.helperService.getActionNameByPageType(pageType, 'LinkContinueClick')
      ],
      pageType
    };
  }
  get isInNavigation(): boolean {
    if (!this.navElements || !this.section) {
      return false;
    }

    return this.navElements.some(navEl => navEl.fields?.sectionId === this.section.fields?.sectionId);
  }
  get pageType() {
    return this._pageType;
  }
  get showTitle(): boolean {
    return this.section?.fields?.title && !this.section?.fields?.hideTitle;
  }
  analyticsFilters = {};
  PageType = PageType;

  updateSectionsVisibility(): void {
    const section = this.section;
    const showSection = this.filterWidgets(this.section.fields.widgets)?.length !== 0;
    this.sectionsService.setSectionVisibility(section, showSection);
  }


  constructor(
    private helperService: HelperService,
    protected sectionsService: PageSectionsStateService
  ) {
  }

  ngOnInit(): void {
    this.updateSectionsVisibility();
  }
}
