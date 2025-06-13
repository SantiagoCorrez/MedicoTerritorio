import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DoctorserviceService } from './../../services/doctorservice.service';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ViewChild, AfterViewInit } from '@angular/core';
import { DoctorformComponent } from '../doctorform/doctorform.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
@Component({
  selector: 'app-admin-doctores',
  imports: [MatTableModule,MatCardModule,MatIconModule,MatButtonModule,
    MatPaginatorModule,MatDialogModule,HttpClientModule
  ],
  templateUrl: './admin-doctores.component.html',
  styleUrl: './admin-doctores.component.scss',
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  providers: [DoctorserviceService]
})
export class AdminDoctoresComponent implements AfterViewInit {
  title = 'frontend';
  displayedColumns: string[] = [
    'nombre_municipio',
    'general_medico',
    'especialidad_medico',
    'numero_consultas',
    'numero_consultas_especialidad',
    'direccion',
    'puesto_atencion',
    'acciones'
  ];
  doctores = []
  dataSource = new MatTableDataSource(this.doctores);
  constructor(private dialog: MatDialog, private service: DoctorserviceService) { }

  ngOnInit(): void {
    this.cargarDoctores()
  }

  cargarDoctores() {
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
    console.log(doctor)
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
  eliminar(id: any) {
    this.service.deleteDoctor(id.id).subscribe({
      next:data=>{
        this.cargarDoctores()
      }
    })
  }
}
