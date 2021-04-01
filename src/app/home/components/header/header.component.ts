import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  // page: string = 'db-connection';
  showUpdateBanner: boolean = false;

  constructor() { }

  ngOnInit(): void {

  }

  restart(){}

}
