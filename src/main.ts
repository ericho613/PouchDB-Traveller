import 'hammerjs';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { AppConfig } from './environments/environment';

if (AppConfig.production) {
  enableProdMode();
}

const loadingElement = document.querySelector('#loading-container')

platformBrowserDynamic()
  .bootstrapModule(AppModule, {
    preserveWhitespaces: false
  })
  .then(()=>{
    loadingElement.parentNode.removeChild(loadingElement);
  })
  .catch(err => console.error(err));
