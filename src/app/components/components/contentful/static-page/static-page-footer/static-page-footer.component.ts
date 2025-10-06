import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LocalFooterComponent } from '../../../footer/footer.component';
import { RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'lilly-static-page-footer',
  templateUrl: './static-page-footer.component.html',
  styleUrls: ['./static-page-footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLinkActive,
    NgClass
  ],
  standalone: true
})
export class StaticPageFooterComponent extends LocalFooterComponent {
}
