import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromApp from '../../../store/app.reducer';
import * as DbConnectionActions from './store/db-connection.actions';
import * as SidenavListActions from '../../components/sidenav-list/store/sidenav-list.actions';
import { DBConnection } from '../../../shared/models';
import { FavoriteDialogComponent } from '../favorite-dialog/favorite-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { v4 as uuidv4 } from 'uuid';
import { ElectronService } from '../../../core/services/index';

import { 
  FormControl, 
  FormGroup,
  Validators } from '@angular/forms';

@Component({
  selector: 'app-db-connection',
  templateUrl: './db-connection.component.html',
  styleUrls: ['./db-connection.component.scss']
})
export class DbConnectionComponent implements OnInit, OnDestroy {

  title: string;
  createOrOpenDbPathValue: string;
  // createOrOpenDbPathValueValid: boolean;
  lastDateTimeAccessed: string;
  pathEditMode: boolean;
  loadedDbConnection: DBConnection;

  // @ViewChild('formcreateOrOpenDbPath') form;
  @ViewChild('favoriteBtn') favoriteBtn : ElementRef;

  private dbConnectionStoreSub: Subscription;

  dbConnectionForm: FormGroup;

  dbConnectionFormSub: Subscription;

  errorMessage: string;

  constructor(private electronService: ElectronService, private store: Store<fromApp.AppState>, private dialog: MatDialog) { }

  ngOnInit(): void {

    

    this.dbConnectionForm = new FormGroup({
      'createOrOpenDbPath': new FormControl("", [Validators.required, this.validatePath])
    });

    this.dbConnectionFormSub = this.dbConnectionForm.valueChanges.subscribe(changedValues => {
      this.createOrOpenDbPathValue = changedValues.createOrOpenDbPath;
      // this.createOrOpenDbPathValueValid = this.checkPathIsValid(this.createOrOpenDbPathValue);

      // console.log(this.checkPathIsValid());
    });

    this.dbConnectionStoreSub = this.store.select("dbConnection").subscribe((dbConnectionState) => {

      console.log(dbConnectionState.databaseConnection? dbConnectionState.databaseConnection.connectionPath : "");

      this.createOrOpenDbPathValue = dbConnectionState.databaseConnection? dbConnectionState.databaseConnection.connectionPath : "";

      this.dbConnectionForm.patchValue({'createOrOpenDbPath': dbConnectionState.databaseConnection? dbConnectionState.databaseConnection.connectionPath : ""});

      this.lastDateTimeAccessed = dbConnectionState.databaseConnection? dbConnectionState.databaseConnection.lastDateTimeAccessed : "";
      if(dbConnectionState.databaseConnection){
        if(dbConnectionState.databaseConnection.dbAliasName){
          this.title = dbConnectionState.databaseConnection.dbAliasName;
        }else if(dbConnectionState.databaseConnection.connectionPath){
          this.title = dbConnectionState.databaseConnection.connectionPath;
        }else if(!dbConnectionState.databaseConnection.connectionPath){
          this.title = 'Unidentified Database';
        }
      }else{
        this.title = "Create/Open Database";
      }
      this.pathEditMode = !dbConnectionState.databaseConnection;

      if(this.pathEditMode){
        this.dbConnectionForm.get("createOrOpenDbPath").enable();
      }else{
        this.dbConnectionForm.get("createOrOpenDbPath").disable();
      }

      this.loadedDbConnection = dbConnectionState.databaseConnection;

      this.errorMessage = dbConnectionState.connectionErrorMessage;
    });

    
  }

  openFolderBrowse(){
    let folderPath = this.electronService.openFolderBrowse();
    if(folderPath){
      if(folderPath.length > 0){
        this.createOrOpenDbPathValue = folderPath[0];
        this.dbConnectionForm.patchValue({'createOrOpenDbPath': folderPath[0]});
      }
    }
    
    // .then( result => {
    //   if(!result.canceled){
    //     this.createOrOpenDbPathValue = result.filePaths[0];
    //     this.dbConnectionForm.patchValue({'createOrOpenDbPath': result.filePaths[0]});
    //   }
      
    // });
  }

  clearCreateOrOpenDbPathValue(){
    this.dbConnectionForm.patchValue({'createOrOpenDbPath': ""});
  }

  validatePath(control: FormControl): {[s: string]: boolean}{

    let regexPattern = new RegExp(/^(?:[a-z]:)?[\/\\]{0,2}(?:[.\/\\ ](?![.\/\\\n])|[^<>:"|?*.\/\\ \n])+$/gmi);

    if(regexPattern.test(control.value)){
      return null;
    }
    return {'invalidPath': true};
    
  }

  // checkPathIsValid(value: string){
  //   let regexPattern = new RegExp(/^(?:[a-z]:)?[\/\\]{0,2}(?:[.\/\\ ](?![.\/\\\n])|[^<>:"|?*.\/\\ \n])+$/gmi);

  //   if(regexPattern.test(value)){
  //     return true;
  //   }
  //   return false;
  // }

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

      console.log(result);

      this.favoriteBtn['_elementRef'].nativeElement
      .classList.remove('cdk-program-focused');

      if (result) {
        
        if(result.removeFavorite && result.loadedDbConnection){
          this.store.dispatch(SidenavListActions.deleteFavorite({id: result.loadedDbConnection.id}));
          this.store.dispatch(DbConnectionActions.setDatabaseConnection({databaseConnection: null}));
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

        if(!result.loadedDbConnection){

          let newDbConnection = new DBConnection();
          newDbConnection.id = uuidv4();
          newDbConnection.dbAliasName = result.databaseName;
          newDbConnection.connectionPath = this.createOrOpenDbPathValue;
          newDbConnection.type = "favorite";
          newDbConnection.lastDateTimeAccessed = "";

          this.store.dispatch(SidenavListActions.addFavorite({favorite: newDbConnection}));
          this.store.dispatch(DbConnectionActions.setDatabaseConnection({databaseConnection: newDbConnection}));
        }

      }
    });

  }

  activatePathEditMode(){
    this.pathEditMode = true;
    this.dbConnectionForm.get("createOrOpenDbPath").enable();
  }

  saveDbConnection(){

    let modifiedDbConnection = {...this.loadedDbConnection, connectionPath: this.dbConnectionForm.value.createOrOpenDbPath}

    if(this.loadedDbConnection.type === "favorite"){
      this.store.dispatch(SidenavListActions.updateFavorite({favorite: modifiedDbConnection}));
      this.store.dispatch(DbConnectionActions.setDatabaseConnection({databaseConnection: modifiedDbConnection}));
    }
        
    this.pathEditMode = false;
    this.dbConnectionForm.get("createOrOpenDbPath").disable();
  }

  onSubmit() {
    // console.log(this.dbConnectionForm);
    if(!this.dbConnectionForm.value.createOrOpenDbPath){
      return;
    }
    // console.log(this.dbConnectionForm.get('createOrOpenDbPath').valid);
    // console.log(this.dbConnectionForm.value.createOrOpenDbPath);
    // console.log(this.createOrOpenDbPathValue);

    this.store.dispatch(DbConnectionActions.createOrOpenDatabase({connectionPath: this.createOrOpenDbPathValue}));


    // this.dbConnectionForm.reset();
  }

  ngOnDestroy(){
    if(this.dbConnectionStoreSub){
      this.dbConnectionStoreSub.unsubscribe();
    }
    if(this.dbConnectionFormSub){
      this.dbConnectionFormSub.unsubscribe();
    }
  }

}
