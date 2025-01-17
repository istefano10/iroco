/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { IpcService } from '../core/services';
import { PeriodicElement } from '../home/home.component';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-record',
  templateUrl: './record.component.html',
  styleUrls: ['./record.component.scss'],
})
export class RecordComponent implements OnInit, AfterViewInit{
  displayedColumns = ['nombre', 'apellidos', 'fecha de nacimiento','dni','pasaporte','ciudad','direccion','codPostal',
    'telefono','email', 'action'];
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
  public titleRecord=''
  userData = {};
  constructor(
    private route: ActivatedRoute,
    private ipcService: IpcService,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.ipcService.send('clientes:list', {});

    if (this.route.snapshot.queryParams.row) {
      this.recordForm.controls.nif.disable();
      const data = JSON.parse(
        this.route.snapshot.queryParams.row
      ) as PeriodicElement;
      this.titleRecord=data.ref
      this.userData = data;
      this.recordForm.patchValue(data);
      this.dataSource.data = data.pdfs;
      this.crear = false;
    } else {
      this.crear = true;
      this.recordForm.reset();
      this.recordForm.patchValue({
        nombre: '',
        direccion: '',
        email: '',
        telefono: '',
        firma: '',
        nif: '',
      });
    }
  }

  ngAfterViewInit() {
    this.ipcService.on('clientes:listreply', (event: any, arg: PeriodicElement[]) => {
      console.log(arg)
      this.dataSource.data = arg;
      this.dataSource.paginator = this.paginator;
      this.cdRef.detectChanges();
    });
  }

  onSubmit() {
    if (this.crear) {
      this.recordForm.value['fecha'] = new Date();
      this.recordForm.value['pdfs'] = [];
      this.ipcService.send('cliente:new', this.recordForm.value);
      this.ipcService.on('cliente:newreply', (event: any, arg: any) => {
        // console.log('res', arg);
        if (!arg) {
          void this.router.navigate(['/', 'home']);
        }
      });
    } else {
      this.recordForm.value['nif'] = this.userData['nif'];
      this.ipcService.send('cliente:update', this.recordForm.value);
      void this.router.navigate(['/', 'home']);
    }
  }
  addClient(){
    void this.router.navigate(['/', 'add-client']);

  }

  onCancel() {
    void this.router.navigate(['/', 'home']);
  }

  remove(row) {
    // console.log('remove ', row);
    const requestData = {
      nif: row.nif
    };
    this.ipcService.send('cliente:remove', requestData);
    this.ipcService.on(
      'cliente:removereply',
      (event: any, arg: PeriodicElement) => {
        console.log('borrado', arg);
        this.dataSource.data = arg.pdfs;
        this.cdRef.detectChanges();
      }
    );
  }

  view(descripcion) {
    this.ipcService.send('file:view', {
      nif: this.recordForm.value.nif,
      descripcion,
    });
    // this.ipcService.on('fileview:reply', (event: any, arg: PeriodicElement) => {
    //   console.log('viendo', arg);
    // });
  }

  scan() {
    this.IsWait = true;
    this.cdRef.detectChanges();
    if (!this.crear) {
      this.recordForm.value['nif'] = this.userData['nif'];
    }
    this.recordForm.value['fecha'] = new Date();
    this.recordForm.value['pdfs'] = [];
    // console.log(this.ecordForm.value);
    this.ipcService.send('scan:new', this.recordForm.value);
    this.ipcService.on('scan:reply', (event: any, arg: PeriodicElement) => {
      this.IsWait = false;
      // console.log('escaneado', arg);
      this.dataSource.data = arg.pdfs ? arg.pdfs: this.dataSource.data;
      this.cdRef.detectChanges();
    });
  }
}
