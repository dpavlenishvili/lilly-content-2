import { Injectable, computed, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModuleAccessService {
  private readonly allowedModuleSlugs = signal<string[]>([]);

  readonly hasAccessFilter = computed(() => this.allowedModuleSlugs().length > 0);

  setAccessFromString(accessString: string): void {
    const slugs = accessString
      ?.split(',')
      .map(s => s.trim())
      .filter(Boolean) ?? [];

    this.allowedModuleSlugs.set(slugs);
  }

  filterModules<T extends { fields?: { slug?: string } }>(modules: T[]): T[] {
    return !this.hasAccessFilter()
      ? modules
      : modules.filter(m => this.allowedModuleSlugs().includes(m.fields?.slug));
  }

  validateRequestedModules(validSlugs: string[]): boolean {
    if (!this.hasAccessFilter()) return true;

    const allowed = this.allowedModuleSlugs();
    return allowed.some(slug => validSlugs.includes(slug));
  }

  clearAccess(): void {
    this.allowedModuleSlugs.set([]);
  }
}
