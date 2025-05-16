import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DoctorserviceService } from './services/doctorservice.service';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ViewChild, AfterViewInit } from '@angular/core';
import { DoctorformComponent } from './components/doctorform/doctorform.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
@Component({
  selector: 'app-root',
  imports: [HttpClientModule, MatTableModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,MatPaginatorModule, MatDialogModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [DoctorserviceService]
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'frontend';
  displayedColumns: string[] = [
    'foto',
    'nombre_medico',
    'especialidad_medico',
    'numero_consultas',
    'direccion',
    'puesto_atencion',
    'acciones'
  ];
  doctores = []
  dataSource = new MatTableDataSource(this.doctores);
  constructor(private dialog: MatDialog,private service: DoctorserviceService) { }

  ngOnInit(): void {
    this.cargarDoctores()
  }
  
  cargarDoctores(){
    this.service.getDoctores().subscribe({
      next: (data) => {
        this.doctores = data
        this.dataSource.data = this.doctores
      },
    })
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  abrirModal(doctor: any = null) {
    const dialogRef = this.dialog.open(DoctorformComponent, {
      width: '80vw',
      data: doctor,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.id) {
          this.service.editarDoctor(result).subscribe(() => this.cargarDoctores());
        } else {
          this.service.crearDoctor(result).subscribe(() => this.cargarDoctores());
        }
      }
    });
  }
  eliminar(id:any){

  }
}
