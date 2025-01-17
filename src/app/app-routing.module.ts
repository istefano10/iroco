import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './shared/components';

import { HomeRoutingModule } from './home/home-routing.module';
import { RecordModule } from './record/record.module';
import { AddRecordModule } from './addRecord/add-record.module';
import { AddRecordRoutingModule } from './addRecord/add-record-routing.module';
import { AddClientModule } from './add-client/add-client.module';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {}),
    HomeRoutingModule,
    AddRecordModule,
    AddRecordRoutingModule,
    RecordModule,
    AddClientModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
