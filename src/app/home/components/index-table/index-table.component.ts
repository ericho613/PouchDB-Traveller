import { 
  Component, 
  OnInit, 
  ViewChild,
  AfterViewInit,
  OnDestroy
 } from '@angular/core';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import { DBIndex } from '../../../shared/models';
import { DropIndexDialogComponent } from '../drop-index-dialog/drop-index-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromApp from '../../../store/app.reducer';
import * as DbDetailActions from '../db-detail/store/db-detail.actions';


@Component({
  selector: 'app-index-table',
  templateUrl: './index-table.component.html',
  styleUrls: ['./index-table.component.scss']
})
export class IndexTableComponent implements OnInit, AfterViewInit, OnDestroy {

  displayedColumns = ['name', 'fields', 'designDocument', 'type', 'drop'];
  tableDataSource = new MatTableDataSource<DBIndex>();
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  dbDetailSub: Subscription;

  constructor(private store: Store<fromApp.AppState>, private dialog: MatDialog) { }

  ngOnInit(): void {

    this.dbDetailSub = this.store.select("dbDetail").subscribe((dbDetailState) => {
      this.tableDataSource.data = dbDetailState.databaseIndexes;
    });

  }

  ngAfterViewInit(){
    this.tableDataSource.sort = this.sort;
    this.tableDataSource.paginator = this.paginator;
  }

  openDropIndexDialog(indexName, indexPosition) {
    const dialogRef = this.dialog.open(DropIndexDialogComponent,
      {
        disableClose: true,
        // height: '500px',
        // width: '400px',
        data: {
          indexName: indexName,
          indexPosition: indexPosition
        }
      }
    );

    dialogRef.afterClosed().subscribe(result => {

      this.store.dispatch(DbDetailActions.clearPersistIndexDetails({persistIndexType:"delete"}));

    });

  }

  ngOnDestroy(){
    if(this.dbDetailSub){
      this.dbDetailSub.unsubscribe();
    };
  }

}
