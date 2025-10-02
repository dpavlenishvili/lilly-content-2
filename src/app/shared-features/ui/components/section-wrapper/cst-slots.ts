import { Directive } from '@angular/core';

@Directive({ selector: '[cst-title]', standalone: true })
export class CstTitleSlotDirective {}

@Directive({ selector: '[cst-label]', standalone: true })
export class CstLabelSlotDirective {}

@Directive({ selector: '[cst-header-content]', standalone: true })
export class CstHeaderContentSlotDirective {}

@Directive({ selector: '[cst-content]', standalone: true })
export class CstContentSlotDirective {}

@Directive({ selector: '[cst-media]', standalone: true })
export class CstMediaSlotDirective {}
