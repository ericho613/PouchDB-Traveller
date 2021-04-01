import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { PageNotFoundComponent } from './components/';
import { WebviewDirective } from './directives/';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';
import { FlexLayoutModule } from '@angular/flex-layout';

import { TruncatePipe } from './pipes';

@NgModule({
  declarations: [PageNotFoundComponent, WebviewDirective, TruncatePipe],
  imports: [
    CommonModule, 
    TranslateModule, 
    FormsModule,
    ReactiveFormsModule, 
    FlexLayoutModule,
    MaterialModule,
  ],
  exports: [
    CommonModule, 
    TranslateModule, 
    WebviewDirective, 
    FormsModule,
    ReactiveFormsModule, 
    FlexLayoutModule,
    MaterialModule,
    TruncatePipe
  ]
})
export class SharedModule {}
