import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { BrowseCategory, BrowseCategoryService } from '../../../shared-features/ui/browse-category.service';
import { NavigationStart, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader } from '@angular/material/expansion';
import { MatMenuItem } from '@angular/material/menu';
import { DeepGtmTriggerDirective } from '@careboxhealth/layout1-shared';

@Component({
  selector: 'lilly-nested-menu-mobile',
  templateUrl: './nested-menu-mobile.component.html',
  styleUrls: ['./nested-menu-mobile.component.scss'],
  imports: [
    MatButton,
    NgClass,
    MatIcon,
    MatDivider,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    NgTemplateOutlet,
    MatMenuItem,
    RouterLinkActive,
    RouterLink,
    DeepGtmTriggerDirective
  ],
  standalone: true
})
export class NestedMenuMobileComponent implements OnInit {
  @Input() menuItems: BrowseCategory[] = [];
  @Input() title: string;
  @Input() subMenuButtonContentT: TemplateRef<{item: BrowseCategory, showArrow: boolean}>;
  @Input() referrer: string;
  @Input()
  set isHeaderMenuCollapsed(value: boolean) {
    if (value) {
      this.isSubMenuCollapsed = true;
    }
  }

  isSubMenuCollapsed = true;

  constructor(
    private router: Router,
    public browseCategory: BrowseCategoryService
  ) { }

  ngOnInit(): void {
    this.router.events.subscribe(val => {
      if (val instanceof NavigationStart) {
        this.isSubMenuCollapsed = true;
      }
    });
  }

  toggleSubMenu(): void {
    this.isSubMenuCollapsed = !this.isSubMenuCollapsed;
  }
}
