import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, from } from 'rxjs';
import { switchMap, map, withLatestFrom, tap, catchError, take } from 'rxjs/operators';
import * as SidenavListActions from './sidenav-list.actions';
import * as DbDetailActions from '../../db-detail/store/db-detail.actions';
import * as fromApp from '../../../../store/app.reducer';
import { Store } from '@ngrx/store';
import { ElectronService } from '../../../../core/services/index';

@Injectable()
export class SidenavEffects {

  fetchFavorites$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SidenavListActions.fetchFavorites),
      switchMap(() => {
        return from(this.electronService.fetchFavorites())
        .pipe(
          take(1),
          map(favorites => {
            return favorites.map(favorite => {
              return {
                ...favorite,
                lastDateTimeAccessed: favorite.lastDateTimeAccessed ? favorite.lastDateTimeAccessed : ''
              };
            });
          }),
          map(favorites => {
            return SidenavListActions.fetchSuccessful({fetchType: "favorites", favorites: favorites});
          }),
          catchError(error => {
            console.log(error);
            return of(SidenavListActions.fetchUnsuccessful({fetchType: "favorites", errorMessage: error}))
          }),
        )
      })
    )
  );


  storeFavorites$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SidenavListActions.addFavorite, SidenavListActions.updateFavorite, SidenavListActions.deleteFavorite),
      withLatestFrom(this.store.select('sidenavList')),
      tap(([actionData, sidenavListState]) => {
        this.electronService.storeFavorites(sidenavListState.favorites)
        .then(response => {
          console.log(response);
        })
        .catch(error => {
          console.log(error);
        })
      })
    ),
    { dispatch: false }
  );

  fetchRecents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SidenavListActions.fetchRecents),
      switchMap(() => {
        return from(this.electronService.fetchRecents())
        .pipe(
          take(1),
          map(recents => {
            return recents.map(recent => {
              return {
                ...recent,
                lastDateTimeAccessed: recent.lastDateTimeAccessed ? recent.lastDateTimeAccessed : ''
              };
            });
          }),
          map(recents => {
            return SidenavListActions.fetchSuccessful({fetchType: "recents", recents: recents});
          }),
          catchError(error => {
            console.log(error);
            return of(SidenavListActions.fetchUnsuccessful({fetchType: "recents", errorMessage: error}))
          })
        )
      })
    )
  );

  storeRecents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SidenavListActions.addRecent, SidenavListActions.setRecents, SidenavListActions.deleteRecent),
      withLatestFrom(this.store.select('sidenavList')),
      tap(([actionData, sidenavListState]) => {
        this.electronService.storeRecents(sidenavListState.recents)
        .then(response => {
          console.log(response);
        })
        .catch(error => {
          console.log(error);
        })
      })
    ),
    { dispatch: false }
  );

  setCryptoSettings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SidenavListActions.setCryptoSettings),
      switchMap((action) => {
        let cryptoSpecAlgorithm = action.cryptoSpec.split("-").slice(0,3).join("-");
        let cryptographySettingsObj = {
          cryptoSpec: cryptoSpecAlgorithm,
          applyEncryption: action.applyEncryption,
          applyDecryption: action.applyDecryption,
          cryptoSecretKey: action.cryptoSecretKey
        }
        return from(this.electronService.setCryptographySettings(cryptographySettingsObj))
        .pipe(
          take(1),
          map(response => {
            console.log(response);
            return SidenavListActions.setCryptoSettingsSuccessful()
          }),
          catchError(error => {
            console.log(error);
            return of(SidenavListActions.setCryptoSettingsUnsuccessful({errorMessage: error}))
          })
        )
      })
    )
  );

  setCryptoSettingsSuccessful$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SidenavListActions.setCryptoSettingsSuccessful),
      withLatestFrom(this.store.select("dbDetail")),
      map(([action, dbDetailState])=>{
        if(dbDetailState.searchFilter){
          return DbDetailActions.filterSearch({searchFilter: dbDetailState.searchFilter});
        }
        return DbDetailActions.fetchDatabaseResults({previousPageIndex: null, currentPageIndex: null, pageSize: null});
      })
    )
  );

  importFile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SidenavListActions.importFile),
      switchMap((action) => {
        return from(this.electronService.importFile(action.filePath, action.fileType, action.delimiter? action.delimiter : null))
        .pipe(
          take(1),
          map(result => {

            let errorsArray = [];
            result.forEach(resultItem => {
              if(resultItem["error"]){
                errorsArray.push(JSON.stringify(resultItem["error"]));
              }
            })

            if(errorsArray.length > 0){
              return SidenavListActions.importFileSuccessful({errorMessage: errorsArray.toString()});
            }else{
              return SidenavListActions.importFileSuccessful({});
            }

          }),
          catchError(error => {
            console.log(error);
            return of(SidenavListActions.importFileUnsuccessful({errorMessage: error}))
          })
        )
      })
    )
  );

  exportFile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SidenavListActions.exportFile),
      switchMap((action) => {
        return from(this.electronService.exportFile(action.filePath, action.fileType, action.delimiter? action.delimiter : null))
        .pipe(
          take(1),
          map(result => {

            let errorsArray = [];
            result.forEach(resultItem => {
              if(resultItem["error"]){
                errorsArray.push(JSON.stringify(resultItem["error"]));
              }
            })

            if(errorsArray.length > 0){
              return SidenavListActions.exportFileSuccessful({errorMessage: errorsArray.toString()});
            }else{
              return SidenavListActions.exportFileSuccessful({});
            }

          }),
          catchError(error => {
            console.log(error);
            return of(SidenavListActions.exportFileSuccessful({errorMessage: error}))
          })
        )
      })
    )
  );

  fileTransferSuccessful$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SidenavListActions.importFileSuccessful, SidenavListActions.exportFileSuccessful),
      withLatestFrom(this.store.select("dbDetail")),
      map(([action, dbDetailState])=>{
        if(dbDetailState.searchFilter){
          return DbDetailActions.filterSearch({searchFilter: dbDetailState.searchFilter});
        }
        return DbDetailActions.fetchDatabaseResults({previousPageIndex: null, currentPageIndex: null, pageSize: null});
      })
    )
  );

  constructor(
    private actions$: Actions,
    private electronService: ElectronService,
    private store: Store<fromApp.AppState>
  ) {}
}
