import {
    CanActivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router,
    UrlTree
  } from '@angular/router';
  import { Injectable } from '@angular/core';
  import { Observable } from 'rxjs';
  import { map, take } from 'rxjs/operators';
  import { Store } from '@ngrx/store';
  
  import * as fromApp from '../../../store/app.reducer';
  
  @Injectable({ providedIn: 'root' })
  export class DbDetailGuard implements CanActivate {
    constructor(
      private router: Router,
      private store: Store<fromApp.AppState>
    ) {}
  
    canActivate(
      route: ActivatedRouteSnapshot,
      router: RouterStateSnapshot
    ):
      | boolean
      | UrlTree
      | Promise<boolean | UrlTree>
      | Observable<boolean | UrlTree> {
      return this.store.select('dbConnection').pipe(
        take(1),
        map(dbConnectionState => {
          if(dbConnectionState.databaseConnected && !!dbConnectionState.databaseConnection){
            return true;
          }
          return this.router.createUrlTree(['/home']);
        })
      );
    }
  }
  