import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-doctorform',
  imports: [CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule],
  templateUrl: './doctorform.component.html',
  styleUrl: './doctorform.component.scss'
})
export class DoctorformComponent {
form: any = {};

  constructor(
    public dialogRef: MatDialogRef<DoctorformComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = { ...data }; // Si es edición, se precargan los datos
  }

  guardar() {
    this.dialogRef.close(this.form);
  }
}
