import { Component, OnInit, Inject } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-favorite-dialog',
  templateUrl: './favorite-dialog.component.html',
  styleUrls: ['./favorite-dialog.component.scss']
})
export class FavoriteDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<FavoriteDialogComponent>,@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
  }

  onRemoveClick(){
    this.data.removeFavorite = true;
    return this.dialogRef.close(this.data);
  }

}
