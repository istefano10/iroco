/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { IpcService } from '../core/services';
import { PeriodicElement } from '../home/home.component';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit {
  displayedColumns = ['seqNo', 'descripcion', 'fecha', 'action'];
  dataSource = new MatTableDataSource<any>([]);

  // eslint-disable-next-line no-prototype-builtins, @typescript-eslint/no-unsafe-return
  // isExpansionDetailRow = (i: number, row: any) => row.hasOwnProperty('detailRow');
  // expandedElement: any;

  crear = false;
  IsWait = false;
  detailForm = new FormGroup({
    nif: new FormControl('', Validators.required),
    nombre: new FormControl('', Validators.required),
    direccion: new FormControl(''),
    movil: new FormControl(''),
    telefono: new FormControl(''),
    area: new FormControl(''),
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
      this.detailForm.controls.nif.disable();
      const data = JSON.parse(
        this.route.snapshot.queryParams.row
      ) as PeriodicElement;
      // console.log(data);
      this.userData = data;
      this.detailForm.patchValue(data);
      this.dataSource.data = data.pdfs;
      this.crear = false;
    } else {
      this.crear = true;
      this.detailForm.reset();
      this.detailForm.patchValue({
        nombre: '',
        direccion: '',
        movil: '',
        telefono: '',
        area: '',
        nif: '',
      });
    }
  }

  onSubmit() {
    if (this.crear) {
      this.detailForm.value['fecha'] = new Date();
      this.detailForm.value['pdfs'] = [];
      this.ipcService.send('product:new', this.detailForm.value);
      this.ipcService.on('new:reply', (event: any, arg: any) => {
        // console.log('res', arg);
        if (!arg) {
          void this.router.navigate(['/', 'home']);
        }
      });
    } else {
      this.detailForm.value['nif'] = this.userData['nif'];
      this.ipcService.send('product:update', this.detailForm.value);
      void this.router.navigate(['/', 'home']);
    }
  }

  onCancel() {
    void this.router.navigate(['/', 'home']);
  }

  remove(row) {
    // console.log('remove ', row);
    const requestData = {
      nif: this.crear ? this.detailForm.value.nif : this.userData['nif'],
      descripcion: row.descripcion,
    };
    this.ipcService.send('file:remove', requestData);
    this.ipcService.on(
      'fileremove:reply',
      (event: any, arg: PeriodicElement) => {
        // console.log('borrado', arg);
        this.dataSource.data = arg.pdfs;
        this.cdRef.detectChanges();
      }
    );
  }

  view(descripcion) {
    this.ipcService.send('file:view', {
      nif: this.detailForm.value.nif,
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
      this.detailForm.value['nif'] = this.userData['nif'];
    }
    this.detailForm.value['fecha'] = new Date();
    this.detailForm.value['pdfs'] = [];
    // console.log(this.detailForm.value);
    this.ipcService.send('scan:new', this.detailForm.value);
    this.ipcService.on('scan:reply', (event: any, arg: PeriodicElement) => {
      this.IsWait = false;
      // console.log('escaneado', arg);
      this.dataSource.data = arg.pdfs ? arg.pdfs: this.dataSource.data;
      this.cdRef.detectChanges();
    });
  }
}
