import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BlogRoutingModule } from './blog-routing.module';
import { Meta } from '@angular/platform-browser';

@NgModule({
  imports: [
    BlogRoutingModule,
    RouterModule,
  ],
  providers: [Meta],

})
export class BlogModule {}
