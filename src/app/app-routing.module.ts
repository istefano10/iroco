import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './shared/components';

import { HomeRoutingModule } from './home/home-routing.module';
import { RecordModule } from './record/record.module';
import { AddRecordModule } from './add-record/add-record.module';
import { AddRecordRoutingModule } from './add-record/add-record-routing.module';
import { AddClientModule } from './add-client/add-client.module';
import { AddBudgetRoutingModule } from './add-budget/add-budget-routing.module';

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
    AddClientModule,
    AddBudgetRoutingModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
