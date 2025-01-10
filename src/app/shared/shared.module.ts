import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";

import { TranslateModule } from '@ngx-translate/core';

import { PageNotFoundComponent } from './components/';
import { WebviewDirective } from './directives/';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import { CdkTableModule } from '@angular/cdk/table';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTabsModule} from '@angular/material/tabs';




@NgModule({
  declarations: [PageNotFoundComponent, WebviewDirective],
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    CdkTableModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    
  ],
  exports: [
    TranslateModule,
    WebviewDirective,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatPaginatorModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    CdkTableModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatTabsModule,
  ],
})
export class SharedModule {}
