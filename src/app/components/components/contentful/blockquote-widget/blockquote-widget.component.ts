import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IBlockquoteWidgetFields } from '../models/contentful';
import { MatIcon } from '@angular/material/icon';
import { MdToHtmlPipe } from '../../../pipes/md-to-html.pipe';

@Component({
  selector: 'lilly-blockquote-widget',
  templateUrl: './blockquote-widget.component.html',
  styleUrls: ['./blockquote-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIcon,
    MdToHtmlPipe
  ],
  standalone: true
})
export class BlockquoteWidgetComponent {
  @Input() widgetFields: IBlockquoteWidgetFields;
}
