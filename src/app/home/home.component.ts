/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { SelectionModel } from '@angular/cdk/collections';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
} from '@angular/core';
import { AfterViewInit, ViewChild,ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { IpcService } from '../core/services';

@Component({
  encapsulation: ViewEncapsulation.None
,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit {
  home = true;

  // displayedColumns: string[] = [
  //   'select',
  //   'nombre',
  //   'nif',
  //   'direccion',
  //   'telefono',
  //   'movil',
  //   'fecha',
  // ];
  displayedColumns: string[] = [
    'select',
    'idRef',
    'fechaCre',
    'idGrupo',

  ];
  dataSource = new MatTableDataSource<PeriodicElement>([]);
  clickedRows = new Set<PeriodicElement>();
  @ViewChild('filter') filter: ElementRef;

  @ViewChild(MatPaginator)
  paginator: MatPaginator;
  initialSelection = [];
  allowMultiSelect = true;
  selection = new SelectionModel<PeriodicElement>(
    this.allowMultiSelect,
    this.initialSelection
  );
  constructor(
    private router: Router,
    private ipcService: IpcService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    this.ipcService.on('list:reply', (event: any, arg: PeriodicElement[]) => {
      this.dataSource.data = arg;
      this.dataSource.paginator = this.paginator;
      this.cdRef.detectChanges();
    });
  }
  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.ipcService.send('product:list', {});
    // console.log('HomeComponent INIT');
  }

  onNew() {
    void this.router.navigate(['/', 'addRecord']);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  remove() {
    this.selection.selected.forEach((item) => {
      this.ipcService.send('product:remove', { nif: item.nif });
    });
    this.ipcService.on('remove:reply', (event: any, arg: PeriodicElement[]) => {
      this.dataSource.data = arg;
      this.dataSource.paginator = this.paginator;
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
  json: any = JSON;
}

export interface PeriodicElement {
  nombre: string;
  nif: string;
  direccion: string;
  telefono: string;
  movil: string;
  fecha: string;
  area: string;
  $loki: number;
  pdfs: [Pdf];
}

export interface Pdf {
  descripcion: string;
  fecha: string;
}
