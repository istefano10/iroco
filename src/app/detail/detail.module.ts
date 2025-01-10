import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DetailRoutingModule } from './detail-routing.module';

import { DetailComponent } from './detail.component';
import { SharedModule } from '../shared/shared.module';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

@NgModule({
  declarations: [DetailComponent],
  imports: [CommonModule, SharedModule, DetailRoutingModule, MatInputModule, MatFormFieldModule]
})
export class DetailModule {}
