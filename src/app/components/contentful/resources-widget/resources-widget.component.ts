import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MdToHtmlPipe } from '../../../pipes/md-to-html.pipe';
import { IResourcesWidgetFields } from '../models/contentful';

@Component({
  selector: 'lilly-content-resources-widget',
  templateUrl: './resources-widget.component.html',
  styleUrls: ['./resources-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MdToHtmlPipe
  ],
  standalone: true
})
export class ResourcesWidgetComponent {
  readonly resourcesWidgetFields = input.required<IResourcesWidgetFields>();
}
