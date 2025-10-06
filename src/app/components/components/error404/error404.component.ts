import { Component } from '@angular/core';
import { ClientRoutes } from '../../common/client-routes';
import { Error404Component } from '@careboxhealth/layout1-shared';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { HeroSectionComponent } from '../contentful/hero-section/hero-section.component';
import { SectionWrapperComponent } from '../../shared-features/ui/components/section-wrapper/section-wrapper.component';
import { SectionComponent } from '../contentful/section/section.component';
import { IPageFields } from '../contentful/models/contentful';
import { MatButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-error404',
  templateUrl: './error404.component.html',
  styleUrls: ['./error404.component.scss'],
  imports: [
    RouterLink,
    AsyncPipe,
    HeroSectionComponent,
    SectionWrapperComponent,
    SectionComponent,
    MatButton,
    MatIconModule
  ],
  standalone: true
})
export class ExtendedError404Component extends Error404Component {
  readonly ClientRoutes = ClientRoutes;
  pageFields: Partial<IPageFields> = {
    displayMedia: 'Image',
    image: {
      fields: {
        file: {
          url: 'assets/images/error404-hero.jpg'
        }
      }
    } as unknown as IPageFields['image'],
    altText: '404 Error - Page not found'
  };
}
