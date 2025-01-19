/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { IpcService } from '../core/services';
import { Client } from '../interfaces/client.interface';
import { Record } from '../interfaces/record.interface';

@Component({
  selector: 'app-add-record',
  templateUrl: './add-record.component.html',
  styleUrls: ['./add-record.component.scss'],
})
export class AddRecordComponent implements OnInit {
  displayedColumns = ['seqNo', 'descripcion', 'fecha', 'action'];
  dataSource = new MatTableDataSource<any>([]);
  public isEdit = 'false';

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
    private cdRef: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.isEdit = this.route.snapshot.queryParams.isEdit;
    if (this.route.snapshot.queryParams.recordString) {
      const data = JSON.parse(
        this.route.snapshot.queryParams.recordString
      ) as Record;
      this.addRecordForm.patchValue(data);
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
        if (!arg) {
          this.ngZone.run(() => {
            void this.router.navigate(['/', 'home']);
          });
        }
      });
    } else {
      this.addRecordForm.value['nif'] = this.userData['nif'];
      this.ipcService.send('expediente:update', this.addRecordForm.value);
      this.ngZone.run(() => {
        void this.router.navigate(['/', 'home']);
      });
    }
  }

  onCancel() {
    this.ngZone.run(() => {
      void this.router.navigate(['/', 'home']);
    });
  }
}
