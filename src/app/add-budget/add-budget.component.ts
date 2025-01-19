/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { IpcService } from '../core/services';
import { Record } from '../interfaces/record.interface';
import { Budget } from '../interfaces/budget.interface';

@Component({
  selector: 'app-add-record',
  templateUrl: './add-budget.component.html',
  styleUrls: ['./add-budget.component.scss'],
})
export class AddBudgetComponent implements OnInit {
  displayedColumns = ['seqNo', 'descripcion', 'fecha', 'action'];
  dataSource = new MatTableDataSource<any>([]);
  public isEdit = 'false';

  // eslint-disable-next-line no-prototype-builtins, @typescript-eslint/no-unsafe-return
  // isExpansionDetailRow = (i: number, row: any) => row.hasOwnProperty('detailRow');
  // expandedElement: any;

  crear = false;
  IsWait = false;
  addBudgetForm = new FormGroup({
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
    if (this.route.snapshot.queryParams.budgetString) {
      const data = JSON.parse(
        this.route.snapshot.queryParams.budgetString
      ) as Budget;
      console.log(data)
      this.addBudgetForm.patchValue(data);
      this.crear = false;
    } else {
      this.crear = true;
      this.addBudgetForm.reset();
      this.addBudgetForm.patchValue({
        ref: '',
        idGrupo: '',
      });
    }
  }

  onSubmit() {
    if (this.crear) {
      this.addBudgetForm.value['fecha'] = new Date();
      this.ipcService.send('presupuesto:new', this.addBudgetForm.value);
      this.ipcService.on('newPresupuesto:reply', (event: any, arg: any) => {
        if (!arg) {
          this.ngZone.run(() => {
            void this.router.navigate(['/', 'home']);
          });
        }
      });
    } else {
      this.addBudgetForm.value['nif'] = this.userData['nif'];
      this.ipcService.send('presupuesto:update', this.addBudgetForm.value);
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
