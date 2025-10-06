import { Component, Input, TemplateRef, ViewChildren, QueryList, Inject } from '@angular/core';
import { BrowseCategory, BrowseCategoryService } from '../../../shared-features/ui/browse-category.service';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DeepGtmTriggerDirective } from '@careboxhealth/layout1-shared';

@Component({
  selector: 'lilly-nested-menu-desktop',
  templateUrl: './nested-menu-desktop.component.html',
  styleUrls: ['./nested-menu-desktop.component.scss'],
  imports: [
    MatButton,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    NgTemplateOutlet,
    RouterLinkActive,
    RouterLink,
    DeepGtmTriggerDirective
  ],
  standalone: true
})
export class NestedMenuDesktopComponent {
  @Input() menuItems: BrowseCategory[] = [];
  @Input() title: string;
  @Input() subMenuButtonContentT: TemplateRef<{ item: BrowseCategory, showArrow: boolean }>;
  @Input() referrer: string;

  @ViewChildren('focusItem') menuItemElements: QueryList<MatMenuItem>;
  @ViewChildren('focusSubItem') subMenuItemElements: QueryList<MatMenuItem>;

  activeMenuTrigger: MatMenuTrigger;

  constructor(
    public browseCategory: BrowseCategoryService,
    @Inject(DOCUMENT) protected document: Document
  ) { }

  setAndRemoveFocus(): void {
    this.setFocus();
    this.removeFocus();
  }

  setFocus(): void {
    this.menuItemElements.first.focus();
  }

  removeFocus(): void {
    const [firstMenuItem] = this.menuItems;
    const id = this.getMenuID(firstMenuItem?.label);
    this.document.getElementById(id)?.blur();
  }

  getMenuID(label: string): string {
    return label?.replace(/ /g, '_')?.toLowerCase();
  }

  removeSubMenuFocus(item: BrowseCategory): void {
    const [firstSubMenuItem] = item.subMenu;
    const id = this.getMenuID(firstSubMenuItem?.label);
    this.document.getElementById(id)?.blur();
  }

  toggleNextMenu(menuTrigger: MatMenuTrigger, item: BrowseCategory): void {
    if (this.activeMenuTrigger !== menuTrigger && this.activeMenuTrigger !== undefined) {
      this.activeMenuTrigger.closeMenu();
    }
    (!menuTrigger.menuOpen) ? menuTrigger.openMenu() : menuTrigger.closeMenu();
    this.activeMenuTrigger = menuTrigger;

    const [firstSubMenuItem] = item.subMenu;
    const id = this.getMenuID(firstSubMenuItem?.label);

    const firstSubMenu = this.subMenuItemElements.find(subItem => {
      return this.getMenuID(subItem.getLabel()) === id;
    });
    firstSubMenu.focus('keyboard');
  }
}
