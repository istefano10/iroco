import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddRecordRoutingModule } from './add-record-routing.module';

import { AddRecordComponent } from './add-record.component';
import { SharedModule } from '../shared/shared.module';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

@NgModule({
  declarations: [AddRecordComponent],
  imports: [CommonModule, SharedModule, AddRecordRoutingModule, MatInputModule, MatFormFieldModule]
})
export class AddRecordModule {}
