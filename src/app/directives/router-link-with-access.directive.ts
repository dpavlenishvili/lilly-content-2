import { Directive, HostListener, Input, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HelperService } from '../services/helper.service';

@Directive({
  selector: 'a[routerLink], area[routerLink]',
  standalone: true
})
export class RouterLinkWithAccessDirective {
  private readonly router = inject(Router);
  private readonly routerLink = inject(RouterLink);
  private readonly helper = inject(HelperService);

  @Input() preserveAccess = true;

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (!this.preserveAccess) return;
  
    const urlTree = this.routerLink.urlTree;
    if (!urlTree) return;
  
    const newQueryParams = this.helper.addAccessToQueryParams(urlTree.queryParams);
    if (!newQueryParams) return;
  
    event.preventDefault();
    event.stopPropagation();
  
    const path = this.router.serializeUrl(urlTree).split('?')[0];
    void this.router.navigate([path], {
      queryParams: newQueryParams,
      fragment: urlTree.fragment
    });
  }  
}
