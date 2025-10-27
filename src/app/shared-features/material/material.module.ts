import {Inject, Injector, NgModule, PLATFORM_ID} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { AppIconRegistry } from 'src/app/services/app-icon-registry.service';


const exports = [
  MatIconModule,
  MatButtonModule
];


@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
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
    iconRegistry.addSvgIcon('arrow_back', '/assets/svg/lilly/arrow_back.svg');
    iconRegistry.addSvgIcon('arrow-down', '/assets/svg/lilly/arrow-down.svg');
    iconRegistry.addSvgIcon('download', '/assets/svg/lilly/download.svg');
    iconRegistry.addSvgIcon('arrow-scroll', '/assets/svg/lilly/arrow--scroll.svg');
    iconRegistry.addSvgIcon('arrow-right', '/assets/svg/lilly/arw-right-w.svg');
  }
}
