import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { AnalyticsAction, AnalyticsService } from '@careboxhealth/core';

@Component({
  selector: 'lilly-support-info',
  standalone: true,
  imports: [
    MatIcon,
    NgOptimizedImage,
    MatDivider
  ],
  templateUrl: './support-info.component.html',
  styleUrl: './support-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupportInfoComponent {
  protected readonly AnalyticsAction = AnalyticsAction;

  private readonly analyticsService: AnalyticsService = inject(AnalyticsService);

  protected sendAnalytics(action: AnalyticsAction): void {
    this.analyticsService.write({
      action
    });
  }
}
