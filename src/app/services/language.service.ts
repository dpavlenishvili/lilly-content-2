// eslint-disable-next-line max-classes-per-file
import { inject, Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {
  ConfigurationProvider,
  LocationService,
  WebsiteCampaignInformationService
} from '@careboxhealth/core';
import { environment } from '../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { LeaveCountryDialogComponent } from '../components/leave-country-dialog/leave-country-dialog.component';
import { HelperService } from './helper.service';
import { MatDialog } from '@angular/material/dialog';
import { LOCALE_CODE } from '../components/contentful/models/contentful';

export class LanguageObj {
  get countryName(): string {
    return this.label.split('(')[0].trim();
  }

  get countyCode(): string {
    return this.key.split('-')[1];
  }
  
  constructor(public label: string, public value: string, public key: string, public icon: string, public link: string, public cmsCode: LOCALE_CODE) {
  }
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  public origin;
  languagesBank: LanguageObj[];
  public utmObjToString = '';
  public languages: LanguageObj[] = [];
  public selected = this.languages[0];

  private readonly helperService: HelperService = inject(HelperService);
  private readonly dialog: MatDialog = inject(MatDialog);

  constructor(@Inject(DOCUMENT) protected document: Document,
              protected configuration: ConfigurationProvider,
              protected locationService: LocationService,
              protected websiteCampaignInformationService: WebsiteCampaignInformationService,
              private route: ActivatedRoute,
  ) {
    this.origin = locationService.origin;
    this.languagesBank = [
      new LanguageObj('United States (English)', 'en-US', 'en-US', 'en-US', `${locationService.origin}/en-US`, 'en-US'),
      new LanguageObj('United States (Español)', 'es-US', 'es-US', 'es-US', `${locationService.origin}/es-US`, 'es-US'),
    ];
    this.initLanguages();
    this.getSelectLang();
  }

  get currentRegion(): string {
    return this.configuration.defaultCultureCode;
  }

  getSelectLang(): void {
    const currentRegion = this.currentRegion;
    this.selected = this.languages.find(({key}) => key === currentRegion);
  }

  setLanguageWithConfirm(language: LanguageObj): void {
    if (language.value === this.currentRegion) {
      return;
    }
    this.requestConfirmLeaveCountry(language.countyCode).pipe(
      filter(shouldSwitch => shouldSwitch),
    ).subscribe(() => {
      this.setLanguage(language);
    });
  }

  requestConfirmLeaveCountry(countryCode: string): Observable<boolean> {
    if (
      countryCode === this.selected.countyCode ||
      this.helperService.disabledConfirmLeaveCountry
    ) {
      return of(true);
    }
    return this.dialog.open(LeaveCountryDialogComponent, {
      panelClass: 'leave-lilly-dialog',
      ariaLabelledBy: 'leaveLillyDialogLabel',
      autoFocus: false
    }).afterClosed();
  }

  setLanguage(language): void {
    if (language.value === this.currentRegion) {
      return;
    }

    const urlParams = {
      ...this.websiteCampaignInformationService.getCampaignVariables(),
      ...this.route.snapshot.queryParams,
    };
    const clonedUTMParams = JSON.parse(JSON.stringify(urlParams));
    this.utmObjToStringWithRemoveNullValues(clonedUTMParams);
    this.routeToDifferentSiteLang(language);
  }

  routeToDifferentSiteLang(item): void {
    let currentRegion = this.currentRegion;
    if (item.value === currentRegion) {
      return;
    }

    currentRegion = '/' + currentRegion;
    const newLang = '/' + item.key;
    const params = this.document.location.pathname.replace(currentRegion, newLang);
    this.document.location.href = document.location.origin + params + '/' + this.utmObjToString;
  }

  private initLanguages() {
    this.languages = [
      ...this.languagesBank
        .filter(language => environment.locales.includes(language.key))
        .sort((l1, l2) => this.sortByUs(l1, l2) || this.sortByAlphabet(l1, l2))
    ];
  }

  sortByUs(language1: LanguageObj, language2: LanguageObj): number {
    return Number(language2.key.toLowerCase().includes('us')) - Number(language1.key.toLowerCase().includes('us'));
  }

  sortByAlphabet(language1: LanguageObj, language2: LanguageObj): number {
    return language1.label.localeCompare(language2.label);
  }

  public utmObjToStringWithRemoveNullValues(obj) {
    let str = '';
    Object.keys(obj).forEach(key => {
      if (obj[key] === '' || obj[key] === null) {
        delete obj[key];
      } else{
        if (str === ''){
          str = '?' + key.trim() + '=' + obj[key].trim() ;
        } else {
          str += '&' + key.trim() + '=' + obj[key].trim() ;
        }
      }
    });
    this.utmObjToString = str;

  }
}
