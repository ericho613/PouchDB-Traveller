import {createAction, props} from '@ngrx/store';
import {DBIndex, SearchFilter, DBInfo} from '../../../../shared/models';

export const setDatabaseResults = createAction(
    '[Db-detail] Set Database Results',
    props<{
      databaseResults: Array<object>;
    }>()
);

export const fetchDatabaseResults = createAction(
    '[Db-detail] Fetch Database Results',
    props<{
      previousPageIndex?: number,
      currentPageIndex?: number,
      pageSize?: number
    }>()
);

export const fetchSuccessful = createAction(
  '[Db-detail] Fetch Successful',
  props<{
    fetchType: string;
    databaseResults?: Array<object>;
    databaseIndexes?: Array<DBIndex>;
    databaseInfo?: DBInfo;
  }>()
);

export const fetchUnsuccessful = createAction(
  '[Db-detail] Fetch Unsuccessful',
  props<{
    fetchType: string;
    errorMessage: string;
  }>()
);

export const clearFetchErrorMessages = createAction(
  '[Db-detail] Clear Fetch Error Messages'
);


export const persist = createAction(
  '[Db-detail] Persist',
  props<{
    persistType: string;
    documentToCreate?: object;
    documentToUpdate?: object;
    documentToDeleteId?: string;
  }>()
);

export const persistSuccessful = createAction(
  '[Db-detail] Persist Successful',
  props<{
    persistType: string;
    documentToCreate?: object;
    documentToUpdate?: object;
    documentToDeleteId?: string;
    errorMessage?: string;
  }>()
);

export const persistUnsuccessful = createAction(
  '[Db-detail] Persist Unsuccessful',
  props<{
    persistType: string;
    errorMessage: string;
  }>()
);

export const setDocumentDeletedId = createAction(
  '[Db-detail] Set Document Deleted Id',
  props<{
    documentDeletedId: string;
  }>()
);

export const setDocumentUpdatedId = createAction(
  '[Db-detail] Set Document Updated Id',
  props<{
    documentUpdated: object;
  }>()
);

export const clearPersistDetails = createAction(
  '[Db-detail] Clear Persist Details',
  props<{
    persistType: string;
  }>()
);

export const setDatabaseIndexes = createAction(
  '[Db-detail] Set Database Indexes',
  props<{
    databaseIndexes: Array<DBIndex>;
  }>()
);

export const fetchDatabaseIndexes = createAction(
  '[Db-detail] Fetch Database Indexes'
);

export const fetchDatabaseInfo = createAction(
    '[Db-detail] Fetch Database Info'
);

export const setDatabaseInfo = createAction(
    '[Db-detail] Set Database Info',
    props<{
      databaseInfo: DBInfo;
    }>()
);

export const setSearchFilter = createAction(
  '[Db-detail] Set Search Filter',
  props<{
    searchFilter: SearchFilter

  }>()
);

export const filterSearch = createAction(
  '[Db-detail] Filter Search',
  props<{
    searchFilter: SearchFilter
  }>()
);

export const filterSearchSuccessful = createAction(
  '[Db-detail] Filter Search Successful',
  props<{
    searchFilter: SearchFilter;
    databaseResults: Array<object>;
  }>()
);

export const filterSearchUnsuccessful = createAction(
  '[Db-detail] Filter Search Unsuccessful',
  props<{
    errorMessage: string;
  }>()
);

export const persistIndex = createAction(
  '[Db-detail] Persist Index',
  props<{
    persistIndexType: string;
    indexToCreate?: object;
    indexToDeletePosition?: number;
  }>()
);

export const persistIndexSuccessful = createAction(
  '[Db-detail] Persist Index Successful',
  props<{
    persistIndexType: string;
  }>()
);

export const persistIndexUnsuccessful = createAction(
  '[Db-detail] Persist Index Unsuccessful',
  props<{
    persistIndexType: string;
    errorMessage: string;
  }>()
);

export const clearPersistIndexDetails = createAction(
  '[Db-detail] Clear Persist Index Details',
  props<{
    persistIndexType: string;
  }>()
);