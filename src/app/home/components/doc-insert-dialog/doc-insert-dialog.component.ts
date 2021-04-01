import { Component, OnInit, Inject, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA} from '@angular/material/dialog';
import * as DbDetailActions from '../db-detail/store/db-detail.actions';
import { Store } from '@ngrx/store';
import * as fromApp from '../../../store/app.reducer';
import { Subscription } from 'rxjs';
// import { v4 as uuidv4 } from 'uuid';
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
          // let itemToPersist;
          // if(!item._id){
          //   itemToPersist = {_id: uuidv4(), ...item};
          // }else{
          //   itemToPersist = item;
          // }
          modifiedDocumentsArray.push(item);
        })

        this.store.dispatch(DbDetailActions.persist({persistType: "create", documentToCreate: modifiedDocumentsArray}));
        
      }else{
        // let itemToPersist;
        // if(!reconstructedJSObject._id){
        //   itemToPersist = {_id: uuidv4(), ...reconstructedJSObject};
        // }else{
        //   itemToPersist = reconstructedJSObject;
        // }

        this.store.dispatch(DbDetailActions.persist({persistType: "create", documentToCreate: reconstructedJSObject}));
        
      }

      this.beautifyJson();

    } catch (error) {
      this.errorMessage = "Invalid JSON.";
    }
    
  }

  beautifyJson(){
    // this.data.newDocument = JSON.parse(beautify(this.data.newDocument, null, 2, 80));
    try {
      this.textArea.nativeElement.value = beautify(JSON.parse(this.data.newDocument), null, 2, 50)
    } catch (error) {
      this.errorMessage = "Invalid JSON.";
    }
    
    // .replace(/ /g, '&nbsp;') 
    // .replace(/\n/g, '<br/>');
    console.log(this.data.newDocument);
  }

  ngOnDestroy(){
    if(this.dbDetailSub){
      this.dbDetailSub.unsubscribe();
    };
  }

}
