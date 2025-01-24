/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { SelectionModel } from '@angular/cdk/collections';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnInit,
} from '@angular/core';
import { AfterViewInit, ViewChild,ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { IpcService } from '../core/services';
import { Record } from '../interfaces/record.interface';
import { Budget } from '../interfaces/budget.interface';

@Component({
  encapsulation: ViewEncapsulation.None
,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit {
  home = true;

  displayedColumns: string[] = [
    'select',
    'id',
    'ref',
    'fecha',
    'fechaSalida',
    'idGrupo',
    'edit'
    ];

  displayedColumnsPres: string[] = [
    'select',
    'id',
    'ref',
    'fecha',
    'edit'
  ];

  dataSource = new MatTableDataSource<Record>([]);
  dataSourceBudget = new MatTableDataSource<Budget>([]);
  clickedRows = new Set<Record>();
  @ViewChild('filter') filter: ElementRef;

  @ViewChild(MatPaginator)
  paginator: MatPaginator;
  initialSelection = [];
  allowMultiSelect = true;
  selection = new SelectionModel<Record>(
    this.allowMultiSelect,
    this.initialSelection
  );
  selectionBudget = new SelectionModel<Record>(
    this.allowMultiSelect,
    this.initialSelection
  );
  constructor(
    private router: Router,
    private ipcService: IpcService,
    private cdRef: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngAfterViewInit() {
    this.ipcService.on('expedientes:listreply', (event: any, arg: Record[]) => {
      this.dataSource.data = arg;
      this.dataSource.paginator = this.paginator;
      this.cdRef.detectChanges();
    });
    this.ipcService.on('presupuestos:listreply', (event: any, arg: Budget[]) => {

      this.dataSourceBudget.data = arg;
      this.dataSourceBudget.paginator = this.paginator;
      this.cdRef.detectChanges();
    });  }
  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.ipcService.send('expedientes:list', {});
    this.ipcService.send('presupuestos:list', {});
  }

  onNew(isEdit=false,record?: Record) {
    const recordString=JSON.stringify(record)
    this.ngZone.run(() => {
      void this.router.navigate(['/', 'addRecord'],{queryParams:{isEdit,recordString}});
    });
  }
  onNewBudget(isEdit=false,budget?: Record) {
    const budgetString=JSON.stringify(budget)
    this.ngZone.run(() => {
      void this.router.navigate(['/', 'add-budget'],{queryParams:{isEdit,budgetString}});
    });
  }
  clientsList(row:any){
    const client=JSON.stringify(row)
    this.ngZone.run(() => {
      void this.router.navigate(['/', 'records'],{queryParams:{row:client}});
    });
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  remove() {
    this.selection.selected.forEach((item) => {
      this.ipcService.send('expediente:remove', { $loki: item.$loki });
    });
    this.ipcService.on('expediente:removereply', (event: any, arg: Record[]) => {
      this.dataSource.data = arg;
      this.dataSource.paginator = this.paginator;
      this.cdRef.detectChanges();
    });
  }
  removeBudget() {
    this.selection.selected.forEach((item) => {
      this.ipcService.send('presupuesto:remove', { ref: item.ref });
    });
    this.ipcService.on('presupuesto:removereply', (event: any, arg: Budget[]) => {
      this.dataSourceBudget.data = arg;
      this.dataSourceBudget.paginator = this.paginator;
      this.cdRef.detectChanges();
    });
  }


  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected == numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  toggleAllRowsBudget() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selectionBudget.select(row));
  }
  json: any = JSON;
}
