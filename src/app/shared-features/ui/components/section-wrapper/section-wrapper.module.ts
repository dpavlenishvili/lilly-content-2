import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionWrapperComponent } from './section-wrapper.component';
import {
  CstTitleSlotDirective,
  CstHeaderContentSlotDirective,
  CstContentSlotDirective, CstMediaSlotDirective
} from './cst-slots';

@NgModule({
  imports: [
    CommonModule,
    SectionWrapperComponent,
    CstTitleSlotDirective,
    CstHeaderContentSlotDirective,
    CstContentSlotDirective,
    CstMediaSlotDirective
  ],
  exports: [
    SectionWrapperComponent,
    CstTitleSlotDirective,
    CstHeaderContentSlotDirective,
    CstContentSlotDirective,
    CstMediaSlotDirective
  ]
})
export class SectionWrapperModule { }
