import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

import { AppRoutingModule } from './app-routing.module';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { HomeModule } from './home/home.module';

import { AppComponent } from './app.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import * as fromApp from './store/app.reducer';

import { SidenavEffects } from './home/components/sidenav-list/store/sidenav-list.effects';
import { DbConnectionEffects } from './home/components/db-connection/store/db-connection.effects';
import { DbDetailEffects } from './home/components/db-detail/store/db-detail.effects';
import { ResultCardEffects } from './home/components/result-card/store/result-card.effects';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    CoreModule,
    SharedModule,
    HomeModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    StoreModule.forRoot(fromApp.appReducer),
    EffectsModule.forRoot([SidenavEffects, DbConnectionEffects, DbDetailEffects, ResultCardEffects])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
