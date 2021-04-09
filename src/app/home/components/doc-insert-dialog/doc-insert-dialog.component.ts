import { Component, OnInit, Inject, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA} from '@angular/material/dialog';
import * as DbDetailActions from '../db-detail/store/db-detail.actions';
import { Store } from '@ngrx/store';
import * as fromApp from '../../../store/app.reducer';
import { Subscription } from 'rxjs';
import beautify from 'json-beautify';

@Component({
  selector: 'app-doc-insert-dialog',
  templateUrl: './doc-insert-dialog.component.html',
  styleUrls: ['./doc-insert-dialog.component.scss']
})
export class DocInsertDialogComponent implements OnInit, OnDestroy {

  @ViewChild('textArea') textArea: ElementRef;
  errorMessage: string;
  documentCreateSuccessful: boolean;
  persistLoading: boolean;
  private dbDetailSub: Subscription;

  constructor(private store: Store<fromApp.AppState>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {

    this.dbDetailSub = this.store.select("dbDetail").subscribe((dbDetailState) => {

      this.documentCreateSuccessful = dbDetailState.documentCreateSuccessful;
      this.errorMessage = dbDetailState.documentCreateErrorMessage;
      this.persistLoading = dbDetailState.persistLoading;
    });

  }

  //function used in the template to check if the input is valid JSON
  checkInputIsValidJSON(textareaData){
    this.data.newDocument = textareaData;
    if(textareaData === "" || textareaData == null){
      this.errorMessage = "";
    }else{
      try {
        JSON.parse(textareaData);
        this.errorMessage = "";
        this.documentCreateSuccessful = false;
        if(isNaN(textareaData) === false){
          throw new Error();
        } 
        
      } catch (error) {
        this.errorMessage = "Insert not permitted while document contains errors.";
      }
    }
  }

  //function used in the template to insert the document in the
  // database
  insertDocument(){

    try {
      let reconstructedJSObject = JSON.parse(this.data.newDocument);

      if(Array.isArray(reconstructedJSObject)){

        let modifiedDocumentsArray = [];

        reconstructedJSObject.forEach(item => {
          modifiedDocumentsArray.push(item);
        })

        this.store.dispatch(DbDetailActions.persist({persistType: "create", documentToCreate: modifiedDocumentsArray}));
        
      }else{

        this.store.dispatch(DbDetailActions.persist({persistType: "create", documentToCreate: reconstructedJSObject}));
        
      }

      this.beautifyJson();

    } catch (error) {
      this.errorMessage = "Invalid JSON.";
    }
    
  }

  beautifyJson(){
    try {
      this.textArea.nativeElement.value = beautify(JSON.parse(this.data.newDocument), null, 2, 50)
    } catch (error) {
      this.errorMessage = "Invalid JSON.";
    }
  }

  ngOnDestroy(){
    if(this.dbDetailSub){
      this.dbDetailSub.unsubscribe();
    };
  }

}
