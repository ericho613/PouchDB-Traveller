import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import { ElectronService } from '../core/services/electron/electron.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  private dbConnectionStoreSub: Subscription;
  loadingDb: boolean;

  private dbDetailStoreSub: Subscription;
  databaseInfoLoading: boolean;
  databaseResultsLoading: boolean;
  databaseIndexesLoading: boolean;

  private sidenavListSub: Subscription;
  cryptographySettingsLoading: boolean;
  
  constructor(private electronService: ElectronService, private store: Store<fromApp.AppState>, private router: Router) { 
    
  }

  ngOnInit(): void {

    this.electronService.checkForUpdates();

    this.dbConnectionStoreSub = this.store.select("dbConnection").subscribe((dbConnectionState) => {

      this.loadingDb = dbConnectionState.loading;
      // console.log( this.loadingDb);
    });

    this.dbDetailStoreSub = this.store.select("dbDetail").subscribe((dbDetailState) => {

      this.databaseInfoLoading = dbDetailState.databaseInfoLoading;
      this.databaseResultsLoading = dbDetailState.databaseResultsLoading;
      this.databaseIndexesLoading = dbDetailState.databaseIndexesLoading;

      // console.log( this.databaseInfoLoading);
      // console.log( this.databaseResultsLoading);
      // console.log( this.databaseIndexesLoading);

    });

    this.sidenavListSub = this.store.select("sidenavList").subscribe((sidenavListState) => {
      this.cryptographySettingsLoading = sidenavListState.cryptographySettingsLoading;

    });

   }

  ngOnDestroy(){
    if(this.dbConnectionStoreSub){
      this.dbConnectionStoreSub.unsubscribe();
    }
    if(this.dbDetailStoreSub){
      this.dbDetailStoreSub.unsubscribe();
    }
    if(this.sidenavListSub){
      this.sidenavListSub.unsubscribe();
    }

  }

}
