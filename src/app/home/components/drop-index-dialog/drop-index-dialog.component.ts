import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import * as fromApp from '../../../store/app.reducer';
import { Subscription } from 'rxjs';
import * as DbDetailActions from '../db-detail/store/db-detail.actions';

@Component({
  selector: 'app-drop-index-dialog',
  templateUrl: './drop-index-dialog.component.html',
  styleUrls: ['./drop-index-dialog.component.scss']
})
export class DropIndexDialogComponent implements OnInit, OnDestroy {

  errorMessage: string;
  indexDeleteSuccessful: boolean;
  persistLoading: boolean;
  private dbDetailSub: Subscription;

  constructor(private store: Store<fromApp.AppState>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {

    this.dbDetailSub = this.store.select("dbDetail").subscribe((dbDetailState) => {

      this.indexDeleteSuccessful = dbDetailState.indexDeleteSuccessful;
      this.errorMessage = dbDetailState.indexCreateErrorMessage;
      this.persistLoading = dbDetailState.persistLoading;
    });

  }

  dropIndex(){
    this.store.dispatch(DbDetailActions.persistIndex({persistIndexType: "delete", indexToDeletePosition: this.data.indexPosition}));
  }
  
  ngOnDestroy(){
    if(this.dbDetailSub){
      this.dbDetailSub.unsubscribe();
    };
  }

}
