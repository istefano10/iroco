/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { IpcService } from '../core/services';
import { PeriodicElement } from '../home/home.component';

@Component({
  selector: 'app-add-record',
  templateUrl: './add-record.component.html',
  styleUrls: ['./add-record.component.scss'],
})
export class AddRecordComponent implements OnInit {
  displayedColumns = ['seqNo', 'descripcion', 'fecha', 'action'];
  dataSource = new MatTableDataSource<any>([]);

  // eslint-disable-next-line no-prototype-builtins, @typescript-eslint/no-unsafe-return
  // isExpansionDetailRow = (i: number, row: any) => row.hasOwnProperty('detailRow');
  // expandedElement: any;

  crear = false;
  IsWait = false;
  addRecordForm = new FormGroup({
    ref: new FormControl('', Validators.required),
    idGrupo: new FormControl(''),
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
      // this.addRecordForm.controls.nif.disable();
      const data = JSON.parse(
        this.route.snapshot.queryParams.row
      ) as PeriodicElement;
      // console.log(data);
      this.userData = data;
      // this.addRecordForm.patchValue(data);
      this.dataSource.data = data.pdfs;
      this.crear = false;
    } else {
      this.crear = true;
      this.addRecordForm.reset();
      this.addRecordForm.patchValue({
        ref: '',
        idGrupo: '',

      });
    }
  }

  onSubmit() {
    if (this.crear) {
      this.addRecordForm.value['fecha'] = new Date();
      this.ipcService.send('expediente:new', this.addRecordForm.value);
      this.ipcService.on('newExpediente:reply', (event: any, arg: any) => {
        // console.log('res', arg);
        if (!arg) {
          void this.router.navigate(['/', 'home']);
        }
      });
    } else {
      this.addRecordForm.value['nif'] = this.userData['nif'];
      this.ipcService.send('expediente:update', this.addRecordForm.value);
      void this.router.navigate(['/', 'home']);
    }
  }

  onCancel() {
    void this.router.navigate(['/', 'home']);
  }

  remove(row) {
    // console.log('remove ', row);
    const requestData = {
      // nif: this.crear ? this.addRecordForm.value.nif : this.userData['nif'],
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
      // nif: this.addRecordForm.value.nif,
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
      this.addRecordForm.value['nif'] = this.userData['nif'];
    }
    this.addRecordForm.value['fecha'] = new Date();
    this.addRecordForm.value['pdfs'] = [];
    // console.log(this.addRecordForm.value);
    this.ipcService.send('scan:new', this.addRecordForm.value);
    this.ipcService.on('scan:reply', (event: any, arg: PeriodicElement) => {
      this.IsWait = false;
      // console.log('escaneado', arg);
      this.dataSource.data = arg.pdfs ? arg.pdfs: this.dataSource.data;
      this.cdRef.detectChanges();
    });
  }
}
