import { Directive } from '@angular/core';

@Directive({
  selector: 'cb-card-header',
  standalone: true,
  'host': { 'class': 'cb-card__header' }
})
export class CbCardHeaderDirective {}
