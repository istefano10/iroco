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


  private readonly _currentYear = new Date().getFullYear();
  readonly minDate = new Date(this._currentYear - 20, 0, 1);
  readonly maxDate = new Date(this._currentYear + 1, 11, 31);

  isEdit = 'false';
  nombre = '';
  apellidos = '';
  crear = false;
  IsWait = false;
  private titleRecord = '';
  addClientForm = new FormGroup({
    nif: new FormControl('', Validators.required),
    nombre: new FormControl('', Validators.required),
    apellidos: new FormControl('', Validators.required),
    fechaNac: new FormControl(new Date(), Validators.required),
    pasaporte: new FormControl('', Validators.required),
    direccion: new FormControl(''),
    email: new FormControl('',Validators.required),
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
      this.addClientForm.controls.nif.disable();

      const data = JSON.parse(
        this.route.snapshot.queryParams.stringClient
      ) as Client;
      this.userData = data;
      this.addClientForm.patchValue(data);
      this.crear = false;
    } else {
      this.crear = true;
      this.addClientForm.reset();
      this.addClientForm.patchValue({
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
    if(!this.addClientForm.valid){
      this.addClientForm.markAllAsTouched()
      return

    }
      const client = JSON.stringify({
      ...this.addClientForm.value,
      ref: this.titleRecord,
      $loki: this.addClientForm.value.expId || this.expId,
    });
    if (this.crear) {
      this.addClientForm.value['expId'] = this.expId;
      this.addClientForm.value['fecha'] = new Date();
      this.ipcService.send('cliente:new', this.addClientForm.value);
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
      this.addClientForm.value['nif'] = this.userData['nif'];
      this.ipcService.send('cliente:update', this.addClientForm.value);
      this.ngZone.run(() => {
        void this.router.navigate(['/', 'records'], {
          queryParams: { row: client },
        });
      });
    }
  }

  onCancel() {
    const client = JSON.stringify({
      ...this.addClientForm.value,
      ref: this.titleRecord,
      $loki: this.addClientForm.value.expId || this.expId,
    });
    this.ngZone.run(() => {
      void this.router.navigate(['/', 'records'], {
        queryParams: { row: client },
      });
    });
  }
}
