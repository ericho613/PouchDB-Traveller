import { 
    Action, 
    createReducer, 
    on
  } from '@ngrx/store';
  import * as DbDetailActions from './db-detail.actions';
  import {DBIndex, SearchFilter, DBInfo} from '../../../../shared/models';
  
  
  export interface State {
    databaseResults: Array<object>,
    databaseResultsLoading: boolean,
    databaseResultsErrorMessage: string,
    databaseIndexes: Array<DBIndex>,
    databaseIndexesLoading: boolean,
    databaseIndexesErrorMessage: string,
    databaseInfo: DBInfo,
    databaseInfoLoading: boolean,
    databaseInfoErrorMessage: string,
    searchFilter: SearchFilter,
    persistLoading: boolean,
    documentCreateSuccessful: boolean,
    documentCreateErrorMessage: string,
    documentDeletedId: string,
    documentDeleteErrorMessage: string,
    documentUpdatedId: string,
    documentUpdateErrorMessage: string,
    indexCreateSuccessful: boolean,
    indexCreateErrorMessage: string,
    indexDeleteSuccessful: boolean,
    indexDeleteErrorMessage: string,
    
  }
  
  
  const initialState: State = {
    databaseResults: [],
    databaseResultsLoading: false,
    databaseResultsErrorMessage: "",
    databaseIndexes: [],
    databaseIndexesLoading: false,
    databaseIndexesErrorMessage: "",
    databaseInfo: null,
    databaseInfoLoading: false,
    databaseInfoErrorMessage: "",
    searchFilter: null,
    persistLoading: false,
    documentCreateSuccessful: false,
    documentCreateErrorMessage: "",
    documentDeletedId: null,
    documentDeleteErrorMessage: "",
    documentUpdatedId: null,
    documentUpdateErrorMessage: "",
    indexCreateSuccessful: false,
    indexCreateErrorMessage: "",
    indexDeleteSuccessful: false,
    indexDeleteErrorMessage: "",
  };
  
  
  const _DbDetailReducer = createReducer(
  
    initialState,
  
    on(
        DbDetailActions.setDatabaseResults,
        (state, action) => ({
          ...state,
          databaseResults: [ ...action.databaseResults ],
          databaseResultsErrorMessage: ""
        })
    ),
  
    // on(
    //     DbDetailActions.addDatabaseIndex,
    //   (state, action) => ({
    //     ...state,
    //     databaseIndexes: state.databaseIndexes.concat({ ...action.databaseIndex }),
    //     databaseIndexesErrorMessage: ""
    //   })
    // ),
  
    // on(
    //     DbDetailActions.deleteDatabaseIndex,
    //   (state, action) => ({
    //     ...state,
    //     databaseIndexes: state.databaseIndexes.filter(
    //       (element, index) => element.name !== action.name
    //     ),
    //     databaseIndexesErrorMessage: ""
    //   })
    // ),
  
    on(
        DbDetailActions.setDatabaseIndexes,
      (state, action) => ({
        ...state,
        databaseIndexes: [ ...action.databaseIndexes ],
        databaseIndexesErrorMessage: ""
      })
    ),
  
    on(
        DbDetailActions.setDatabaseInfo,
        (state, action) => ({
        ...state,
        databaseInfo: action.databaseInfo,
        databaseInfoErrorMessage: ""
      })
    ),

    on(
      DbDetailActions.fetchDatabaseInfo,
      (state, action) => ({
        ...state,
        databaseInfoLoading: true,
        databaseInfoErrorMessage: ""
      })
    ),
  
    on(
      DbDetailActions.fetchDatabaseResults,
      (state, action) => ({
        ...state,
        databaseResultsLoading: true,
        databaseResultsErrorMessage: ""
      })
    ),
  
    on(
      DbDetailActions.fetchDatabaseIndexes,
      (state, action) => ({
        ...state,
        databaseIndexesLoading: true,
        databaseIndexesErrorMessage: ""
      })
    ),

    on(
      DbDetailActions.fetchSuccessful,
      (state, action) => ({
        ...state,
        databaseInfo: action.fetchType === "databaseInfo"?  {...action.databaseInfo}  : {...state.databaseInfo},
        databaseInfoLoading: action.fetchType === "databaseInfo"? false : state.databaseInfoLoading,
        databaseInfoErrorMessage: action.fetchType === "databaseInfo"? "" : state.databaseInfoErrorMessage,
        databaseResults: action.fetchType === "databaseResults"? [ ...action.databaseResults ] : [...state.databaseResults],
        databaseResultsLoading: action.fetchType === "databaseResults"? false : state.databaseResultsLoading,
        databaseResultsErrorMessage: action.fetchType === "databaseResults"? "" : state.databaseResultsErrorMessage,
        databaseIndexes: action.fetchType === "databaseIndexes"? [ ...action.databaseIndexes ] : [...state.databaseIndexes],
        databaseIndexesLoading: action.fetchType === "databaseIndexes"? false : state.databaseIndexesLoading,
        databaseIndexesErrorMessage: action.fetchType === "databaseIndexes"? "" : state.databaseIndexesErrorMessage,
      })
    ),

    on(
      DbDetailActions.fetchUnsuccessful,
      (state, action) => ({
        ...state,
        databaseInfoLoading: action.fetchType === "databaseInfo"? false : state.databaseInfoLoading,
        databaseInfoErrorMessage: action.fetchType === "databaseInfo"? action.errorMessage : state.databaseInfoErrorMessage,
        databaseResultsLoading: action.fetchType === "databaseResults"? false : state.databaseResultsLoading,
        databaseResultsErrorMessage: action.fetchType === "databaseResults"? action.errorMessage : state.databaseResultsErrorMessage,
        databaseIndexesLoading: action.fetchType === "databaseIndexes"? false : state.databaseIndexesLoading,
        databaseIndexesErrorMessage: action.fetchType === "databaseIndexes"? action.errorMessage : state.databaseIndexesErrorMessage

      })
    ),

    on(
      DbDetailActions.clearFetchErrorMessages,
      (state, action) => ({
        ...state,
        databaseInfoErrorMessage: "",
        databaseResultsErrorMessage: "",
        databaseIndexesErrorMessage: ""
      })
    ),

    on(
      DbDetailActions.persist,
      (state, action) => ({
        ...state,
        persistLoading: true,
        documentCreateSuccessful: false,
        documentCreateErrorMessage: "",
        documentDeletedId: null,
        documentDeleteErrorMessage: "",
        documentUpdatedId: null,
        documentUpdateErrorMessage: "",
      })
    ),

    on(
      DbDetailActions.persistSuccessful,
      (state, action) => ({
        ...state,
        persistLoading: false,

        documentCreateSuccessful: action.persistType === "create" 
          && !(action.errorMessage && action.errorMessage !== '')? true : state.documentCreateSuccessful,

        documentCreateErrorMessage: (action.errorMessage 
          && action.errorMessage !== '' 
          && action.persistType === "create")? action.errorMessage 
            : state.documentCreateErrorMessage,

        documentDeletedId: action.documentToDeleteId? action.documentToDeleteId : state.documentDeletedId,
        documentDeleteErrorMessage: action.persistType === "delete"? "" : state.documentDeleteErrorMessage,

        documentUpdatedId: action.documentToUpdate? action.documentToUpdate["_id"] : state.documentUpdatedId,
        documentUpdateErrorMessage: action.persistType === "update"? "" : state.documentUpdateErrorMessage,

        databaseResults: (action.persistType === "create") && action.documentToCreate? state.databaseResults.concat(Array.isArray(action.documentToCreate)?[...action.documentToCreate]:{ ...action.documentToCreate }) 
          : (action.persistType === "update") && action.documentToUpdate? state.databaseResults.map(
            (dbResult) => dbResult["_id"] === action.documentToUpdate["_id"] ? { ...action.documentToUpdate } 
            : dbResult)
          :action.persistType === "delete" && action.documentToDeleteId? state.databaseResults.filter(
            (dbResult, index) => dbResult["_id"]!== action.documentToDeleteId
            )
          : state.databaseResults,

      })
    ),

    on(
      DbDetailActions.persistUnsuccessful,
      (state, action) => ({
        ...state,
        persistLoading: false,
        documentCreateSuccessful: action.persistType === "create"? false : state.documentCreateSuccessful,
        documentCreateErrorMessage: action.persistType === "create"? action.errorMessage : state.documentCreateErrorMessage,
        documentDeletedId: action.persistType === "delete"? null : state.documentDeletedId,
        documentDeleteErrorMessage: action.persistType === "delete"? action.errorMessage : state.documentDeleteErrorMessage,
        documentUpdatedId: action.persistType === "update"? null : state.documentUpdatedId,
        documentUpdateErrorMessage: action.persistType === "update"? action.errorMessage : state.documentUpdateErrorMessage,
      })
    ),

    on(
      DbDetailActions.setDocumentDeletedId,
      (state, action) => ({
        ...state,
        persistLoading: false,
        documentDeletedId: action.documentDeletedId
      })
    ),

    on(
      DbDetailActions.setDocumentUpdatedId,
      (state, action) => ({
        ...state,
        persistLoading: false,
        documentUpdatedId: action.documentUpdated["_id"]
      })
    ),

    on(
      DbDetailActions.clearPersistDetails,
      (state, action) => ({
        ...state,
        persistLoading: false,
        documentCreateSuccessful: action.persistType === "create"? false : state.documentCreateSuccessful,
        documentCreateErrorMessage: action.persistType === "create"? "" : state.documentCreateErrorMessage,
        documentDeletedId: action.persistType === "delete"? null : state.documentDeletedId,
        documentDeleteErrorMessage: action.persistType === "delete"? "" : state.documentDeleteErrorMessage,
        documentUpdatedId: action.persistType === "update"? null : state.documentUpdatedId,
        documentUpdateErrorMessage: action.persistType === "update"? "" : state.documentUpdateErrorMessage,
      })
    ),

    on(
      DbDetailActions.setSearchFilter,
      (state, action) => ({
        ...state,
        searchFilter: action.searchFilter
      })
    ),

    on(
      DbDetailActions.filterSearch,
      (state, action) => ({
        ...state,
        databaseResultsLoading: true,
        databaseResultsErrorMessage: "",
        // searchFilter: action.searchFilter? action.searchFilter : state.searchFilter
      })
    ),

    on(
      DbDetailActions.filterSearchSuccessful,
      (state, action) => ({
        ...state,
        databaseResults: [ ...action.databaseResults ],
        databaseResultsLoading: false,
        databaseResultsErrorMessage: "",
        searchFilter: action.searchFilter? action.searchFilter : state.searchFilter
      })
    ),

    on(
      DbDetailActions.filterSearchUnsuccessful,
      (state, action) => ({
        ...state,
        databaseResultsLoading: false,
        databaseResultsErrorMessage: action.errorMessage

      })
    ),

    on(
      DbDetailActions.persistIndex,
      (state, action) => ({
        ...state,
        persistLoading: true,
        indexCreateSuccessful: false,
        indexCreateErrorMessage: "",
        indexDeleteSuccessful: false,
        indexDeleteErrorMessage: "",
      })
    ),

    on(
      DbDetailActions.persistIndexSuccessful,
      (state, action) => ({
        ...state,
        persistLoading: false,
        indexCreateSuccessful: action.persistIndexType === "create"? true : state.indexCreateSuccessful,
        indexCreateErrorMessage: "",
        indexDeleteSuccessful: action.persistIndexType === "delete"? true : state.indexDeleteSuccessful,
        indexDeleteErrorMessage: ""
      })
    ),

    on(
      DbDetailActions.persistIndexUnsuccessful,
      (state, action) => ({
        ...state,
        persistLoading: false,
        indexCreateSuccessful: action.persistIndexType === "create"? false : state.indexCreateSuccessful,
        indexCreateErrorMessage: action.persistIndexType === "create"? action.errorMessage : state.indexCreateErrorMessage,
        indexDeleteSuccessful: action.persistIndexType === "delete"? false : state.indexDeleteSuccessful,
        indexDeleteErrorMessage: action.persistIndexType === "delete"? action.errorMessage : state.indexDeleteErrorMessage
      })
    ),

    on(
      DbDetailActions.clearPersistIndexDetails,
      (state, action) => ({
        ...state,
        persistLoading: false,
        indexCreateSuccessful: action.persistIndexType === "create"? false : state.indexCreateSuccessful,
        indexCreateErrorMessage: action.persistIndexType === "create"? "" : state.indexCreateErrorMessage,
        indexDeleteSuccessful: action.persistIndexType === "delete"? false : state.indexDeleteSuccessful,
        indexDeleteErrorMessage: action.persistIndexType === "delete"? "" : state.indexDeleteErrorMessage
      })
    ),

  );
  
  
  export function dbDetailReducer(state: State, action: Action) {
    return _DbDetailReducer(state, action);
  }
  