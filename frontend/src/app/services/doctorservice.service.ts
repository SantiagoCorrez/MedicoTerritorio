import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
const api_url = "https://medicocundinamarca.creatisoftcolombia.lat"


@Injectable({
  providedIn: 'root',
})
export class DoctorserviceService {

  constructor(private http: HttpClient) { }
  deleteDoctor(id: number): Observable<any> {
    return this.http.delete(`${api_url}/api/doctores/${id}`)
  }

  getDoctores(): Observable<any> {
    return this.http.get<any[]>(`${api_url}/api/doctores`)
  }
  editarDoctor(doctorForm: any): Observable<any> {
    return this.http.put(`${api_url}/api/doctores/${doctorForm.id}`, doctorForm)
  }
  crearDoctor(doctorForm: any) : Observable<any>{
    return this.http.post(`${api_url}/api/doctores`, doctorForm);
  }

}
