import { Injectable } from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame, remote, shell } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';

import { Store } from '@ngrx/store';
import * as fromApp from '../../../store/app.reducer';
import * as SidenavListActions from '../../../home/components/sidenav-list/store/sidenav-list.actions';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  shell: typeof shell;
  // remote: typeof remote;
  childProcess: typeof childProcess;
  fs: typeof fs;

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }

  constructor(private store: Store<fromApp.AppState>) {
    // Conditional imports
    if (this.isElectron) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;
      this.shell = window.require('electron').shell;

      // If you wan to use remote object, pleanse set enableRemoteModule to true in main.ts
      // this.remote = window.require('electron').remote;

      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');

      //listening on the 'mailbox' channel
      this.ipcRenderer.on( 'file-transfer-details', (e, transferCount, transferPercentage, documentsToBeTransferredCount) => {
        this.store.dispatch(SidenavListActions.setTransferDetails({documentsToBeTransferredCount: documentsToBeTransferredCount, transferCount: transferCount, transferPercentage: transferPercentage}));
      })
    }
  }

  openExternalLink(link){
    this.shell.openExternal(link);
  }

  openFolderBrowse(){
    // return this.ipcRenderer.invoke( 'open-folder-browse' )
    // .then( answer => {

    //   return answer;
    // })
    let response = this.ipcRenderer?.sendSync('open-folder-browse');
    return response;
  }

  openFileSaveBrowse(fileType){
    let response = this.ipcRenderer?.sendSync('open-file-save-browse', fileType);
    return response;
  }

  openFileBrowse(){
    // return this.ipcRenderer.invoke( 'open-folder-browse' )
    // .then( answer => {

    //   return answer;
    // })
    let response = this.ipcRenderer?.sendSync('open-file-browse');
    return response;
  }

  fetchFavorites(){
    return this.ipcRenderer?.invoke( 'fetch-favorites' )
      .then( data => {
        return data;
      })
      .catch(error => {
        throw error;
      })
  }

  fetchRecents(){
    return this.ipcRenderer?.invoke( 'fetch-recents' )
      .then( data => {
        return data;
      })
      .catch(error => {
        throw error;
      })
  }

  storeFavorites(favorites){
    return this.ipcRenderer?.invoke( 'store-favorites', favorites )
    .then( response => {
      return response;
    })
    .catch(error => {
      throw error;
    })
  }

  storeRecents(recents){
    return this.ipcRenderer?.invoke( 'store-recents', recents )
    .then( response => {
      return response;
    })
    .catch(error => {
      throw error;
    })
  }

  connectToDatabase(storagePath){
    return this.ipcRenderer?.invoke( 'connect-to-database', storagePath )
    .then( response => {
      return response;
    })
    .catch(error => {
      throw error;
    })
  }

  closeDatabase(){
    return this.ipcRenderer?.invoke( 'close-database')
    .then( response => {
      return response;
    })
    .catch(error => {
      throw error;
    })
  }

  fetchDatabaseInfo(){
    return this.ipcRenderer?.invoke( 'fetch-database-info' )
      .then( databaseInfo => {
        return databaseInfo;
      })
      .catch(error => {
        throw error;
      })
  }

  fetchDatabaseResults(fetchOptionsObj){
    return this.ipcRenderer?.invoke( 'fetch-database-results', fetchOptionsObj)
      .then( databaseResults => {
        return databaseResults;
      })
      .catch(error => {
        throw error;
      })
  }

  resetSearch(){
    let response = this.ipcRenderer?.sendSync('reset-search');
    return response;
  }

  fetchDatabaseIndexes(){
    return this.ipcRenderer?.invoke( 'fetch-database-indexes' )
      .then( databaseIndexes => {
        return databaseIndexes;
      })
      .catch(error => {
        throw error;
      })
  }

  setCryptographySettings(cryptographySettingsObj){
    return this.ipcRenderer?.invoke( 'set-cryptography-settings', cryptographySettingsObj)
      .then( response => {
        return response;
      })
      .catch(error => {
        throw error;
      })
  }

  persist(persistType, persistItem){
    return this.ipcRenderer?.invoke( 'persist', persistType, persistItem)
      .then( result => {
        return result;
      })
      .catch(error => {
        throw error;
      })
  }

  filterSearch(searchFilter){
    return this.ipcRenderer?.invoke( 'filter-search', searchFilter)
      .then( result => {
        return result;
      })
      .catch(error => {
        throw error;
      })
  }

  persistIndex(persistIndexType, persistItem){
    return this.ipcRenderer?.invoke( 'persist-index', persistIndexType, persistItem)
      .then( result => {
        return result;
      })
      .catch(error => {
        throw error;
      })
  }

  importFile(filePath, fileType, delimiter){
    return this.ipcRenderer?.invoke( 'import-file', filePath, fileType, delimiter)
      .then( result => {
        return result;
      })
      .catch(error => {
        throw error;
      })
  }

  exportFile(filePath, fileType, delimiter){
    return this.ipcRenderer?.invoke( 'export-file', filePath, fileType, delimiter)
      .then( result => {
        return result;
      })
      .catch(error => {
        throw error;
      })
  }
  


}