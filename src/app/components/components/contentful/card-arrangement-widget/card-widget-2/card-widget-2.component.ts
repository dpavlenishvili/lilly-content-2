import { Component } from '@angular/core';
import {CardWidgetComponent} from '../card-widget/card-widget.component';
import {NgClass, NgTemplateOutlet, NgStyle} from '@angular/common';
import { MatButton } from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MdToHtmlPipe} from '../../../../pipes/md-to-html.pipe';
import {CbCardModule} from '../../../../shared-features/ui/components/cb-card/src/app/shared/card';
import { LinkBehavior } from '@careboxhealth/core';
import { MediaContentComponent } from '../../media-content/media-content/media-content.component';

export enum ActionDisplayType {
  Button = 'button',
  Link = 'link'
}

@Component({
  selector: 'lilly-card-widget-2',
  standalone: true,
  imports: [
    NgClass,
    NgStyle,
    MatButton,
    MatIcon,
    MdToHtmlPipe,
    NgTemplateOutlet,
    CbCardModule,
    MediaContentComponent
  ],
  templateUrl: './card-widget-2.component.html',
  styleUrl: './card-widget-2.component.scss'
})
export class CardWidget2Component extends CardWidgetComponent {
  ActionDisplayType = ActionDisplayType;

  goToLink(link: string, linkBehavior: LinkBehavior, event?: Event) {
    event?.stopPropagation();
    this.helperService.goToLink(link, linkBehavior);
  }
}
