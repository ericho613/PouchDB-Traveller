import { 
  Action, 
  createReducer, 
  on
} from '@ngrx/store';
import { DataNode } from '../../../../shared/models';
import * as ResultCardActions from './result-card.actions';

export interface State {
  fileTree: DataNode[];
}

const initialState: State = {
  fileTree: []
};

const _resultCardReducer = createReducer(

  initialState,

  on(
    ResultCardActions.setFileTree,
    (state, action) => ({
      ...state,
      fileTree: action.fileTree
    })
  )

);

export function resultCardReducer(state: State, action: Action) {
  return _resultCardReducer(state, action);
}
