import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { FavoriteDialogComponent } from '../favorite-dialog/favorite-dialog.component';
import { CreateIndexDialogComponent } from '../create-index-dialog/create-index-dialog.component';
import { ErrorAlertDialogComponent } from '../error-alert-dialog/error-alert-dialog.component';

import { MatPaginator } from '@angular/material/paginator';

import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromApp from '../../../store/app.reducer';
import { DBConnection, SearchFilter } from '../../../shared/models';
import * as DbConnectionActions from '../db-connection/store/db-connection.actions';
import * as SidenavListActions from '../sidenav-list/store/sidenav-list.actions';
import * as DbDetailActions from '../db-detail/store/db-detail.actions';
import { ElectronService } from '../../../core/services/index';

import { 
  FormControl, 
  FormGroup } from '@angular/forms';

@Component({
  selector: 'app-db-detail',
  templateUrl: './db-detail.component.html',
  styleUrls: ['./db-detail.component.scss']
})
export class DbDetailComponent implements OnInit, OnDestroy {

  databaseName: string;
  documentCount: string;
  diskSize: string;
  indexCount: string;
  filterValue: string;
  sortValue: string;
  limitValue: string;
  skipValue: string;
  optionsActivated: boolean = false;
  dbResults: Array<any>;

  databaseResultsLoading: boolean;
  databaseResultsErrorMessage: string;
  databaseIndexesErrorMessage: string;
  databaseInfoErrorMessage: string;
  cryptographySettingsErrorMessage: string;

  @ViewChild('searchPaginator') searchPaginator: MatPaginator;
  searchPaginatorPageSize: number;
  searchPaginatorPageSizeOptions: Array<number>;
  searchPaginatorLength: number;

  @ViewChild('filterSearchPaginator') filterSearchPaginator: MatPaginator;
  filterSearchPaginatorPageSize: number;
  filterSearchPaginatorPageSizeOptions: Array<number>;
  filterSearchPaginatorLength: number;
  filterSearchResults: Array<any>;

  loadedDbConnection: DBConnection;

  searchFilter: SearchFilter;

  private dbConnectionSub: Subscription;
  private dbDetailSub: Subscription;
  private sidenavListSub: Subscription;

  dbDetailForm: FormGroup;
  dbDetailFormSub: Subscription;

  errorMessagesArray: Array<string> = [];

  @ViewChild('favoriteBtn') favoriteBtn : ElementRef;

  constructor(private electronService: ElectronService, private store: Store<fromApp.AppState>, private dialog: MatDialog) { }

  ngOnInit(): void {

    this.dbDetailForm = new FormGroup({
      'filter': new FormControl("", [this.validateJSON]),
      'sort': new FormControl("", [this.validateJSON, this.validateArray]),
      'limit': new FormControl("", [this.validateNumber]),
      'skip': new FormControl("", [this.validateNumber]),
    });

    this.dbDetailFormSub = this.dbDetailForm.valueChanges.subscribe(changedValues => {
      this.filterValue = changedValues.filter;
      this.sortValue = changedValues.sort;
      this.limitValue = changedValues.limit;
      this.skipValue = changedValues.skip;
    });

    this.dbConnectionSub = this.store.select("dbConnection").subscribe((dbConnectionState) => {

      if(dbConnectionState.databaseConnection){
        this.databaseName = dbConnectionState.databaseConnection.dbAliasName? dbConnectionState.databaseConnection.dbAliasName : dbConnectionState.databaseConnection.connectionPath;

        this.loadedDbConnection = dbConnectionState.databaseConnection;
      }

    });

    this.dbDetailSub = this.store.select("dbDetail").subscribe((dbDetailState) => {
      if(dbDetailState.databaseInfo){
        this.documentCount = dbDetailState.databaseInfo.documentCount;
        this.diskSize = dbDetailState.databaseInfo.diskSize;
        this.searchPaginatorLength = +dbDetailState.databaseInfo.documentCount;

      }
      
      this.indexCount = dbDetailState.databaseIndexes.length +"";
      this.dbResults = dbDetailState.databaseResults;
      this.searchFilter = dbDetailState.searchFilter;
      this.databaseResultsLoading = dbDetailState.databaseResultsLoading;

      
      if(this.searchFilter){
        this.filterSearchResults = this.dbResults.slice(this.filterSearchPaginator.pageIndex * this.filterSearchPaginator.pageSize, ((this.filterSearchPaginator.pageIndex * this.filterSearchPaginator.pageSize) + this.filterSearchPaginator.pageSize));
      }else{
        this.filterSearchResults = null;
      }

      this.filterSearchPaginatorLength = dbDetailState.databaseResults.length;
    
      this.databaseInfoErrorMessage = dbDetailState.databaseInfoErrorMessage;
      this.databaseResultsErrorMessage = dbDetailState.databaseResultsErrorMessage;
      this.databaseIndexesErrorMessage = dbDetailState.databaseIndexesErrorMessage;

      if(this.databaseInfoErrorMessage !== "" && this.databaseInfoErrorMessage){
        this.errorMessagesArray.push(this.databaseInfoErrorMessage);
      }
      if(this.databaseResultsErrorMessage !== "" && this.databaseResultsErrorMessage){
        this.errorMessagesArray.push(this.databaseResultsErrorMessage);
      }
      if(this.databaseIndexesErrorMessage !== "" && this.databaseIndexesErrorMessage){
        this.errorMessagesArray.push(this.databaseIndexesErrorMessage);
      }
      if(this.errorMessagesArray.length > 0){
        console.log(this.errorMessagesArray);
        this.openErrorAlertDialog(this.errorMessagesArray);
      }
      
    });

    this.sidenavListSub = this.store.select("sidenavList").subscribe((sidenavListState) => {

      this.cryptographySettingsErrorMessage = sidenavListState.cryptographySettingsErrorMessage;

      if(this.cryptographySettingsErrorMessage !== "" && this.cryptographySettingsErrorMessage){
        this.errorMessagesArray.push(this.cryptographySettingsErrorMessage);
      }
      if(this.errorMessagesArray.length > 0){
        this.openErrorAlertDialog(this.errorMessagesArray);
      }
    });


    this.searchPaginatorPageSize = 10;
    this.searchPaginatorPageSizeOptions = [5,10,20];

    this.filterSearchPaginatorPageSize = 10;
    this.filterSearchPaginatorPageSizeOptions = [5,10,20];
  }

  openExternalLink(link){
    this.electronService.openExternalLink(link);
  }

  resetSearch(){
    this.filterSearchResults = null;
    this.filterSearchPaginator.pageIndex = 0;
    this.filterSearchPaginator.pageSize = 10;
    this.filterSearchPaginatorPageSize = 10;

    this.searchPaginator.pageIndex = 0;
    this.searchPaginator.pageSize = 10;
    this.searchPaginatorPageSize = 10;
    let resetStatusMessage = this.electronService.resetSearch();
    console.log(resetStatusMessage);
    this.store.dispatch(DbDetailActions.setSearchFilter({searchFilter:null}));
    this.store.dispatch(DbDetailActions.fetchDatabaseResults({previousPageIndex: null, currentPageIndex: null, pageSize: null}));
    
  }

  refreshSearch(){
    if(this.searchFilter){
      this.store.dispatch(DbDetailActions.filterSearch({searchFilter:this.searchFilter}));
      this.filterSearchResults = this.dbResults.slice(this.filterSearchPaginator.pageIndex * this.filterSearchPaginator.pageSize, ((this.filterSearchPaginator.pageIndex * this.filterSearchPaginator.pageSize) + this.filterSearchPaginator.pageSize));
    }else{
      this.store.dispatch(DbDetailActions.fetchDatabaseResults({previousPageIndex: null, currentPageIndex: null, pageSize: null}));
    }
  }

  validateArray(control: FormControl): {[s: string]: boolean}{
    if(control.value === ""){
      return null;
    }  
    if(isNaN(control.value) === false){
      return {'invalidJSONValue': true};
    }  
    try {
      
      if(Array.isArray(JSON.parse(control.value))){
        return null;
      }else{
        throw new Error();
      }
      
    } catch (error) {
      return {'invalidArrayValue': true};
    }

  }

  validateJSON(control: FormControl): {[s: string]: boolean}{
    if(control.value === ""){
      return null;
    }  
    if(isNaN(control.value) === false){
      return {'invalidJSONValue': true};
    }  
    try {
      JSON.parse(control.value);
      return null;
      
    } catch (error) {
      return {'invalidJSONValue': true};
    }

  }

  validateNumber(control: FormControl): {[s: string]: boolean}{

    if(isNaN(control.value) === true){
      return {'invalidNumberValue': true};
    }
    return null;
    
  }

  clearFilterValue(){
    this.dbDetailForm.patchValue({"filter":""});
  }

  clearSortValue(){
    this.dbDetailForm.patchValue({"sort":""});
  }

  clearLimitValue(){
    this.dbDetailForm.patchValue({"limit":""});
  }

  clearSkipValue(){
    this.dbDetailForm.patchValue({"skip":""});
  }

  onSubmit() {

    this.filterSearchResults = null;
    this.filterSearchPaginator.pageIndex = 0;
    this.filterSearchPaginatorPageSize = this.filterSearchPaginator.pageSize;

    let newSearchFilter = new SearchFilter();
    newSearchFilter.filter = this.filterValue? this.filterValue : null;
    newSearchFilter.sort = this.sortValue? this.sortValue : null;
    newSearchFilter.limit = this.limitValue? this.limitValue : null;
    newSearchFilter.skip = this.skipValue? this.skipValue : null;

    console.log(newSearchFilter);

    this.store.dispatch(DbDetailActions.filterSearch({searchFilter:newSearchFilter}));


  }

  //function used in the template to display search results
  // based on the pagination strategy
  fetchSearchPaginationResults(pageEvent){
    console.log(pageEvent);
    this.filterSearchPaginatorPageSize = pageEvent.pageSize;
    this.store.dispatch(DbDetailActions.fetchDatabaseResults({previousPageIndex: pageEvent.previousPageIndex, currentPageIndex: pageEvent.pageIndex, pageSize: pageEvent.pageSize}));

  }

  //function used in the template to display filter search results
  // based on the pagination strategy
  fetchFilterSearchPaginationResults(pageEvent){
    console.log(pageEvent);
    this.filterSearchPaginatorPageSize = pageEvent.pageSize;

    this.filterSearchResults = this.dbResults.slice(pageEvent.pageIndex * pageEvent.pageSize, ((pageEvent.pageIndex * pageEvent.pageSize) + pageEvent.pageSize));

  }

  openFavoriteDialog() {

    const dialogRef = this.dialog.open(FavoriteDialogComponent, {
      // height: '200px',
      disableClose: true,
      width: '400px',
      data: {
        databaseName: this.loadedDbConnection && this.loadedDbConnection.dbAliasName? this.loadedDbConnection.dbAliasName : "",
        loadedDbConnection: this.loadedDbConnection,
        removeFavorite: false
        
      }
    });

    dialogRef.afterClosed().subscribe(result => {

      this.favoriteBtn['_elementRef'].nativeElement
      .classList.remove('cdk-program-focused');

      if (result) {
        
        if(result.removeFavorite && result.loadedDbConnection){
          this.store.dispatch(SidenavListActions.deleteFavorite({id: result.loadedDbConnection.id}));

          let modifiedDbConnection = {...result.loadedDbConnection,type: 'recent', dbAliasName: ""};

          this.store.dispatch(SidenavListActions.addRecent({recent: modifiedDbConnection}));
          this.store.dispatch(DbConnectionActions.setDatabaseConnection({databaseConnection: modifiedDbConnection}));
        }

        if(!result.removeFavorite && result.loadedDbConnection && result.loadedDbConnection.type === 'favorite'){

          let modifiedDbConnection = {...result.loadedDbConnection, dbAliasName: result.databaseName};

          this.store.dispatch(SidenavListActions.updateFavorite({favorite: modifiedDbConnection}));
          this.store.dispatch(DbConnectionActions.setDatabaseConnection({databaseConnection: modifiedDbConnection}));
        }

        if(!result.removeFavorite && result.loadedDbConnection && result.loadedDbConnection.type === 'recent'){

          let modifiedDbConnection = {...result.loadedDbConnection, dbAliasName: result.databaseName, type: 'favorite'};

          this.store.dispatch(SidenavListActions.addFavorite({favorite: modifiedDbConnection}));
          this.store.dispatch(SidenavListActions.deleteRecent({id: modifiedDbConnection.id}));
          this.store.dispatch(DbConnectionActions.setDatabaseConnection({databaseConnection: modifiedDbConnection}));
        }

      }
    });

  }

  openCreateIndexDialog() {
    const dialogRef = this.dialog.open(CreateIndexDialogComponent,
      {
        // height: '500px',
        disableClose: true,
        width: '500px',
        data: {
          indexName: "",
          indexFields: "",
          designDocumentName: ""
        }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      this.store.dispatch(DbDetailActions.clearPersistIndexDetails({persistIndexType:"create"}));
    });

  }

  openErrorAlertDialog(errorMessagesArray) {
    const dialogRef = this.dialog.open(ErrorAlertDialogComponent,
      {
        // height: '500px',
        disableClose: true,
        width: '600px',
        data: {
          errorMessages: errorMessagesArray
        }
      }
    );

    dialogRef.afterClosed().subscribe(result => {

      this.databaseInfoErrorMessage = null;
      this.databaseResultsErrorMessage = null;
      this.databaseIndexesErrorMessage = null;
      this.cryptographySettingsErrorMessage = null;
      this.errorMessagesArray = [];
      this.store.dispatch(DbDetailActions.clearFetchErrorMessages());

      this.store.dispatch(DbDetailActions.fetchDatabaseInfo());
      this.store.dispatch(DbDetailActions.fetchDatabaseIndexes());

      //used to clear cryptographySettingsErrorMessage in state
      this.store.dispatch(SidenavListActions.clearCryptographySettingsErrorMessage());

      if(result){
        this.store.dispatch(DbConnectionActions.closeDatabaseConnection());
      }
      
    });

  }

  ngOnDestroy(){
    if(this.dbConnectionSub){
      this.dbConnectionSub.unsubscribe();
    };
    if(this.dbDetailSub){
      this.dbDetailSub.unsubscribe();
    };
    if(this.sidenavListSub){
      this.sidenavListSub.unsubscribe();
    };
  }

}
