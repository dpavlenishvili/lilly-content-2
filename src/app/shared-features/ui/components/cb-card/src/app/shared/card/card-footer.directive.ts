import { Directive } from '@angular/core';

@Directive({
  selector: 'cb-card-footer',
  standalone: true,
  'host': { 'class': 'cb-card__footer' }
})
export class CbCardFooterDirective {}
