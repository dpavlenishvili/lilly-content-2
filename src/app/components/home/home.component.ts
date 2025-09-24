import { Component, OnInit } from '@angular/core';
import { IHomePage } from '../contentful/models/contentful';
import { ExtendedContentfulService } from '../../services/contentful.service';

@Component({
  selector: 'lilly-content-home',
  templateUrl: './home.component.html',
  styleUrls: ['home.component.scss'],
  standalone: true
})
export class HomeComponent implements OnInit {

  constructor(private contentful: ExtendedContentfulService) { }

  ngOnInit(): void {
    this.contentful.getHomePage()
      .subscribe((home: IHomePage) => {
        if (!home) return;
      });
  }
}
