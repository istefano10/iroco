import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AddBudgetComponent } from './add-budget.component';

const routes: Routes = [
  {
    path: 'add-budget',
    component: AddBudgetComponent
  },
  {
    path: 'add-budget/:data',
    component: AddBudgetComponent
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AddBudgetRoutingModule {}
