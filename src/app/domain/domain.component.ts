import {ViewChild, Component, AfterViewInit, Inject} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTable, MatTableDataSource} from '@angular/material/table';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {DomainService} from '../domain.service';
import {AvailableNbr, Domain} from '../domain';
import {Platform} from '../platform';
import {Schema} from '../schema';
import * as _ from 'lodash';
import {Form, FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-domain',
  templateUrl: './domain.component.html',
  styleUrls: ['./domain.component.css'],
})
export class DomainComponent implements AfterViewInit {
  domainData: Domain;
  platformData: Platform;
  availablePlatformNbrs: AvailableNbr;
  txtSchema: Schema;

  // Flags to control the expansion panels
  firstPanelOpen = true;
  secondPanelOpen = false;

  dataSource: MatTableDataSource<Domain> = new MatTableDataSource<Domain>();
  displayedColumns: string[] = ['name', 'platforms', 'actions'];
  displayedColumnsPlatform: string[] = ['nbr', 'txt', 'is_valid', 'actions'];

  minPlatformNumber = 1;
  maxPlatformNumber = 5;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('platformTable') platformTable: MatTable<Platform>;

  constructor(
    public dialog: MatDialog,
    private service: DomainService,
    private formBuilder: FormBuilder,
  ) {
    this.domainData = {} as Domain;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.getDomains();
    this.getSchema();
  }

  getDomainData(id): void {
    this.service.getDomain(id).subscribe((response: any) => {
      console.log(response);
      this.domainData = response;
    });
  }

  getDomains(): void {
    this.service.getDomains().subscribe((response: any) => {
      console.log(response);
      this.dataSource.data = response;
    });
  }

  addDomain(): void {
    this.service.createDomain(this.domainData).subscribe((response: any) => {
      this.getDomains();
      this.cancelEdit();
    });
  }

  updateDomain(): void {
    this.service.updateDomain(this.domainData).subscribe((response: any) => {
      this.getDomains();
      this.firstPanelOpen = true;
      this.secondPanelOpen = false;
    });
  }

  editDomain(domain): void {
    this.refreshDomainData(domain);
    this.firstPanelOpen = false;
    this.secondPanelOpen = true;
  }

  deleteDomain(id): void {
    this.service.deleteDomain(id).subscribe((response: any) => {
      this.getDomains();
    });
  }

  addPlatform(): void {
    this.service.createPlatform(this.platformData).subscribe((response: any) => {
      this.getDomains();
      this.cancelEdit();
    });
  }

  deletePlatform(id): void {
    this.service.deletePlatform(id).subscribe((response: any) => {
      this.getDomainData(this.domainData.id);
    });
  }

  getSchema(): void {
    this.service.getSchema().subscribe((response: any) => {
      this.txtSchema = response;
    });
  }

  cancelEdit(): void {
    this.firstPanelOpen = true;
    this.secondPanelOpen = false;
    this.domainData = null;
  }

  refreshDomainData(domain): void {
    this.domainData = _.cloneDeep(domain);
  }

  openAddDomainDialog(): void {
    const dialogRef = this.dialog.open(DomainAddDialogComponent, {
      width: '250px',
      data: {
        id: 0,
        name: '',
        platforms: null,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      const domain: Domain = result;
      this.service.createDomain(domain).subscribe((response: any) => {
        this.getDomains();
      });
    });
  }

  openAddPlatformDialog(domain: Domain): void {
    this.service.getAvailablePlatformNbrs(domain.id).subscribe((response: AvailableNbr) => {
      const emptyPlatform: Platform = {
        id: 0,
        domain_id: domain.id,
        nbr: 0,
        txt: '',
        is_valid: true,
      };
      const dialogRef = this.dialog.open(PlatformAddDialogComponent, {
        width: '250px',
        data: {
          platform: emptyPlatform,
          availableNbrs: response,
          schemaDesc: this.txtSchema.description,
          schemaRegex: this.txtSchema.regex,
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        const platform: Platform = result;
        this.service.createPlatform(platform).subscribe((response2: any) => {
          this.getDomainData(this.domainData.id);
        });
      });
    });
  }

  openUpdateDialog(index: number, platform: Platform): void {
    const tempPlatform: Platform = {
      id: platform.id,
      domain_id: platform.domain_id,
      nbr: platform.nbr,
      txt: platform.txt,
      is_valid: platform.is_valid,
    };
    const dialogRef = this.dialog.open(PlatformUpdateDialogComponent, {
      width: '250px',
      data: {
        currPlatform: tempPlatform,
        schemaDesc: this.txtSchema.description,
        schemaRegex: this.txtSchema.regex,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      const updatedPlatform: Platform = this.domainData.platforms[index];
      updatedPlatform.txt = result.txt;
      this.service.updatePlatform(updatedPlatform).subscribe((response: any) => {
        this.getDomainData(platform.domain_id);
      });
    });
  }
}

@Component({
  selector: 'app-domain-add-dialog',
  templateUrl: 'domain-add-dialog.html',
})
export class DomainAddDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DomainAddDialogComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data,
  ) {
  }

  addForm: FormGroup = this.formBuilder.group({
    name: [, {validators: [Validators.required]}],
  });

  onCancel(): void {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-platform-add-dialog',
  templateUrl: 'platform-add-dialog.html',
})
export class PlatformAddDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<PlatformAddDialogComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data,
  ) {
  }

  addForm: FormGroup = this.formBuilder.group({
    nbr: [, {validators: [Validators.required, Validators.min(1), Validators.max(5)], updateOn: 'change'}],
    txtRecord: [, {validators: [Validators.required, Validators.pattern(this.data.schemaRegex)], updateOn: 'change'}]
  });

  onCancel(): void {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-platform-update-dialog',
  templateUrl: 'platform-update-dialog.html',
})
export class PlatformUpdateDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<PlatformUpdateDialogComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data,
  ) {
  }

  updateForm: FormGroup = this.formBuilder.group({
    txtRecord: [, {validators: [Validators.required, Validators.pattern(this.data.schemaRegex)], updateOn: 'change'}]
  });

  onCancel(): void {
    this.dialogRef.close();
  }
}
