import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { Subscription } from 'rxjs';
import { HelperService } from 'src/app/services/helper.service';
import { DOCUMENT, NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import {
  OneRowNavigationComponent
} from '../../../../shared-features/ui/one-row-navigation/one-row-navigation.component';
import { MatButtonModule } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'lilly-nav-tabs',
  templateUrl: './nav-tabs.component.html',
  styleUrls: ['./nav-tabs.component.scss', '../../../../../assets/styles/_v3/modules/nav-tabs.scss'],
  imports: [
    NgClass,
    MatIcon,
    MatFormField,
    MatInput,
    FormsModule,
    OneRowNavigationComponent,
    MatButtonModule,
    MatOption,
    MatSelect
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavTabsComponent implements OnInit, OnDestroy {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() navbarTabs: any[] = [];
  @Input() pageTitle: string;
  @Input() activeTab = '';
  @Input() isBlogState = false;
  @Input() hasSearch = false;
  @Input() hideNavOnMob = false;
  @Output() tabClicked = new EventEmitter<string>();
  @Output() searchEmitted = new EventEmitter<string>();
  cookieBannerVisible = false;
  isSearchVisible = false;
  value = '';
  subscription: Subscription;

  constructor(
    private helperService: HelperService,
    @Inject(DOCUMENT) protected document: Document) {
  }

  ngOnInit(): void {
    this.subscription = this.helperService.cookieBannerObs$.subscribe(st => {
      this.cookieBannerVisible = st.status;
    });
  }

  onTabClick(section: string) {
    this.isSearchVisible = false;
    this.tabClicked.emit(section);
  }

  onTabEnter(sectionId: string) {
    this.document.getElementById(sectionId).focus();
    this.onTabClick(sectionId);
  }

  onSearch() {
    this.searchEmitted.emit(this.value);
    this.isSearchVisible = false;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
