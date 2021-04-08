import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromApp from '../../../store/app.reducer';

import { ElectronService } from '../../../core/services/index';
import * as HeaderActions from './store/header.actions';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  // page: string = 'db-connection';
  showDownloadBanner: boolean = false;
  showInstallAndRestartBanner: boolean = false;

  private headerSub: Subscription;

  constructor(private electronService: ElectronService, private store: Store<fromApp.AppState>) { }

  ngOnInit(): void {

    this.headerSub = this.store.select("header").subscribe((headerState) => {

      this.showDownloadBanner = headerState.showDownloadBanner;
      this.showInstallAndRestartBanner = headerState.showInstallAndRestartBanner;

    });

  }

  downloadUpdate(){
    this.electronService.downloadUpdate();
    this.store.dispatch(HeaderActions.setShowDownloadBanner({showDownloadBanner: false}));
  }

  installAndRestart(){
    this.electronService.installUpdateAndRestart();
    this.store.dispatch(HeaderActions.setShowInstallAndRestartBanner({showInstallAndRestartBanner: false}));
  }

  cancelDownloadUpdateBanner(){
    this.store.dispatch(HeaderActions.setShowDownloadBanner({showDownloadBanner: false}));
  }

  cancelInstallAndRestartBanner(){
    this.store.dispatch(HeaderActions.setShowInstallAndRestartBanner({showInstallAndRestartBanner: false}));
  }

  ngOnDestroy(){
    if(this.headerSub){
      this.headerSub.unsubscribe();
    };
  }
}
