import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { RecordComponent } from './record.component';

const routes: Routes = [
  {
    path: 'records',
    component: RecordComponent
  },
  {
    path: 'records/:data',
    component: RecordComponent
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecordRoutingModule {}
