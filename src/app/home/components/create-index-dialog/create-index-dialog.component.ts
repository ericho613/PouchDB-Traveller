import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { DBIndex } from '../../../shared/models';
import { Store } from '@ngrx/store';
import * as fromApp from '../../../store/app.reducer';
import { Subscription } from 'rxjs';
import * as DbDetailActions from '../db-detail/store/db-detail.actions';

import { 
  FormControl, 
  FormGroup,
  Validators } from '@angular/forms';

import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ElectronService } from '../../../core/services/index';

@Component({
  selector: 'app-create-index-dialog',
  templateUrl: './create-index-dialog.component.html',
  styleUrls: ['./create-index-dialog.component.scss']
})
export class CreateIndexDialogComponent implements OnInit, OnDestroy {

  errorMessage: string;
  indexCreateSuccessful: boolean;
  persistLoading: boolean;
  private dbDetailSub: Subscription;
  createIndexDialogForm: FormGroup;
  createIndexDialogFormSub: Subscription;
  indexNameValue: string;
  indexFieldsValue: string;
  designDocumentNameValue: string;

  constructor(private store: Store<fromApp.AppState>, private electronService: ElectronService, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {

    this.createIndexDialogForm = new FormGroup({
      'indexName': new FormControl(""),
      'indexFields': new FormControl("", [Validators.required, this.validateJSON, this.validateArray]),
      'designDocumentName': new FormControl("")
    });

    this.createIndexDialogFormSub = this.createIndexDialogForm.valueChanges.subscribe(changedValues => {
      this.indexNameValue = changedValues.indexName;
      this.indexFieldsValue = changedValues.indexFields;
      this.designDocumentNameValue = changedValues.designDocumentName;
    });

    this.dbDetailSub = this.store.select("dbDetail").subscribe((dbDetailState) => {

      this.indexCreateSuccessful = dbDetailState.indexCreateSuccessful;
      this.errorMessage = dbDetailState.indexCreateErrorMessage;
      this.persistLoading = dbDetailState.persistLoading;
    });

    

  }

  clearIndexNameValue(){
    this.createIndexDialogForm.patchValue({'indexName': ""});
  }

  clearIndexFieldsValue(){
    this.createIndexDialogForm.patchValue({'indexFields': ""});
  }

  clearDesignDocumentNameValue(){
    this.createIndexDialogForm.patchValue({'designDocumentName': ""});
  }


  openExternalLink(link){
    this.electronService.openExternalLink(link);
  }

  //function used in the template to check if the input is valid JSON
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

  onSubmit(){

    let newDatabaseIndex = new DBIndex();
    
    if(this.indexNameValue && this.indexNameValue !== ""){
      newDatabaseIndex.name = this.indexNameValue;
    };

    if(this.indexFieldsValue && this.indexFieldsValue !== ""){
      newDatabaseIndex.fields = JSON.parse(this.indexFieldsValue);
    };
    
    if(this.designDocumentNameValue && this.designDocumentNameValue !== ""){
      newDatabaseIndex.ddoc = this.designDocumentNameValue;
    };

    this.store.dispatch(DbDetailActions.persistIndex({persistIndexType: "create", indexToCreate: newDatabaseIndex}));

  }

  ngOnDestroy(){
    if(this.dbDetailSub){
      this.dbDetailSub.unsubscribe();
    };
    if(this.createIndexDialogFormSub){
      this.createIndexDialogFormSub.unsubscribe();
    };
  }

}
