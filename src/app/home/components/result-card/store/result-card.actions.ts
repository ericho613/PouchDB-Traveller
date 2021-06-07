import {createAction, props} from '@ngrx/store';
import { DataNode } from '../../../../shared/models';

export const buildFileTree = createAction(
  '[Result-card] Build File Tree',
  props<{
    obj: object;
    level: number;
  }>()
);

export const setFileTree = createAction(
  '[Result-card] Set File Tree',
  props<{
    fileTree: Array<DataNode>;
  }>()
  
);