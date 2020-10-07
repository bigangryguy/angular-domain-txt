import {ViewChild, Component, AfterViewInit, Inject} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {DomainService} from '../domain.service';
import {Domain} from '../domain';
import {Platform} from '../platform';
import * as _ from 'lodash';

@Component({
  selector: 'app-domain',
  templateUrl: './domain.component.html',
  styleUrls: ['./domain.component.css'],
})
export class DomainComponent implements AfterViewInit {
  domainData: Domain;

  // Flags to control the expansion panels
  firstPanelOpen = true;
  secondPanelOpen = false;

  dataSource: MatTableDataSource<Domain> = new MatTableDataSource<Domain>();
  displayedColumns: string[] = ['name', 'platforms', 'actions'];

  minPlatformNumber = 1;
  maxPlatformNumber = 5;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private service: DomainService,
    public dialog: MatDialog,
  ) {
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
      this.firstPanelOpen = true;
      this.secondPanelOpen = false;
    });
  }

  editDomain(domain): void {
    this.domainData = _.cloneDeep(domain);
    this.firstPanelOpen = false;
    this.secondPanelOpen = true;
  }

  deleteDomain(id): void {
    this.service.deleteDomain(id).subscribe((response: any) => {
      this.getDomains();
    });
  }

  cancelEdit(): void {
    this.firstPanelOpen = true;
    this.secondPanelOpen = false;
    this.domainData = null;
  }

  openDialog(index: number, platform: Platform): void {
    const dialogRef = this.dialog.open(PlatformDialogComponent, {
      width: '250px',
      data: {
        id: platform.id,
        domain_id: platform.domain_id,
        nbr: platform.nbr,
        txt: platform.txt,
        is_valid: platform.is_valid
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      const updatedPlatform: Platform = this.domainData.platforms[index];
      updatedPlatform.txt = result.txt;
      this.service.updatePlatform(updatedPlatform).subscribe((response: any) => {
        this.getDomains();
      });
    });
  }
}

@Component({
  selector: 'app-platform-dialog',
  templateUrl: 'platform-dialog.html',
})
export class PlatformDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<PlatformDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public platform: Platform,
  ) {
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
