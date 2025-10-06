import { Component, OnInit, Input } from '@angular/core';
import { AnalyticsService, PrintService } from '@careboxhealth/core';
import { HelperService } from 'src/app/services/helper.service';
import { MatIcon } from '@angular/material/icon';
import {IArticle} from '../../../../contentful/models/contentful';
import {MatButtonModule} from '@angular/material/button';


@Component({
  selector: 'lilly-share-button',
  templateUrl: './share-button.component.html',
  imports: [
    MatIcon,
      MatButtonModule,
  ],
  standalone: true
})
export class ShareButtonComponent implements OnInit {

  @Input() type: 'facebook' | 'linkedin' | 'print' | 'mail';
  @Input() shareUrl: string;
  @Input() article: IArticle;
  navUrl: string;

  constructor( private printService: PrintService, private analytics: AnalyticsService, private helperService: HelperService ) {}

  ngOnInit() {
    this.createNavigationUrl();
  }

  private createNavigationUrl() {
    const searchParams = new URLSearchParams();

    switch (this.type) {
    case 'facebook':
      searchParams.set('u', this.shareUrl);
      this.navUrl =
          'https://www.facebook.com/sharer/sharer.php?' + searchParams;
      this.helperService.setGtAttrForNestedElementsByGtmValue('socialShareFacebook', 'lilly-share-button');
      break;
    case 'linkedin':
      searchParams.set('url', this.shareUrl);
      this.navUrl = 'https://linkedin.com/share?' + searchParams;
      this.helperService.setGtAttrForNestedElementsByGtmValue('socialShareLinkedin', 'lilly-share-button');

      break;
    }
  }

  public share() {    
    this.analytics.write({
      action: 'ArticleSocialClick',
      article: this.article?.fields?.title,
      articleId: this.article?.sys.id ,
      socialNetwork: this.type
    });
    window.open(
      this.navUrl,
      '_blank',
      'location=yes,height=720,width=960,scrollbars=yes,status=yes,noopener,noreferrer'
    );
    return false;    
  }

  sendEmail(): boolean {
    this.analytics.write({ article: this.shareUrl, socialNetwork: 'email' });
    const subject = $localize`:@@blog_article.email_subject:Blog article by Eli Lilly and Company`;
    const body = `${$localize`:@@blog_article.email_body:I thought you might be interested in this post I found on the Lilly Trials Blog`}: ${this.shareUrl}.`;
    const mailto = `mailto:?subject=${subject}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_self');
    return false;
  }

  printPage(): void {
    this.printService.printPage();
  }
}
