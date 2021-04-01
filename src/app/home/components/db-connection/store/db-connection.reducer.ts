import { 
    Action, 
    createReducer, 
    on
  } from '@ngrx/store';
  import { DBConnection } from '../../../../shared/models';
  import * as DbConnectionActions from './db-connection.actions';
  
  export interface State {
    databaseConnection: DBConnection;
    connectionErrorMessage: string;
    loading: boolean;
    databaseConnected: boolean;
  }
  
  const initialState: State = {
    databaseConnection: null,
    loading: false,
    connectionErrorMessage: null,
    databaseConnected: false
  };
  
  
  const _databaseConnectionReducer = createReducer(
  
    initialState,
  
    on(
      DbConnectionActions.setDatabaseConnection,
      (state, action) => ({
        ...state,
        databaseConnection: action.databaseConnection,
        connectionErrorMessage: null
      })
    ),
  
    on(
      DbConnectionActions.closeDatabaseConnection,
      (state, action) => ({
        ...state,
        databaseConnection: null,
        connectionErrorMessage: null,
        databaseConnected: false
      })
    ),

    on(
      DbConnectionActions.createOrOpenDatabase,
      (state, action) => ({
        ...state,
        databaseConnection: state.databaseConnection? state.databaseConnection : {id:null, connectionPath: action.connectionPath},
        loading: true,
        connectionErrorMessage: null
      })
    ),

    on(
      DbConnectionActions.databaseConnectionSuccess,
      (state, action) => ({
        ...state,
        loading: false,
        connectionErrorMessage: null,
        databaseConnected: true
      })
    ),

    on(
      DbConnectionActions.databaseConnectionFail,
      (state, action) => ({
        ...state,
        loading: false,
        connectionErrorMessage: action.connectionErrorMessage,
        databaseConnected: false
      })
    ),

    //necessary?
    // on(
    //   DbConnectionActions.clearError,
    //   (state, action) => ({
    //     ...state,
    //     connectionErrorMessage: null
    //   })
    // ),
  
  );
  
  
  export function databaseConnectionReducer(state: State, action: Action) {
    return _databaseConnectionReducer(state, action);
  }
  