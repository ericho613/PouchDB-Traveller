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
  selector: 'app-export-dialog',
  templateUrl: './export-dialog.component.html',
  styleUrls: ['./export-dialog.component.scss']
})
export class ExportDialogComponent implements OnInit, OnDestroy {

  
  fileType: string;
  exportDialogForm: FormGroup;
  fileExportPathValue: string;
  exportDialogFormSub: Subscription;

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

    this.exportDialogForm = new FormGroup({
      'fileExportPath': new FormControl("", [Validators.required, this.validatePath])
    });

    this.exportDialogFormSub = this.exportDialogForm.valueChanges.subscribe(changedValues => {
      this.fileExportPathValue = changedValues.fileExportPath;
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
    this.store.dispatch(SidenavListActions.exportFile({filePath: this.fileExportPathValue, fileType: this.fileType, delimiter: this.getConvertedDelimiterValue()}));
  }

  openFileSaveBrowse(){
    let filePath = this.electronService.openFileSaveBrowse(this.fileType);
    // console.log(filePath);
    if(filePath){
      this.fileExportPathValue = filePath;
      this.store.dispatch(SidenavListActions.clearTransferDetails());
      this.exportDialogForm.patchValue({'fileExportPath': filePath});
    }
  }

  changeFileType(newFileType){
    this.store.dispatch(SidenavListActions.clearTransferDetails());
    this.fileType = newFileType;
  }

  clearFileExportPathValue(){
    this.exportDialogForm.patchValue({'fileExportPath': ""});
  }

  validatePath(control: FormControl): {[s: string]: boolean}{

    let regexPattern = new RegExp(/^(?:[a-z]:)?[\/\\]{0,2}(?:[.\/\\ ](?![.\/\\\n])|[^<>:"|?*.\/\\ \n])+$/gmi);

    if(regexPattern.test(control.value)){
      return null;
    }
    return {'invalidPath': true};
    
  }

  ngOnDestroy(){
    if(this.exportDialogFormSub){
      this.exportDialogFormSub.unsubscribe();
    };
    if(this.sidenavListSub){
      this.sidenavListSub.unsubscribe();
    };
  }

}
