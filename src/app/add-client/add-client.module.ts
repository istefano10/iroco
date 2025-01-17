import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RecordRoutingModule } from './add-client-routing.module';

import { AddClientComponent } from './add-client.component';
import { SharedModule } from '../shared/shared.module';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

@NgModule({
  declarations: [AddClientComponent],
  imports: [CommonModule, SharedModule, RecordRoutingModule, MatInputModule, MatFormFieldModule]
})
export class AddClientModule {}
