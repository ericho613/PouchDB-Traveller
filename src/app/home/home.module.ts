import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';

import { HomeComponent } from './home.component';
import { SharedModule } from '../shared/shared.module';

import { DbConnectionComponent } from './components/db-connection/db-connection.component';
import { DbDetailComponent } from './components/db-detail/db-detail.component';
import { HeaderComponent } from './components/header/header.component';
import { SidenavListComponent } from './components/sidenav-list/sidenav-list.component';
import { ResultCardComponent } from './components/result-card/result-card.component';
import { FavoriteDialogComponent } from './components/favorite-dialog/favorite-dialog.component';
import { FocusInputDirective } from './directives/focus-input/focus-input.directive';
import { ResizeInputDirective } from './directives/resize-input/resize-input.directive';
import { RowHighlightDirective } from './directives/row-highlight/row-highlight.directive';
import { CreateIndexDialogComponent } from './components/create-index-dialog/create-index-dialog.component';
import { IndexTableComponent } from './components/index-table/index-table.component';
import { DocInsertDialogComponent } from './components/doc-insert-dialog/doc-insert-dialog.component';
import { DropIndexDialogComponent } from './components/drop-index-dialog/drop-index-dialog.component';
import { ImportDialogComponent } from './components/import-dialog/import-dialog.component';
import { ExportDialogComponent } from './components/export-dialog/export-dialog.component';
import { ErrorAlertDialogComponent } from './components/error-alert-dialog/error-alert-dialog.component';

@NgModule({
  declarations: [
    DbConnectionComponent, 
    DbDetailComponent, 
    HomeComponent, 
    HeaderComponent,
    SidenavListComponent,
    ResultCardComponent,
    FavoriteDialogComponent,
    FocusInputDirective,
    ResizeInputDirective,
    RowHighlightDirective,
    CreateIndexDialogComponent,
    IndexTableComponent,
    DocInsertDialogComponent,
    DropIndexDialogComponent,
    ImportDialogComponent,
    ExportDialogComponent,
    ErrorAlertDialogComponent
  ],
  imports: [
    CommonModule, 
    SharedModule, 
    HomeRoutingModule],
  entryComponents: [
    FavoriteDialogComponent, 
    CreateIndexDialogComponent,
    DocInsertDialogComponent,
    DropIndexDialogComponent,
    ImportDialogComponent,
    ExportDialogComponent,
    ErrorAlertDialogComponent
  ]
})
export class HomeModule {}
