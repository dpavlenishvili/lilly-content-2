import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionWrapperComponent } from './section-wrapper.component';
import {
  CstTitleSlotDirective,
  CstHeaderContentSlotDirective,
  CstContentSlotDirective, CstMediaSlotDirective
} from './cst-slots';
import {ContainerWrapperComponent} from './container-wrapper/container-wrapper.component';

@NgModule({
  imports: [
    CommonModule,
    SectionWrapperComponent,
    CstTitleSlotDirective,
    CstHeaderContentSlotDirective,
    CstContentSlotDirective,
    CstMediaSlotDirective,
    ContainerWrapperComponent
  ],
  exports: [
    SectionWrapperComponent,
    CstTitleSlotDirective,
    CstHeaderContentSlotDirective,
    CstContentSlotDirective,
    CstMediaSlotDirective,
    ContainerWrapperComponent
  ]
})
export class SectionWrapperModule { }
