import { Component, Input } from '@angular/core';
import { HelperService } from 'src/app/services/helper.service';
import { IImageLinkWidgetFields } from '../models/contentful';

@Component({
  selector: 'lilly-image-link-widget',
  templateUrl: './image-link-widget.component.html',
  styleUrls: ['./image-link-widget.component.scss'],
  standalone: true
})
export class ImageLinkWidgetComponent {
  @Input() widget: IImageLinkWidgetFields;

  constructor(public helperService: HelperService) {}
}
