import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AddClientComponent } from './add-client.component';

const routes: Routes = [
  {
    path: 'add-client',
    component: AddClientComponent
  },
  {
    path: 'add-client/:data',
    component: AddClientComponent
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecordRoutingModule {}
