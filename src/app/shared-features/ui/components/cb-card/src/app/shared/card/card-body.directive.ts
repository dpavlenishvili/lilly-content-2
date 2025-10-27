import { Directive } from '@angular/core';

@Directive({
  selector: 'cb-card-body',
  standalone: true,
  'host': { 'class': 'cb-card__body' }
})
export class CbCardBodyDirective {}
