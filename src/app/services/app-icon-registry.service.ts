import { Inject, Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class AppIconRegistry {

  public constructor(
    protected iconRegistry: MatIconRegistry,
    protected sanitizer: DomSanitizer,
    @Inject('BASE_HREF') protected baseHref: string
  ){}

  public addSvgIcon(iconName: string, path: string) {
    this.iconRegistry.addSvgIcon(iconName, this.sanitizer.bypassSecurityTrustResourceUrl(`
      ${this.baseHref}${path.startsWith('/') ? path.substring(1) : path}
    `));
  }
}
