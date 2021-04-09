import { 
  Action, 
  createReducer, 
  on
} from '@ngrx/store';
import { DBConnection } from '../../../../shared/models';
import * as SidenavListActions from './sidenav-list.actions';


export interface State {
  favorites: DBConnection[];
  recents: DBConnection[];
  cryptoSpec: string;
  applyEncryption: boolean;
  applyDecryption: boolean;
  cryptoSecretKey: string;
  cryptographySettingsLoading: boolean;
  cryptographySettingsErrorMessage: string;
  favoritesErrorMessage: string;
  favoritesLoading: boolean;
  recentsErrorMessage: string;
  recentsLoading: boolean;
  transferInProcess: boolean;
  transferSuccessful: boolean;
  transferErrorMessage: string;
  documentsToBeTransferredCount: string;
  transferCount: string;
  transferPercentage: string;
}


const initialState: State = {
  favorites: [],
  recents: [],
  cryptoSpec: "aes-256-cbc",
  applyEncryption: false,
  applyDecryption: false,
  cryptoSecretKey: "",
  cryptographySettingsLoading: false,
  cryptographySettingsErrorMessage: "",
  favoritesErrorMessage: "",
  favoritesLoading: false,
  recentsErrorMessage: "",
  recentsLoading: false,
  transferInProcess: false,
  transferSuccessful: false,
  transferErrorMessage: "",
  documentsToBeTransferredCount: "",
  transferCount: "",
  transferPercentage: ""
};


const _sidenavListReducer = createReducer(

  initialState,

  on(
    SidenavListActions.addFavorite,
    (state, action) => ({
      ...state,
      favorites: state.favorites.concat({ ...action.favorite }),
      favoritesErrorMessage: ""
    })
  ),

  on(
    SidenavListActions.updateFavorite,
    (state, action) => ({
      ...state,
      favorites: state.favorites.map(
        (favorite) => favorite.id === action.favorite.id ? { ...action.favorite } : favorite
      ),
      favoritesErrorMessage: ""
    })
  ),

  on(
    SidenavListActions.deleteFavorite,
    (state, action) => ({
      ...state,
      favorites: state.favorites.filter(
        (element, index) => element.id !== action.id
      ),
      favoritesErrorMessage: ""
    })
  ),

  on(
    SidenavListActions.addRecent,
    (state, action) => ({
      ...state,
      recents: [{ ...action.recent }, ...state.recents],
      recentsErrorMessage: ""
    })
  ),

  on(
    SidenavListActions.deleteRecent,
    (state, action) => ({
      ...state,
      recents: state.recents.filter(
        (element, index) => element.id !== action.id
      ),
      recentsErrorMessage: ""
    })
  ),

  on(
    SidenavListActions.setRecents,
    (state, action) => ({
      ...state,
      recents: [ ...action.recents ],
      recentsErrorMessage: ""
    })
  ),

  on(
    SidenavListActions.setCryptoSettings,
    (state, action) => ({
      ...state,
      cryptoSpec: action.cryptoSpec,
      applyEncryption: action.applyEncryption,
      applyDecryption: action.applyDecryption,
      cryptoSecretKey: action.cryptoSecretKey,
      cryptographySettingsLoading: true,
      cryptographySettingsErrorMessage: ""
    })
  ),

  on(
    SidenavListActions.removeCryptoSettings,
    (state, action) => ({
      ...state,
      cryptoSpec: "aes-256-cbc",
      applyEncryption: null,
      applyDecryption: null,
      cryptoSecretKey: null,
      cryptographySettingsLoading: false,
      cryptographySettingsErrorMessage: ""
    })
  ),

  on(
    SidenavListActions.setCryptoSettingsSuccessful,
    (state, action) => ({
      ...state,
      cryptographySettingsLoading: false,
      cryptographySettingsErrorMessage: ""
    })
  ),

  on(
    SidenavListActions.setCryptoSettingsUnsuccessful,
    (state, action) => ({
      ...state,
      cryptographySettingsLoading: false,
      cryptographySettingsErrorMessage: action.errorMessage,
    })
  ),

  on(
    SidenavListActions.clearCryptographySettingsErrorMessage,
    (state, action) => ({
      ...state,
      cryptographySettingsErrorMessage: ""
    })
  ),

  on(
    SidenavListActions.fetchFavorites,
    (state, action) => ({
      ...state,
      favoritesLoading: true,
      favoritesErrorMessage: ""
    })
  ),

  on(
    SidenavListActions.fetchRecents,
    (state, action) => ({
      ...state,
      recentsLoading: true,
      recentsErrorMessage: ""
    })
  ),

  on(
    SidenavListActions.fetchSuccessful,
    (state, action) => ({
      ...state,
      favorites: action.fetchType === "favorites"? [ ...action.favorites ] : [...state.favorites],
      favoritesLoading: action.fetchType === "favorites"? false : state.favoritesLoading,
      favoritesErrorMessage: action.fetchType === "favorites"? "" : state.favoritesErrorMessage,
      recents: action.fetchType === "recents"? [ ...action.recents ] : [...state.recents],
      recentsLoading: action.fetchType === "recents"? false : state.recentsLoading,
      recentsErrorMessage: action.fetchType === "recents"? "" : state.recentsErrorMessage
    })
  ),

  on(
    SidenavListActions.fetchUnsuccessful,
    (state, action) => ({
      ...state,
      favoritesErrorMessage: action.fetchType === "favorites"? action.errorMessage : state.favoritesErrorMessage,
      favoritesLoading: action.fetchType === "favorites"? false : state.favoritesLoading,
      recentsErrorMessage: action.fetchType === "recents"? action.errorMessage : state.recentsErrorMessage,
      recentsLoading: action.fetchType === "recents"? false : state.recentsLoading
    })
  ),

  on(
    SidenavListActions.importFile,
    (state, action) => ({
      ...state,
      transferInProcess: true,
      documentsToBeTransferredCount: "",
      transferCount: "",
      transferSuccessful: false,
      transferPercentage: ""
    })
  ),
  
  on(
    SidenavListActions.importFileSuccessful,
    (state, action) => ({
      ...state,
      transferInProcess: false,
      transferSuccessful: !(action.errorMessage && action.errorMessage !== '') ? true : state.transferSuccessful,
      transferErrorMessage: (action.errorMessage 
        && action.errorMessage !== '')? action.errorMessage 
          : state.transferErrorMessage,
    })
  ),

  on(
    SidenavListActions.importFileUnsuccessful,
    (state, action) => ({
      ...state,
      transferInProcess: false,
      transferSuccessful: false,
      transferErrorMessage: action.errorMessage
    })
  ),

  on(
    SidenavListActions.exportFile,
    (state, action) => ({
      ...state,
      transferInProcess: true,
      documentsToBeTransferredCount: "",
      transferCount: "",
      transferSuccessful: false,
      transferPercentage: ""
    })
  ),
  
  on(
    SidenavListActions.exportFileSuccessful,
    (state, action) => ({
      ...state,
      transferInProcess: false,
      transferSuccessful: !(action.errorMessage && action.errorMessage !== '') ? true : state.transferSuccessful,
      transferErrorMessage: (action.errorMessage 
        && action.errorMessage !== '')? action.errorMessage 
          : state.transferErrorMessage,
    })
  ),

  on(
    SidenavListActions.exportFileUnsuccessful,
    (state, action) => ({
      ...state,
      transferInProcess: false,
      transferSuccessful: false,
      transferErrorMessage: action.errorMessage
    })
  ),

  on(
    SidenavListActions.setTransferDetails,
    (state, action) => ({
      ...state,
      documentsToBeTransferredCount: action.documentsToBeTransferredCount,
      transferCount: action.transferCount,
      transferPercentage: action.transferPercentage
    })
  ),

  on(
    SidenavListActions.clearTransferDetails,
    (state, action) => ({
      ...state,
      documentsToBeTransferredCount: "",
      transferCount: "",
      transferPercentage: "",
      transferInProcess: false,
      transferSuccessful: false,
      transferErrorMessage: ""
    })
  )

);

export function sidenavListReducer(state: State, action: Action) {
  return _sidenavListReducer(state, action);
}
