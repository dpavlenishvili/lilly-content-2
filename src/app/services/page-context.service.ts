import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PageContextService {
  readonly pageName = signal<string>('');

  setPageName(name: string | null | undefined): void {
    this.pageName.set((name || '').trim());
  }
}


