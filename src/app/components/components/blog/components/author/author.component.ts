import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { IAuthorFields } from '../../../contentful/models/contentful';
import { filter, takeUntil } from 'rxjs/operators';
import { BlogService } from '../../blog.service';
import { AuthorSlug } from '../../enums/author-slug.enum';
import { RouterLink } from '@angular/router';
import { DatePipe, NgClass } from '@angular/common';

@Component({
  selector: 'lilly-author',
  templateUrl: './author.component.html',
  styleUrls: ['./author.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    NgClass,
    DatePipe
  ],
  standalone: true
})
export class AuthorComponent implements OnInit, OnDestroy {
  _authorFields: IAuthorFields;
  @Input()
  set authorFields(value: IAuthorFields) {
    this.authorFields$.next(value);
    this._authorFields = value;
  }
  get authorFields() {
    return this._authorFields;
  }
  @Input() publishDate: string;
  @Input() readTime: string;
  @Input() theme: 'dark' | 'light' = 'dark';
  @Input() size: 'large' | 'medium' | 'small' = 'medium';
  @Input() clickable: boolean;

  authorFields$: BehaviorSubject<IAuthorFields> = new BehaviorSubject(null);
  destroy$ = new Subject();

  constructor(private blogService: BlogService){}

  ngOnInit(){
    combineLatest([this.blogService.blogSettings$, this.authorFields$])
      .pipe(
        filter(([blogSettings, authorFields]) => !!blogSettings && !!authorFields),
        takeUntil(this.destroy$))
      .subscribe(([blogSettings, authorFields]) => {
        const author = blogSettings?.authorDedicatedPage?.find(author => {
          return author.fields.slug !== AuthorSlug.SARAH_BENNETT && author.fields.slug === authorFields?.slug;
        });

        this.clickable = !!author;
      });
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
