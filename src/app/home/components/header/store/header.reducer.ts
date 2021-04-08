import { 
    Action, 
    createReducer, 
    on
  } from '@ngrx/store';
  import * as HeaderActions from './header.actions';
  
  
  export interface State {
    showDownloadBanner: boolean,
    showInstallAndRestartBanner: boolean
  }
  
  
  const initialState: State = {
    showDownloadBanner: false,
    showInstallAndRestartBanner: false
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

  );
  
  
  export function headerReducer(state: State, action: Action) {
    return _HeaderReducer(state, action);
  }
  