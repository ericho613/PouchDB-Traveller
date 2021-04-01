import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of, from } from 'rxjs';
import { switchMap, map, withLatestFrom, tap, catchError, take} from 'rxjs/operators';
// import { Router } from '@angular/router';
import * as DbDetailActions from './db-detail.actions';
// import * as DbConnectionActions from '../../db-connection/store/db-connection.actions';
import { DBIndex, DBInfo } from '../../../../shared/models';
import * as fromApp from '../../../../store/app.reducer';
import { ElectronService } from '../../../../core/services/index';

@Injectable()
export class DbDetailEffects {

  fetchDatabaseInfo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DbDetailActions.fetchDatabaseInfo),
      switchMap(() => {
        return from(this.electronService.fetchDatabaseInfo())
        .pipe(
          take(1),
          map(databaseInfo => {
            // console.log(databaseInfo);
            return DbDetailActions.fetchSuccessful({fetchType: "databaseInfo", databaseInfo: databaseInfo});
          }),
          catchError(error => {
            console.log(error);
            return of(DbDetailActions.fetchUnsuccessful({fetchType: "databaseInfo", errorMessage: error}))
          })
        )
      })
    )
  );

  fetchDatabaseResults$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DbDetailActions.fetchDatabaseResults),
      switchMap((action) => {
        //add database interaction here

        let fetchOptionsObj = null;
        let previousPageIndex = action.previousPageIndex !== null? action.previousPageIndex : null;
        let currentPageIndex = action.currentPageIndex !== null? action.currentPageIndex : null;
        let pageSize = action.pageSize !== null? action.pageSize : null;
        // console.log(previousPageIndex);
        // console.log(currentPageIndex);
        // console.log(pageSize);
        if((action.previousPageIndex !== null) && (action.currentPageIndex !== null) && (action.pageSize !== null)){
          fetchOptionsObj = {previousPageIndex: previousPageIndex, currentPageIndex: currentPageIndex, pageSize: pageSize};
        };
        // console.log(fetchOptionsObj);

        return from(this.electronService.fetchDatabaseResults(fetchOptionsObj))
        .pipe(
          take(1),
          map(response => {
            // console.log(databaseInfo);
            return DbDetailActions.fetchSuccessful({fetchType: "databaseResults", databaseResults: response});
          }),
          tap(()=>{
            this.store.dispatch(DbDetailActions.fetchDatabaseInfo());
            this.store.dispatch(DbDetailActions.fetchDatabaseIndexes());
          }),
          catchError(error => {
            console.log(error);
            return of(DbDetailActions.fetchUnsuccessful({fetchType: "databaseResults", errorMessage: error}))
          })
        )
      })
    )
  );

  fetchDatabaseIndexes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DbDetailActions.fetchDatabaseIndexes),
      switchMap(() => {
        //add database interaction here

        return from(this.electronService.fetchDatabaseIndexes())
        .pipe(
          take(1),
          map(databaseIndexes => {
            // console.log(databaseInfo);
            return DbDetailActions.fetchSuccessful({fetchType: "databaseIndexes", databaseIndexes: databaseIndexes});
          }),
          catchError(error => {
            console.log(error);
            return of(DbDetailActions.fetchUnsuccessful({fetchType: "databaseIndexes", errorMessage: error}))
          })
        )
      })
    )
  );

  persist$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DbDetailActions.persist),
      switchMap((action) => {
        let persistItem;
        switch(action.persistType){
          case "create":
            persistItem = action.documentToCreate;
            break;
          case "update":
            persistItem = action.documentToUpdate;
            break;
          case "delete":
            persistItem = action.documentToDeleteId;
            break;
        }
        return from(this.electronService.persist(action.persistType, persistItem))
          .pipe(
            // tap(result => {
            //   if(action.persistType === "delete"){
            //       this.store.dispatch(DbDetailActions.persistSuccessful({documentToDeleteId: result.id}));
            //       setTimeout(()=>{
            //         this.store.dispatch(DbDetailActions.persistSuccessful({persistType: action.persistType, documentToDeleteId: result.id}));
            //       }, 1000)
            //   }
            // }),
            take(1),
            map(result => {
              console.log(result);
              
              switch(action.persistType){
                case "create":

                  if(Array.isArray(result)){

                    let errorsArray = [];
                    let resultsArray = [];

                    result.forEach(resultItem => {
                      if(resultItem["result"]){
                        resultsArray.push(resultItem["result"]);
                      }
                      if(resultItem["error"]){
                        errorsArray.push(JSON.stringify(resultItem["error"]));
                      }
                    })

                    if(errorsArray.length > 0){
                      return DbDetailActions.persistSuccessful({persistType: action.persistType, documentToCreate: resultsArray, errorMessage: errorsArray.toString()});
                    }else{
                      return DbDetailActions.persistSuccessful({persistType: action.persistType, documentToCreate: resultsArray});
                    }

                  }

                  return DbDetailActions.persistSuccessful({persistType: action.persistType, documentToCreate: result});
                case "update":

                  return DbDetailActions.setDocumentUpdatedId({documentUpdated: result});
                  
                case "delete":

                  // this.store.dispatch(DbDetailActions.persistSuccessful({documentToDeleteId: result.id}));
                  // setTimeout(()=>{
                    return DbDetailActions.setDocumentDeletedId({documentDeletedId: result.id});
                  // }, 1000)
                  
              }
              
            }),
            catchError(error => {
              console.log(error);
              return of(DbDetailActions.persistUnsuccessful({persistType: action.persistType, errorMessage: error}))
            })
          )
      })

    )
  );

  onPersistSuccessful$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DbDetailActions.persistSuccessful),
      tap((action) => {
        if(action.documentToDeleteId && action.persistType === "delete"){
          this.store.dispatch(DbDetailActions.clearPersistDetails({persistType: "delete"}))
        }
        if(action.documentToUpdate && action.persistType === "update"){
          this.store.dispatch(DbDetailActions.clearPersistDetails({persistType: "update"}))
        }
      }),
      map((action)=>{
        
        return DbDetailActions.fetchDatabaseInfo();
      })
    )
  );

  setDocumentDeletedId$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DbDetailActions.setDocumentDeletedId),
      tap((action) => {
        setTimeout(()=>{
          this.store.dispatch(DbDetailActions.persistSuccessful({persistType: "delete", documentToDeleteId: action.documentDeletedId}));
        }, 300)
      })
    ),
    { dispatch: false }
  );

  setDocumentUpdatedId$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DbDetailActions.setDocumentUpdatedId),
      tap((action) => {
        setTimeout(()=>{
          this.store.dispatch(DbDetailActions.persistSuccessful({persistType: "update", documentToUpdate: action.documentUpdated}));
        }, 300)
      })
    ),
    { dispatch: false }
  );

  //when applying a filter for searching, make sure to re-fetch the indexes as well

  filterSearch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DbDetailActions.filterSearch),
      switchMap((action) => {
        //add database interaction here

        return from(this.electronService.filterSearch(action.searchFilter))
          .pipe(
            take(1),
            map(response => {
              return DbDetailActions.filterSearchSuccessful({searchFilter: action.searchFilter, databaseResults: response});
            }),
            tap(()=>{
              this.store.dispatch(DbDetailActions.fetchDatabaseInfo());
              this.store.dispatch(DbDetailActions.fetchDatabaseIndexes());
            }),
            catchError(error => {
              return of(DbDetailActions.filterSearchUnsuccessful({errorMessage: error}))
            })
          )
      }),
    )
  );

  persistIndex$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DbDetailActions.persistIndex),
      switchMap((action) => {
        let persistItem;
        switch(action.persistIndexType){
          case "create":
            persistItem = action.indexToCreate;
            break;
          case "delete":
            persistItem = action.indexToDeletePosition;
            break;
        }
        return from(this.electronService.persistIndex(action.persistIndexType, persistItem))
          .pipe(
            take(1),
            map(result => {
              console.log(result);
              return DbDetailActions.persistIndexSuccessful({persistIndexType: action.persistIndexType});
            }),
            catchError(error => {
              console.log(error);
              return of(DbDetailActions.persistIndexUnsuccessful({persistIndexType: action.persistIndexType, errorMessage: error}))
            })
          )
      })

    )
  );

  onPersistIndexSuccessful$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DbDetailActions.persistIndexSuccessful),
      tap((action) => {
        // if(action.documentToDeleteId && action.persistType === "delete"){
        //   this.store.dispatch(DbDetailActions.clearPersistDetails({persistType: "delete"}))
        // }
        // if(action.documentToUpdate && action.persistType === "update"){
        //   this.store.dispatch(DbDetailActions.clearPersistDetails({persistType: "update"}))
        // }
        this.store.dispatch(DbDetailActions.fetchDatabaseInfo());
      }),
      map((action)=>{
        
        return DbDetailActions.fetchDatabaseIndexes();
      })
    )
  );


  constructor(
    private actions$: Actions,
    private electronService: ElectronService,
    // private router: Router,
    private store: Store<fromApp.AppState>
  ) {}
}
