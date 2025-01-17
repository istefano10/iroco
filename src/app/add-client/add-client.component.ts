/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { IpcService } from '../core/services';
import { PeriodicElement } from '../home/home.component';

@Component({
  selector: 'app-add-client',
  templateUrl: './add-client.component.html',
  styleUrls: ['./add-client.component.scss'],
})
export class AddClientComponent implements OnInit {
  displayedColumns = ['nombre', 'apellidos', 'fecha de nacimiento','dni','pasaporte','ciudad','direccion','codPostal',
    'telefono','email', 'action'];
  dataSource = new MatTableDataSource<any>([]);

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
  userData = {};
  constructor(
    private route: ActivatedRoute,
    private ipcService: IpcService,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // console.log(this.route.snapshot.queryParams.row);
    if (this.route.snapshot.queryParams.row) {
      this.recordForm.controls.nif.disable();
      const data = JSON.parse(
        this.route.snapshot.queryParams.row
      ) as PeriodicElement;
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

  onSubmit() {
    if (this.crear) {
      this.recordForm.value['fecha'] = new Date();
      this.ipcService.send('cliente:new', this.recordForm.value);
      this.ipcService.on('newCliente:reply', (event: any, arg: any) => {
        if (!arg) {
          void this.router.navigate(['/', 'records']);
        }
      });
    } else {
      this.recordForm.value['nif'] = this.userData['nif'];
      this.ipcService.send('cliente:update', this.recordForm.value);
      void this.router.navigate(['/', 'records']);
    }
  }

  onCancel() {
    void this.router.navigate(['/', 'records']);
  }

  remove(row) {
    console.log('remove ', row);
    const requestData = {
      nif: this.crear ? this.recordForm.value.nif : this.userData['nif'],
      descripcion: row.descripcion,
    };
    this.ipcService.send('cliente:remove', requestData);
    this.ipcService.on(
      'cliente:removereplyxx',
      (event: any, arg: PeriodicElement) => {
        // console.log('borrado', arg);
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
