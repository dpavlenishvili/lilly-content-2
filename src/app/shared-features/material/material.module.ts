import {Inject, Injector, NgModule, PLATFORM_ID} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import { AppIconRegistry } from 'src/app/services/app-icon-registry.service';


const exports = [
  MatIconModule
];


@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
  ],
  providers: [
    AppIconRegistry
  ],
  exports: [
    ...exports,
  ]
})
export class AppMaterialModule {
  constructor(iconRegistry: AppIconRegistry, @Inject(PLATFORM_ID) protected platformId, protected injector: Injector) {
    iconRegistry.addSvgIcon('straight', '/assets/svg/lilly/straight.svg');
    iconRegistry.addSvgIcon('arrow_forward', '/assets/svg/lilly/arrow_forward.svg');
  }
}
