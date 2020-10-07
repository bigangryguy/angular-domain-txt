import {ViewChild, Component, OnInit, AfterViewInit} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {DomainService} from '../domain.service';
import {Domain} from '../domain';
import {NgForm} from '@angular/forms';
import * as _ from 'lodash';
import {Platform} from '../platform';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-domain',
  templateUrl: './domain.component.html',
  styleUrls: ['./domain.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display: 'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class DomainComponent implements AfterViewInit {
  @ViewChild('domainForm', { static: false }) domainForm: NgForm;
  domainData: Domain;
  expandedDomain: Domain | null;

  dataSource: MatTableDataSource<Domain> = new MatTableDataSource<Domain>();
  displayedColumns: string[] = ['name', 'actions'];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  isEditMode = false;

  constructor(private service: DomainService) {
    this.domainData = {} as Domain;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.getDomains();
  }

  getDomains(): void {
    this.service.getDomains().subscribe((response: any) => {
      console.log(response);
      this.dataSource.data = response;
    });
  }

  addDomain(): void {
    this.service.createDomain(this.domainData).subscribe((response: any) => {
      this.dataSource.data.push({ ...response });
      this.dataSource.data = this.dataSource.data.map(o => {
        return o;
      });
      this.cancelEdit();
    });
  }

  updateDomain(): void {
    this.service.updateDomain(this.domainData).subscribe((response: any) => {
      this.getDomains();
      this.cancelEdit();
    });
  }

  editDomain(domain): void {
    this.domainData = _.cloneDeep(domain);
    this.isEditMode = true;
  }

  deleteDomain(id): void {
    this.service.deleteDomain(id).subscribe((response: any) => {
      this.getDomains();
    });
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.domainForm.resetForm();
  }

  onSubmitDomain(): void {
    if (this.domainForm.form.valid) {
      if (this.isEditMode) {
        this.updateDomain();
      } else {
        this.addDomain();
      }
    } else {
      console.log('Enter valid data');
    }
  }
}
