import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';

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

  showDownloadBanner: boolean = false;
  showInstallAndRestartBanner: boolean = false;
  showDownloadProgressBanner: boolean = false;
  progressTotal: string;
  progressTransferred: string;
  progressPercent: string;


  private headerSub: Subscription;

  constructor(private electronService: ElectronService, private store: Store<fromApp.AppState>, private changeRef: ChangeDetectorRef) { }

  ngOnInit(): void {

    this.headerSub = this.store.select("header").subscribe((headerState) => {

      this.showDownloadBanner = headerState.showDownloadBanner;
      this.showInstallAndRestartBanner = headerState.showInstallAndRestartBanner;
      if(this.showInstallAndRestartBanner){
        this.showDownloadProgressBanner = false;
      };
      this.progressTotal = this.formatBytes(headerState.progressTotal);
      this.progressTransferred = this.formatBytes(headerState.progressTransferred);
      this.progressPercent = Math.round(headerState.progressPercent) + "";

      this.changeRef.detectChanges();
    });

  }

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
  
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
    const i = Math.floor(Math.log(bytes) / Math.log(k));
  
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  downloadUpdate(){
    this.showDownloadProgressBanner = true;
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
