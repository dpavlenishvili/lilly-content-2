import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import { Document } from '@contentful/rich-text-types';

@Pipe({
  name: 'richTextToHtml',
  standalone: true
})
export class RichTextToHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(value: Document) {
    return value ? this.sanitizer.bypassSecurityTrustHtml(documentToHtmlString(value)) : '';
  }
}
