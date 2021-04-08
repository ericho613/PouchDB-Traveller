import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { from, of } from 'rxjs';
import { switchMap, map, withLatestFrom, tap, catchError, take} from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

import * as DbConnectionActions from './db-connection.actions';
import * as SidenavListActions from '../../sidenav-list/store/sidenav-list.actions';
import * as DbDetailActions from '../../db-detail/store/db-detail.actions';
import { DBConnection } from '../../../../shared/models';
import * as fromApp from '../../../../store/app.reducer';
import { ElectronService } from '../../../../core/services/index';

@Injectable()
export class DbConnectionEffects {

  createOrOpenDatabase$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DbConnectionActions.createOrOpenDatabase),
      // withLatestFrom(this.store.select("dbConnection")),
      switchMap((action) => {

        //communicate with electron and connect to database and
        // account for connection success and failure
        return from(this.electronService.connectToDatabase(action.connectionPath))
          .pipe(
            take(1),
            map(response => {
              console.log(response.message);
              return DbConnectionActions.databaseConnectionSuccess({connectionPath: response.connectedStoragePath})
            }),
            catchError(error => {
              return of(DbConnectionActions.databaseConnectionFail({connectionErrorMessage: error}));
            })
          )

      })
    )
  );

  closeDatabaseConnection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DbConnectionActions.closeDatabaseConnection),
      tap(()=>{
        this.store.dispatch(DbDetailActions.setSearchFilter({searchFilter:null}));
        this.store.dispatch(DbDetailActions.setDatabaseResults({databaseResults: []}));
        this.store.dispatch(DbDetailActions.setDatabaseInfo({databaseInfo: null}));
        this.store.dispatch(DbDetailActions.setDatabaseIndexes({databaseIndexes: []}));
        this.electronService.closeDatabase()
        .then( response => {
          console.log(response);
          this.router.navigate(['/home']);
        })
        .catch(error => {
          console.log(error);
          this.router.navigate(['/home']);
        });
        
      })
    ),
    { dispatch: false }
  );

  databaseConnectionSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DbConnectionActions.databaseConnectionSuccess),
      withLatestFrom(this.store.select("dbConnection")),
      tap(([action, dbConnectionState])=>{

        //connect to database using createOrOpenDatabase
        //if the connection is successful, perform the following:
        //if the database connection type is 'favorite', update the
        // last accessed date
        //if the database connection type is not specified, 
        // create a db connection object, update the
        // last accessed date, set the type to 'recent', and add the
        // recent db connection to the recents store

        if(dbConnectionState.databaseConnection && dbConnectionState.databaseConnection.type){
          if(dbConnectionState.databaseConnection.type === 'favorite'){

            let modifiedDbConnection = {...dbConnectionState.databaseConnection, connectionPath: action.connectionPath, lastDateTimeAccessed: new Date().toString()};

            this.store.dispatch(SidenavListActions.updateFavorite({favorite: modifiedDbConnection}));

            this.store.dispatch(DbConnectionActions.setDatabaseConnection({databaseConnection: modifiedDbConnection}));

          }else if(dbConnectionState.databaseConnection.type === 'recent'){

            let modifiedDbConnection = {...dbConnectionState.databaseConnection, id: uuidv4(), connectionPath: action.connectionPath, lastDateTimeAccessed: new Date().toString()};

            this.store.dispatch(SidenavListActions.addRecent({recent: modifiedDbConnection}));

            this.store.dispatch(DbConnectionActions.setDatabaseConnection({databaseConnection: modifiedDbConnection}));
          }
        }else{

          let newDbConnection = new DBConnection();
          newDbConnection.id = uuidv4();
          newDbConnection.dbAliasName = "";
          newDbConnection.connectionPath = action.connectionPath;
          newDbConnection.type = "recent";
          newDbConnection.lastDateTimeAccessed = new Date().toString();

          this.store.dispatch(SidenavListActions.addRecent({recent: newDbConnection}));
          this.store.dispatch(DbConnectionActions.setDatabaseConnection({databaseConnection: newDbConnection}));

        }

        // this.store.dispatch(DbDetailActions.fetchDatabaseInfo());
        this.store.dispatch(DbDetailActions.fetchDatabaseResults({previousPageIndex: null, currentPageIndex: null, pageSize: null}));
        // this.store.dispatch(DbDetailActions.fetchDatabaseIndexes());

        this.router.navigate(['/home/detail']);
      })
    ),
    { dispatch: false }
  );

  
  

  constructor(
    private actions$: Actions,
    private router: Router,
    private store: Store<fromApp.AppState>,
    private electronService: ElectronService
  ) {}
}
