import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Language } from '../../../../enums/language';
import { NgClass, NgIf, NgStyle } from '@angular/common';
import { ShareButtonComponent } from './share-button/share-button.component';
import { HideForRegionsDirective } from '@careboxhealth/layout1-shared';
import { MatIcon } from '@angular/material/icon';
import { IArticle } from '../../../contentful/models/contentful';

@Component({
  selector: 'lilly-share-button-container',
  templateUrl: './share-button-container.component.html',
  styleUrls: ['./share-button-container.component.scss'],
  imports: [
    NgClass,
    ShareButtonComponent,
    NgIf,
    HideForRegionsDirective,
    MatIcon,
    NgStyle
  ],
  standalone: true
})
export class ShareButtonContainerComponent {
  @Input() shareUrl: string;
  @Input() position: string = 'vertical' || 'horizontal';
  @Input() isMobile = false;
  @Input() hasPrint = true;
  @Input() article: IArticle;

  @Output() isOpenEmit = new EventEmitter<boolean>();
  isOpen = false;
  readonly Language: typeof Language = Language;

  openClose(){
    this.isOpen = !this.isOpen;
    this.isOpenEmit.emit(this.isOpen);
  }
}
