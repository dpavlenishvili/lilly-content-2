import { Injectable, signal } from '@angular/core';
import { IModule } from '../components/contentful/models/contentful';
import { QueryParams } from '../constants/query-params';

@Injectable({
  providedIn: 'root'
})
export class ModulesStateService {
  private readonly selectedModuleSignal = signal<IModule | null>(null);
  readonly selectedModule = this.selectedModuleSignal.asReadonly();

  private readonly selectedDayByModuleSlug = signal<Record<string, string>>({});

  setSelectedModule(module: IModule | null): void {
    this.selectedModuleSignal.set(module);
  }

  setSelectedDaySlug(moduleSlug: string, daySlug: string): void {
    if (!moduleSlug || !daySlug) {
      return;
    }
    const current = this.selectedDayByModuleSlug();
    this.selectedDayByModuleSlug.set({ ...current, [moduleSlug]: daySlug });
  }

  getSelectedDaySlug(moduleSlug?: string): string | undefined {
    return this.selectedDayByModuleSlug()[moduleSlug ?? this.selectedModule()?.fields?.slug];
  }

  buildModuleQueryParams(moduleSlug: string, daySlug?: string) {
    return {
      [QueryParams.Module]: moduleSlug,
      ...(daySlug && { [QueryParams.Day]: daySlug })
    };
  }
}
