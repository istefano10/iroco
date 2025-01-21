/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { IpcService } from '../core/services';
import { Client } from '../interfaces/client.interface';

@Component({
  selector: 'app-add-client',
  templateUrl: './add-client.component.html',
  styleUrls: ['./add-client.component.scss'],
})
export class AddClientComponent implements OnInit {
  displayedColumns = [
    'nombre',
    'apellidos',
    'fecha de nacimiento',
    'dni',
    'pasaporte',
    'ciudad',
    'direccion',
    'codPostal',
    'telefono',
    'email',
    'action',
  ];
  dataSource = new MatTableDataSource<Client>([]);

  // eslint-disable-next-line no-prototype-builtins, @typescript-eslint/no-unsafe-return
  // isExpansionrecordRow = (i: number, row: any) => row.hasOwnProperty('recordRow');
  // expandedElement: any;

  isEdit = 'false';
  nombre = '';
  apellidos = '';
  crear = false;
  IsWait = false;
  private titleRecord = '';
  recordForm = new FormGroup({
    nif: new FormControl('', Validators.required),
    nombre: new FormControl('', Validators.required),
    apellidos: new FormControl('', Validators.required),
    fechaNac: new FormControl(new Date(), Validators.required),
    pasaporte: new FormControl('', Validators.required),
    direccion: new FormControl(''),
    email: new FormControl(''),
    telefono: new FormControl(''),
    firma: new FormControl(''),
    ciudad: new FormControl(''),
    codPostal: new FormControl(''),
    expId: new FormControl(new Number()),
  });
  userData = {};
  expId;
  constructor(
    private route: ActivatedRoute,
    private ipcService: IpcService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.expId = Number(this.route.snapshot.queryParams.id);
    this.isEdit = this.route.snapshot.queryParams.isEdit;
    if (this.isEdit === 'true') {
      this.nombre = this.route.snapshot.queryParams.nombre;
      this.apellidos = this.route.snapshot.queryParams.apellidos;
    }
    this.titleRecord = this.route.snapshot.queryParams.titleRecord;
    // if (this.route.snapshot.queryParams.row) {
    if (this.isEdit === 'true') {
      this.recordForm.controls.nif.disable();

      const data = JSON.parse(
        this.route.snapshot.queryParams.stringClient
      ) as Client;
      this.userData = data;
      this.recordForm.patchValue(data);
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
    const client = JSON.stringify({
      ...this.recordForm.value,
      ref: this.titleRecord,
      $loki: this.recordForm.value.expId || this.expId,
    });
    if (this.crear) {
      this.recordForm.value['expId'] = this.expId;
      this.recordForm.value['fecha'] = new Date();
      this.ipcService.send('cliente:new', this.recordForm.value);
      this.ipcService.on('newCliente:reply', (event: any, arg: any) => {
        if (!arg.error) {
          this.ngZone.run(() => {
            void this.router.navigate(['/', 'records'], {
              queryParams: { row: client },
            });
          });
        }
      });
    } else {
      this.recordForm.value['nif'] = this.userData['nif'];
      this.ipcService.send('cliente:update', this.recordForm.value);
      this.ngZone.run(() => {
        void this.router.navigate(['/', 'records'], {
          queryParams: { row: client },
        });
      });
    }
  }

  onCancel() {
    const client = JSON.stringify({
      ...this.recordForm.value,
      ref: this.titleRecord,
      $loki: this.expId,
    });
    this.ngZone.run(() => {
      void this.router.navigate(['/', 'records'], {
        queryParams: { row: client },
      });
    });
  }
}
