import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { HelperService } from '../../../services/helper.service';
import { Subject } from 'rxjs';
import { PageSectionsStateService } from '../../../services/page-sections-state.service';
import { takeUntil } from 'rxjs/operators';
import { NgClass } from '@angular/common';
import { StickyHeaderWrapperDirective } from '../../../shared-features/ui/directives/sticky-header-wrapper.directive';

@Component({
  selector: 'lilly-nav-elements-sidemenu',
  templateUrl: './nav-elements-sidemenu.component.html',
  styleUrls: ['./nav-elements-sidemenu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass,
    StickyHeaderWrapperDirective
  ],
  standalone: true
})
export class NavElementsSidemenuComponent implements OnInit, OnDestroy {
  @Input() activeTab = '';
  @Input() navbarTabs: any = [];

  visibility: Record<string, boolean> = {};

  private _onDestroy = new Subject<void>();

  constructor(
    public helperService: HelperService,
    protected sectionsService: PageSectionsStateService,
    protected cd: ChangeDetectorRef,
  ) {
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
  }

  ngOnInit(): void {
    this.sectionsService.sectionsVisibility$.pipe(
      takeUntil(this._onDestroy)
    ).subscribe(visibility => {
      this.visibility = visibility;
      this.cd.markForCheck();
    });
  }

  isHidden(tab: any): boolean {
    return (tab.sectionId in this.visibility) && !this.visibility[tab.sectionId];
  }
}
