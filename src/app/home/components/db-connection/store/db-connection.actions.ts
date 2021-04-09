import {createAction, props} from '@ngrx/store';
import { DBConnection } from '../../../../shared/models';

export const setDatabaseConnection = createAction(
    '[Db-connection] Set Database Connection',
    props<{
      databaseConnection: DBConnection;
    }>()
  );

export const closeDatabaseConnection = createAction(
  '[Db-connection] Close Database Connection'
);

export const createOrOpenDatabase = createAction(
  '[Db-connection] Create Or Open Database',
  props<{
    connectionPath: string;
  }>()
);

export const databaseConnectionSuccess = createAction(
  '[Db-connection] Database Connection Success',
  props<{
    connectionPath: string;
  }>()
);

export const databaseConnectionFail = createAction(
  '[Db-connection] Database Connection Fail',
  props<{
    connectionErrorMessage: string;
  }>()
);


