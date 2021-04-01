import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-error-alert-dialog',
  templateUrl: './error-alert-dialog.component.html',
  styleUrls: ['./error-alert-dialog.component.scss']
})
export class ErrorAlertDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
  }

}
