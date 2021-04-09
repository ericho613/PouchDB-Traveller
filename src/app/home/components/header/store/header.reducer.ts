import { 
    Action, 
    createReducer, 
    on
  } from '@ngrx/store';
  import * as HeaderActions from './header.actions';
  
  
  export interface State {
    showDownloadBanner: boolean,
    showInstallAndRestartBanner: boolean,
    progressTotal: number,
    progressTransferred: number,
    progressPercent: number
  }
  
  
  const initialState: State = {
    showDownloadBanner: false,
    showInstallAndRestartBanner: false,
    progressTotal: 0,
    progressTransferred: 0,
    progressPercent: 0
  };
  
  
  const _HeaderReducer = createReducer(
  
    initialState,
  
    on(
        HeaderActions.setShowDownloadBanner,
        (state, action) => ({
          ...state,
          showDownloadBanner: action.showDownloadBanner
        })
    ),

    on(
        HeaderActions.setShowInstallAndRestartBanner,
        (state, action) => ({
          ...state,
          showInstallAndRestartBanner: action.showInstallAndRestartBanner
        })
    ),

    on(
      HeaderActions.setProgressPercentage,
      (state, action) => ({
        ...state,
        progressTotal: action.progressTotal,
        progressTransferred: action.progressTransferred,
        progressPercent: action.progressPercent
      })
  ),

  );
  
  
  export function headerReducer(state: State, action: Action) {
    return _HeaderReducer(state, action);
  }
  