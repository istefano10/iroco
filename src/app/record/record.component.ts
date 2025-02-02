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
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { IpcService } from '../core/services';
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
    'idCliente',
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
  dataSource = new MatTableDataSource<Client>([]);

  @ViewChild(MatPaginator)
  paginator: MatPaginator;

  // eslint-disable-next-line no-prototype-builtins, @typescript-eslint/no-unsafe-return
  // isExpansionrecordRow = (i: number, row: any) => row.hasOwnProperty('recordRow');
  // expandedElement: any;

  crear = false;
  IsWait = false;
  public titleRecord = '';
  userData = {};
  expData;
  clientData;
  constructor(
    private route: ActivatedRoute,
    private ipcService: IpcService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    if (this.route.snapshot.queryParams.record) {
      this.expData = JSON.parse(
        this.route.snapshot.queryParams.record
      ) as Record;
      this.titleRecord = this.expData.ref;
    }
    if (this.route.snapshot.queryParams.row) {
      this.clientData = JSON.parse(
        this.route.snapshot.queryParams.row
      ) as Client;
    }
    this.ipcService.send('clientes:list', { expId: this.expData.$loki });
  }

  ngAfterViewInit() {
    this.ipcService.on('clientes:listreply', (event: any, arg: Client[]) => {
      this.dataSource.data = arg;

      this.dataSource.paginator = this.paginator;
      this.cdRef.detectChanges();
    });
  }

  addClient() {
    console.log(this.expData);
    this.ngZone.run(() => {
      void this.router.navigate(['/', 'add-client'], {
        queryParams: {
          isEdit: false,
          record: JSON.stringify(this.expData),
        },
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
    this.ipcService.on('cliente:removereply', (event: any, arg: Client[]) => {
      this.dataSource.data = arg;
      this.cdRef.detectChanges();
    });
  }
  edit(isEdit = false, client: Client) {
    const stringClient = JSON.stringify(client);
    this.ngZone.run(() => {
      void this.router.navigate(['/', 'add-client'], {
        queryParams: {
          isEdit,
          stringClient,
          record: JSON.stringify(this.expData),
        },
      });
    });
  }

  contratCancel() {
    if (this.dataSource.data.length > 0) {
      this.expData.contratCancel = true;
    } else {
      return;
    }

    this.ipcService.send('expediente:update', this.expData);

    this.ipcService.send('conycan:new', {
      ...this.dataSource.data[0],
      ref: this.titleRecord,
    });
    this.ipcService.on('conycan:reply', (event: any, arg: any) => {
      console.log(arg);
    });
  }
  contratViaje() {
    if (this.dataSource.data.length > 0) {
      this.expData.contratViaje = true;
    } else {
      return;
    }

    this.ipcService.send('expediente:update', this.expData);

    this.ipcService.send('conviaje:new', {
      ...this.dataSource.data[0],
      ref: this.titleRecord,
      totalcli: this.dataSource.data.length,
    });
    this.ipcService.on('conviaje:reply', (event: any, arg: any) => {
      console.log(arg);
    });
  }

  aerolinea() {
    if (this.dataSource.data.length > 0) {
      this.expData.aerolinea = true;
    } else {
      return;
    }

    this.ipcService.send('expediente:update', this.expData);
    this.ipcService.send('bonoaero:new', {
      ...this.dataSource.data[0],
      ref: this.titleRecord,
      idExp: this.expData.$loki
    });
    this.ipcService.on('bonoaero:reply', (event: any, arg: any) => {
      console.log(arg);
    });
  }

  visado() {
    if (this.dataSource.data.length > 0) {
      this.expData.visado = true;
    } else {
      return;
    }

    this.ipcService.send('expediente:update', this.expData);

    this.ipcService.send('bonovisa:new', {
      ...this.dataSource.data[0],
      ref: this.titleRecord,
      idExp: this.expData.$loki
    });
    this.ipcService.on('bonovisa:reply', (event: any, arg: any) => {
      console.log(arg);
    });
  }

  proforma() {
    if (this.dataSource.data.length > 0) {
      this.expData.proforma = true;
    } else {
      return;
    }
    this.ipcService.send('expediente:update', this.expData);
    this.ipcService.send('proforma:new', {
      ...this.dataSource.data[0],
      ref: this.titleRecord,
      idExp: this.expData.$loki
    });
    this.ipcService.on('proforma:reply', (event: any, arg: any) => {
      console.log(arg);
    });
  }

  seguro() {
    if (this.dataSource.data.length > 0) {
      this.expData.seguro = true;
    } else {
      return;
    }

    this.ipcService.send('expediente:update', this.expData);

    this.ipcService.send('asegurados:new', {
      ...this.dataSource.data,
      ref: this.titleRecord,
    });
    this.ipcService.on('asegurados:reply', (event: any, arg: any) => {
    });
  }
}
