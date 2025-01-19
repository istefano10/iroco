import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddBudgetRoutingModule } from './add-budget-routing.module';

import { AddBudgetComponent } from './add-budget.component';
import { SharedModule } from '../shared/shared.module';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

@NgModule({
  declarations: [AddBudgetComponent],
  imports: [CommonModule, SharedModule, AddBudgetRoutingModule, MatInputModule, MatFormFieldModule]
})
export class AddBudgetModule {}
