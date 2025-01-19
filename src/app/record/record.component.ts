/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { IpcService } from '../core/services';
import { PeriodicElement } from '../home/home.component';
import { MatPaginator } from '@angular/material/paginator';
import { Client } from '../interfaces/client.interface';
import { Record } from '../interfaces/record.interface';

@Component({
  selector: 'app-record',
  templateUrl: './record.component.html',
  styleUrls: ['./record.component.scss'],
})
export class RecordComponent implements OnInit, AfterViewInit {
  displayedColumns = [
    'nombre',
    'apellidos',
    'fecha de nacimiento',
    'dni',
    'pasaporte',
    'direccion',
    'telefono',
    'email',
    'action',
    'remove',
  ];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator)
  paginator: MatPaginator;

  // eslint-disable-next-line no-prototype-builtins, @typescript-eslint/no-unsafe-return
  // isExpansionrecordRow = (i: number, row: any) => row.hasOwnProperty('recordRow');
  // expandedElement: any;

  crear = false;
  IsWait = false;
  recordForm = new FormGroup({
    nif: new FormControl('', Validators.required),
    nombre: new FormControl('', Validators.required),
    apellidos: new FormControl('', Validators.required),
    fechaNac: new FormControl('', Validators.required),
    pasaporte: new FormControl('', Validators.required),
    direccion: new FormControl(''),
    email: new FormControl(''),
    telefono: new FormControl(''),
    firma: new FormControl(''),
    ciudad: new FormControl(''),
    codPostal: new FormControl(''),
  });
  public titleRecord = '';
  userData = {};
  constructor(
    private route: ActivatedRoute,
    private ipcService: IpcService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.ipcService.send('clientes:list', {});
    if (this.route.snapshot.queryParams.titleRecord) {
      this.titleRecord = this.route.snapshot.queryParams.titleRecord;
    }
    if (this.route.snapshot.queryParams.row) {
      const data = JSON.parse(this.route.snapshot.queryParams.row) as Record;
      this.titleRecord = data.ref;
    }
  }

  ngAfterViewInit() {
    this.ipcService.on('clientes:listreply', (event: any, arg: Client[]) => {
      this.dataSource.data = arg;
      this.dataSource.paginator = this.paginator;
      this.cdRef.detectChanges();
    });
  }

  addClient() {
    this.ngZone.run(() => {
      void this.router.navigate(['/', 'add-client'], {
        queryParams: { isEdit: false, titleRecord: this.titleRecord },
      });
    });
  }

  onCancel() {
    this.ngZone.run(() => {
      void this.router.navigate(['/', 'home']);
    });
  }

  remove(row) {
    const requestData = {
      nif: row.nif,
    };
    this.ipcService.send('cliente:remove', requestData);
    this.ipcService.on(
      'cliente:removereply',
      (event: any, arg: PeriodicElement) => {
        // this.dataSource.data = arg.pdfs;
        this.cdRef.detectChanges();
      }
    );
  }
  edit(isEdit = false, client: Client) {
    const stringClient = JSON.stringify(client);
    this.ngZone.run(() => {
      void this.router.navigate(['/', 'add-client'], {
        queryParams: { isEdit, stringClient, titleRecord: this.titleRecord },
      });
    });

  }
}
