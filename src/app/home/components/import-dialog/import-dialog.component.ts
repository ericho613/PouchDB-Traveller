import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ElectronService } from '../../../core/services/index';

import { Store } from '@ngrx/store';
import * as fromApp from '../../../store/app.reducer';
import * as SidenavListActions from '../../components/sidenav-list/store/sidenav-list.actions';

import { 
  FormControl, 
  FormGroup,
  Validators } from '@angular/forms';

@Component({
  selector: 'app-import-dialog',
  templateUrl: './import-dialog.component.html',
  styleUrls: ['./import-dialog.component.scss']
})
export class ImportDialogComponent implements OnInit, OnDestroy {

  fileType: string;
  importDialogForm: FormGroup;
  fileImportPathValue: string;
  importDialogFormSub: Subscription;
  transferInProcess: boolean;
  transferSuccessful: boolean;
  errorMessage: string;
  sidenavListSub: Subscription;
  documentsToBeTransferredCount: string;
  transferCount: string;
  transferPercentage: string;
  delimiter = "COMMA";
  delimiterOptions: Array<any> = [
    "COMMA",
    "SEMI-COLON",
    "COLON"
  ]

  constructor(private electronService: ElectronService, private store: Store<fromApp.AppState>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {

    this.importDialogForm = new FormGroup({
      'fileImportPath': new FormControl("", [Validators.required, this.validatePath])
    });

    this.importDialogFormSub = this.importDialogForm.valueChanges.subscribe(changedValues => {
      this.fileImportPathValue = changedValues.fileImportPath;
    });

    this.sidenavListSub = this.store.select("sidenavList").subscribe((sidenavListState) => {
      
      this.errorMessage = sidenavListState.transferErrorMessage
      this.transferInProcess = sidenavListState.transferInProcess;
      this.transferSuccessful = sidenavListState.transferSuccessful;
      this.documentsToBeTransferredCount = sidenavListState.documentsToBeTransferredCount;
      this.transferCount = sidenavListState.transferCount;
      this.transferPercentage = sidenavListState.transferPercentage;

    });

  }

  getConvertedDelimiterValue(){
    switch(this.delimiter){
      case "COMMA":
        return ',';
      case "SEMI-COLON":
        return ';';
      case "COLON":
        return ':';
    }
  }

  onSubmit(){
    this.store.dispatch(SidenavListActions.clearTransferDetails());
    this.store.dispatch(SidenavListActions.importFile({filePath: this.fileImportPathValue, fileType: this.fileType, delimiter: this.getConvertedDelimiterValue()}));
  }

  openFileBrowse(){
    let filePath = this.electronService.openFileBrowse();
    if(filePath){
      if(filePath.length > 0){
        this.fileImportPathValue = filePath[0];
        this.store.dispatch(SidenavListActions.clearTransferDetails());
        this.importDialogForm.patchValue({'fileImportPath': filePath[0]});
      }
    }
  }

  changeFileType(newFileType){
    this.store.dispatch(SidenavListActions.clearTransferDetails());
    this.fileType = newFileType;
  }

  clearFileImportPathValue(){
    this.importDialogForm.patchValue({'fileImportPath': ""});
  }

  validatePath(control: FormControl): {[s: string]: boolean}{

    let regexPattern = new RegExp(/^(?:[a-z]:)?[\/\\]{0,2}(?:[.\/\\ ](?![.\/\\\n])|[^<>:"|?*.\/\\ \n])+$/gmi);

    if(regexPattern.test(control.value)){
      return null;
    }
    return {'invalidPath': true};
    
  }

  ngOnDestroy(){
    if(this.importDialogFormSub){
      this.importDialogFormSub.unsubscribe();
    }
    if(this.sidenavListSub){
      this.sidenavListSub.unsubscribe();
    }
  }


}
