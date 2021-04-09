import {createAction, props} from '@ngrx/store';

export const setShowDownloadBanner = createAction(
    '[Header] Set Show Download Banner',
    props<{
      showDownloadBanner: boolean
    }>()
);

export const setShowInstallAndRestartBanner = createAction(
    '[Header] Set Show Install And Restart Banner',
    props<{
      showInstallAndRestartBanner: boolean
    }>()
);

export const setProgressPercentage = createAction(
  '[Header] Set Progress Percentage',
  props<{
    progressTotal: number,
    progressTransferred: number,
    progressPercent: number
  }>()
);
