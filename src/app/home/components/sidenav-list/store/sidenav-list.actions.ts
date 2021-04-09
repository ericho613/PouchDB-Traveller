import {createAction, props} from '@ngrx/store';
import { DBConnection } from '../../../../shared/models';

export const addFavorite = createAction(
  '[Sidenav-list] Add Favorite',
  props<{
    favorite: DBConnection
  }>()
);

export const updateFavorite = createAction(
  '[Sidenav-list] Update Favorite',
  props<{
    favorite: DBConnection
  }>()
);

export const deleteFavorite = createAction(
  '[Sidenav-list] Delete Favorite',
  props<{
    id: string;
  }>()
);

export const fetchFavorites = createAction(
  '[Sidenav-list] Fetch Favorites'
);

export const fetchSuccessful = createAction(
  '[Sidenav-list] Fetch Successful',
  props<{
    fetchType: string;
    favorites?: DBConnection[];
    recents?: DBConnection[];
  }>()
);

export const fetchUnsuccessful = createAction(
  '[Sidenav-list] Fetch Unsuccessful',
  props<{
    fetchType: string;
    errorMessage: string;
  }>()
);

export const addRecent = createAction(
  '[Sidenav-list] Add Recent',
  props<{
    recent: DBConnection
  }>()
);

export const deleteRecent = createAction(
  '[Sidenav-list] Delete Recent',
  props<{
    id: string;
  }>()
);

export const setRecents = createAction(
  '[Sidenav-list] Set Recents',
  props<{
    recents: DBConnection[];
  }>()
);

export const fetchRecents = createAction(
  '[Sidenav-list] Fetch Recents'
);

export const storeRecents = createAction(
  '[Sidenav-list] Store Recents'
);

export const setCryptoSettings = createAction(
  '[Sidenav-list] Set Crypto Settings',
  props<{
    cryptoSpec: string;
    applyEncryption: boolean;
    applyDecryption: boolean;
    cryptoSecretKey: string;
  }>()
  
);

export const removeCryptoSettings = createAction(
  '[Sidenav-list] Remove Crypto Settings'
);

export const setCryptoSettingsSuccessful = createAction(
  '[Sidenav-list] Set Crypto Settings Successful'
);

export const setCryptoSettingsUnsuccessful = createAction(
  '[Sidenav-list] Set Crypto Settings Unsuccessful',
  props<{
    errorMessage: string;
  }>()
  
);

export const clearCryptographySettingsErrorMessage = createAction(
  '[Sidenav-list] Clear Cryptography Settings Error Message'
);

export const importFile = createAction(
  '[Sidenav-list] Import File',
  props<{
    filePath: string;
    fileType: string;
    delimiter?: string;
  }>()
);

export const importFileSuccessful = createAction(
  '[Sidenav-list] Import File Successful',
  props<{
    errorMessage?: string;
  }>()
  
);

export const importFileUnsuccessful = createAction(
  '[Sidenav-list] Import File Unsuccessful',
  props<{
    errorMessage: string;
  }>()
);

export const exportFile = createAction(
  '[Sidenav-list] Export File',
  props<{
    filePath: string;
    fileType: string;
    delimiter?: string;
  }>()
);

export const exportFileSuccessful = createAction(
  '[Sidenav-list] Export File Successful',
  props<{
    errorMessage?: string;
  }>()
  
);

export const exportFileUnsuccessful = createAction(
  '[Sidenav-list] Export File Unsuccessful',
  props<{
    errorMessage: string;
  }>()
);

export const setTransferDetails = createAction(
  '[Sidenav-list] Set File Transfer Details',
  props<{
    documentsToBeTransferredCount: string;
    transferCount: string;
    transferPercentage: string;
  }>()
);

export const clearTransferDetails = createAction(
  '[Sidenav-list] Clear File Transfer Details'
);