import { 
    ActionReducerMap, 
    createFeatureSelector, 
    createSelector 
} from '@ngrx/store';

import * as fromSidenavList from '../home/components/sidenav-list/store/sidenav-list.reducer';
import * as fromDbConnection from '../home/components/db-connection/store/db-connection.reducer';
import * as fromDbDetail from '../home/components/db-detail/store/db-detail.reducer';

export interface AppState {
  sidenavList: fromSidenavList.State;
  dbConnection: fromDbConnection.State;
  dbDetail: fromDbDetail.State;
}

export const appReducer: ActionReducerMap<AppState> = {
  sidenavList: fromSidenavList.sidenavListReducer,
  dbConnection: fromDbConnection.databaseConnectionReducer,
  dbDetail: fromDbDetail.dbDetailReducer
};

// export const getSidenavListState = createFeatureSelector<fromSidenavList.State>('sidenavList');

// export const getFavorites = createSelector(getSidenavListState, (state: fromSidenavList.State) => state.favorites);

// export const getRecents = createSelector(getSidenavListState, (state: fromSidenavList.State) => state.recents);

// export const getdatabaseConnectionTitle = createSelector(getSidenavListState, (state: fromSidenavList.State) => state.databaseConnectionTitle);

// export const getdatabaseConnectionOption = createSelector(getSidenavListState, (state: fromSidenavList.State) => state.databaseConnectionOption);

// export const getDbConnectionState = createFeatureSelector<fromDbConnection.State>('dbConnection');

// export const getDbConnection = createSelector(getDbConnectionState, (state: fromDbConnection.State) => state.databaseConnection);