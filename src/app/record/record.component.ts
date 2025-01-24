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
  constructor(
    private route: ActivatedRoute,
    private ipcService: IpcService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    if (this.route.snapshot.queryParams.titleRecord) {
      this.titleRecord = this.route.snapshot.queryParams.titleRecord;
    }
    if (this.route.snapshot.queryParams.row) {
      this.expData = JSON.parse(this.route.snapshot.queryParams.row) as Record;
      this.titleRecord = this.expData.ref;
    }
    this.ipcService.send('clientes:list', {expId: this.expData.$loki});
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
        queryParams: {
          isEdit: false,
          titleRecord: this.titleRecord,
          id: this.expData.$loki,
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
        queryParams: { isEdit, stringClient, titleRecord: this.titleRecord },
      });
    });
  }

  doc() {
    this.ipcService.send('doc:new', {
      ...this.dataSource.data[0],
      ref: this.titleRecord,
    });
    this.ipcService.on('doc:newreply', (event: any, arg: any) => {
      console.log(arg);
    });
  }
}
