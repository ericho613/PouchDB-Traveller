import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DocInsertDialogComponent } from '../doc-insert-dialog/doc-insert-dialog.component';
import { ImportDialogComponent } from '../import-dialog/import-dialog.component';
import { ExportDialogComponent } from '../export-dialog/export-dialog.component';
import { DBConnection, SearchFilter } from '../../../shared/models';
import { Store } from '@ngrx/store';
import * as fromApp from '../../../store/app.reducer';
import { Subscription } from 'rxjs';
import * as DbConnectionActions from '../db-connection/store/db-connection.actions';
import * as SidenavListActions from './store/sidenav-list.actions';
import * as DbDetailActions from '../db-detail/store/db-detail.actions';

@Component({
  selector: 'app-sidenav-list',
  templateUrl: './sidenav-list.component.html',
  styleUrls: ['./sidenav-list.component.scss']
})
export class SidenavListComponent implements OnInit, OnDestroy {

  page: string;
  loadedDbConnection: DBConnection;
  databaseName: string;
  favorites: DBConnection[];
  recents:DBConnection[];
  displayClearAll: boolean;
  clickedClearAllButton: boolean;
  
  selectedFavoriteOrRecentDbConnection: DBConnection;

  cryptoSpecification: Array<any> = [
    "aes-256-gcm-sha512" 
  ]
  cryptoSpec;
  applyEncryption: boolean = false;
  applyDecryption: boolean = false;
  cryptoSecretKeyValue: string;
  hide: boolean = true;
  hoveredFavoriteItem: string;
  hoveredRecentItem: string;

  searchFilter: SearchFilter;

  favoritesLoading: boolean;
  favoritesErrorMessage: string;
  recentsLoading: boolean;
  recentsErrorMessage: string;
  
  private dbConnectionStoreSub: Subscription;
  private sidenavListSub: Subscription;
  private dbDetailSub: Subscription;

  constructor(private dialog: MatDialog, private store: Store<fromApp.AppState>) { }

  ngOnInit(): void {

    this.sidenavListSub = this.store.select("sidenavList").subscribe((sidenavListState) => {

      this.favorites = sidenavListState.favorites
      this.recents = sidenavListState.recents;
      this.cryptoSpec = sidenavListState.cryptoSpec;
      this.applyEncryption = sidenavListState.applyEncryption;
      this.applyDecryption = sidenavListState.applyDecryption;
      this.cryptoSecretKeyValue = sidenavListState.cryptoSecretKey;
      this.favoritesLoading = sidenavListState.favoritesLoading;
      this.recentsLoading = sidenavListState.recentsLoading;
      this.favoritesErrorMessage = sidenavListState.favoritesErrorMessage;
      this.recentsErrorMessage = sidenavListState.recentsErrorMessage;

    });

    this.dbConnectionStoreSub = this.store.select("dbConnection").subscribe((databaseConnectionState)=>{
      this.page = databaseConnectionState.databaseConnected ? 'db-detail' : 'db-connection';
      this.loadedDbConnection = databaseConnectionState.databaseConnection ? databaseConnectionState.databaseConnection : null;
      if(databaseConnectionState.databaseConnection){
        if(databaseConnectionState.databaseConnection.dbAliasName){
          this.databaseName = databaseConnectionState.databaseConnection.dbAliasName;
        }else{
          this.databaseName = databaseConnectionState.databaseConnection.connectionPath;
        }
      }
    })

    this.dbDetailSub = this.store.select("dbDetail").subscribe((databaseDetailState)=>{
      this.searchFilter = databaseDetailState.searchFilter;
    })
    
  }

  onSubmit(form: NgForm) {
    this.store.dispatch(SidenavListActions.setCryptoSettings({
      cryptoSpec:this.cryptoSpec, 
      applyEncryption:this.applyEncryption,
      applyDecryption:this.applyDecryption,
      cryptoSecretKey:this.cryptoSecretKeyValue
    }));
  }

  closeDatabase(){
    this.hide = true;
    this.store.dispatch(DbConnectionActions.closeDatabaseConnection());
    this.store.dispatch(SidenavListActions.removeCryptoSettings());
  }

  removeFromFavorites(){
    this.store.dispatch(SidenavListActions.deleteFavorite({id: this.selectedFavoriteOrRecentDbConnection.id}));
    if(this.loadedDbConnection){
      if(
        (this.loadedDbConnection.id === this.selectedFavoriteOrRecentDbConnection.id) &&
        (this.loadedDbConnection.type === this.selectedFavoriteOrRecentDbConnection.type)
      ){
        this.setDefaultDbConnectionSettings();
      }
    }
  }

  addRecentToFavorites(){
    for(let i = 0; i<this.favorites.length; i++){
      if(this.favorites[i].id === this.selectedFavoriteOrRecentDbConnection.id){
        return;
      }
    }
    let modifiedDbConnection = {
      ...this.selectedFavoriteOrRecentDbConnection,
      type: "favorite"
    }
    this.store.dispatch(SidenavListActions.addFavorite({favorite: modifiedDbConnection}));
    this.store.dispatch(SidenavListActions.deleteRecent({id: modifiedDbConnection.id}));
    this.store.dispatch(DbConnectionActions.setDatabaseConnection({databaseConnection: modifiedDbConnection}));

  }

  removeFromRecents(){
    this.store.dispatch(SidenavListActions.deleteRecent({id: this.selectedFavoriteOrRecentDbConnection.id}));
    if(this.loadedDbConnection){
      if(
        (this.loadedDbConnection.id === this.selectedFavoriteOrRecentDbConnection.id) &&
        (this.loadedDbConnection.type === this.selectedFavoriteOrRecentDbConnection.type)
      ){
        this.setDefaultDbConnectionSettings();
      }
    }
  }

  clearAllRecents(){
    this.clickedClearAllButton = true;
    
    if(this.loadedDbConnection){
      for(let i = 0; i<this.recents.length; i++){
        if(
          (this.recents[i].id === this.loadedDbConnection.id) &&
          (this.recents[i].type === this.loadedDbConnection.type)
          ){
          this.setDefaultDbConnectionSettings();
          break;
        }
      }
    }
    this.store.dispatch(SidenavListActions.setRecents({recents: []}));
  }

  selectFavoriteOrRecentDbConnection(dbConnection: DBConnection){
    this.selectedFavoriteOrRecentDbConnection = dbConnection;
  }

  setDefaultDbConnectionSettings(){
    this.store.dispatch(DbConnectionActions.setDatabaseConnection({databaseConnection: null}));
  }

  setDatabaseConnection(dbConnection : DBConnection){
    this.store.dispatch(DbConnectionActions.setDatabaseConnection({databaseConnection: dbConnection}));
  }

  openInsertDocDialog() {
    const dialogRef = this.dialog.open(DocInsertDialogComponent,
      {
        // height: '600px',
        disableClose: true,
        width: '700px',
        data: {
          databaseName: this.databaseName,
          newDocument: ""
        }
      }
    );

    dialogRef.afterClosed().subscribe(result => {

      this.store.dispatch(DbDetailActions.clearPersistDetails({persistType:"create"}));
      
    });

  }

  openImportToDatabase() {
    const dialogRef = this.dialog.open(ImportDialogComponent,
      {
        disableClose: true,
        // height: '400px',
        width: '700px',
        data: {
          databaseName: this.databaseName,
          file: null
        }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      
      this.store.dispatch(SidenavListActions.clearTransferDetails());
      
    });

  }

  openExportFromDatabase() {
    const dialogRef = this.dialog.open(ExportDialogComponent,
      {
        disableClose: true,
        // height: '400px',
        width: '700px',
        data: {
          databaseName: this.databaseName,
          output: null
        }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      
      this.store.dispatch(SidenavListActions.clearTransferDetails());
      
    });

  }

  ngOnDestroy(){
    if(this.sidenavListSub){
      this.sidenavListSub.unsubscribe();
    }

    if(this.dbConnectionStoreSub){
      this.dbConnectionStoreSub.unsubscribe();
    }

    if(this.dbDetailSub){
      this.dbDetailSub.unsubscribe();
    }
    
  }

}

