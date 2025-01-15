import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AddRecordComponent } from './add-record.component';

const routes: Routes = [
  {
    path: 'addRecord',
    component: AddRecordComponent
  },
  {
    path: 'addRecord/:data',
    component: AddRecordComponent
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AddRecordRoutingModule {}
