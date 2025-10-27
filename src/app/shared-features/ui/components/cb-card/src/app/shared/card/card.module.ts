import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CbCardComponent } from './card.component';
import { CbCardHeaderDirective } from './card-header.directive';
import { CbCardBodyDirective } from './card-body.directive';
import { CbCardFooterDirective } from './card-footer.directive';

@NgModule({
  imports: [
    CommonModule,
    CbCardComponent,
    CbCardHeaderDirective,
    CbCardBodyDirective,
    CbCardFooterDirective,
  ],
  exports: [
    CbCardComponent,
    CbCardHeaderDirective,
    CbCardBodyDirective,
    CbCardFooterDirective,
  ],
})
export class CbCardModule {}
