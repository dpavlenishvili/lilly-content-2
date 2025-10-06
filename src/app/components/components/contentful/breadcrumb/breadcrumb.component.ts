import { ChangeDetectionStrategy, Component, Input, OnDestroy } from '@angular/core';
import { IPageLink } from '../models/contentful';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ExtendedContentfulService } from '../../../services/contentful.service';
import { ClientRoutes } from '../../../common/client-routes';
import { NavigationListsDataService } from '../../../services/navigation-lists-data.service';
import { HeaderMenuItem, HeaderMenuItemNestedList } from '../../../interfaces/header-menu-item';
import { BreadcrumbLink } from '../../../interfaces/breadcrumb-link';
import { BreadcrumbsComponent } from '../../../shared-features/ui/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'lilly-breadcrumb-navigation',
  templateUrl: './breadcrumb.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BreadcrumbsComponent
  ],
  standalone: true
})
export class BreadcrumbComponent implements OnDestroy {
  @Input()
  set pageLink(value: IPageLink) {
    this.pageLink$.next(value);
  }

  links: BreadcrumbLink[] = [];
  headerMenu: HeaderMenuItem[] = [];
  pageLink$: BehaviorSubject<IPageLink> = new BehaviorSubject(null);
  destroy$: Subject<boolean> = new Subject();

  readonly ClientRoutes = ClientRoutes;

  constructor(
    private contentfulService: ExtendedContentfulService,
    private navigationListsDataService: NavigationListsDataService
  ) {
    combineLatest([this.contentfulService.pageLinks$, this.pageLink$, this.navigationListsDataService.headerMenu$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([linkList, currentLink, headerMenu]: [IPageLink[], IPageLink, HeaderMenuItem[]]) => {
        this.headerMenu = headerMenu;
        this.createLinkList(linkList, currentLink);
      });
  }

  createLinkList(linkList: IPageLink[], currentLink: IPageLink) {
    if (!linkList || !currentLink) {
      return;
    }

    this.links = [];

    this.links.push({
      name: $localize`:@@breadcrumb.home:Home`,
      url: ClientRoutes.Home
    });

    const urlAsArray = currentLink.fields?.url.split('/');
    urlAsArray.forEach((urlPart, index) => {
      if (urlPart === ClientRoutes.Home) {
        return;
      }

      const tempUrl = urlAsArray.slice(0, index + 1).join('/');
      // It means that it is high level element
      // (like /research-area in /research-area/url1 or in /research-area/url1/url2)
      // which doesn't have page link in cms
      if (urlAsArray.length > 2 && index === 1) {
        this.links.push(this.getHighLevelLink(tempUrl));
        return;
      }

      const linkFromList = linkList.find(link => link.fields?.url === tempUrl);
      if (!linkFromList) {
        return;
      }

      this.links.push({
        name: linkFromList.fields?.text,
        url: linkFromList.fields?.url
      });
    });
  }

  getHighLevelLink(tempUrl: string): BreadcrumbLink {
    const name = this.getHighLevelLinkName();

    if (tempUrl === ClientRoutes.ResearchAreas) {
      return {
        name,
        url: ClientRoutes.Home,
        fragment: ClientRoutes.HomeFragmentResearchAreas
      };
    }

    return {
      name,
      url: null
    };
  }

  getHighLevelLinkName(): string {
    let name = '';
    const linkUrl = this.pageLink$.getValue().fields.url;

    this.headerMenu
      .filter(menuItem => (menuItem as HeaderMenuItemNestedList).title)
      .forEach(menuItem => {
        if (name) {
          return;
        }

        const exist = (menuItem as HeaderMenuItemNestedList).items.some(item => {
          return item.link === linkUrl || item.subMenu.some(subMenuItem => subMenuItem.link === linkUrl);
        });

        if (exist) {
          name = (menuItem as HeaderMenuItemNestedList).title;
        }
      });

    return name;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
