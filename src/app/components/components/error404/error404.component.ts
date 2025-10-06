import { Component } from '@angular/core';
import { Error404Component } from '@careboxhealth/layout1-shared';

@Component({
  selector: 'app-error404',
  templateUrl: './error404.component.html',
  styleUrls: ['./error404.component.scss'],
  standalone: true
})
export class ExtendedError404Component extends Error404Component {
}
