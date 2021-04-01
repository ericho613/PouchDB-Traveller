import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { DbConnectionComponent } from './components/db-connection/db-connection.component';
import { DbDetailComponent } from './components/db-detail/db-detail.component';
import { DbDetailGuard } from './components/db-detail/db-detail.guard';

const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
    children: [
      {
        path: '',
        component: DbConnectionComponent
      },
      {
        path: 'connection',
        component: DbConnectionComponent
      },
      {
        path: 'detail',
        component: DbDetailComponent,
        canActivate: [DbDetailGuard]
      }
    ]
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule {}
