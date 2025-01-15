import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RecordRoutingModule } from './record-routing.module';

import { RecordComponent } from './record.component';
import { SharedModule } from '../shared/shared.module';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

@NgModule({
  declarations: [RecordComponent],
  imports: [CommonModule, SharedModule, RecordRoutingModule, MatInputModule, MatFormFieldModule]
})
export class RecordModule {}
