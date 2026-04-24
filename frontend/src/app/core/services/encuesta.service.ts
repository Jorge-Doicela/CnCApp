import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EncuestaService {
  private apiUrl = `${environment.apiUrl}/encuestas`;

  constructor(private http: HttpClient) {}

  getEncuestaByCapacitacion(capacitacionId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/capacitacion/${capacitacionId}`);
  }

  submitRespuesta(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/respuesta`, data);
  }

  checkIfResponded(encuestaId: number): Observable<{responded: boolean}> {
    return this.http.get<{responded: boolean}>(`${this.apiUrl}/${encuestaId}/responded`);
  }

  getResultados(encuestaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${encuestaId}/resultados`);
  }
}
