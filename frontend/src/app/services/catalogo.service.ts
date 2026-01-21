import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CatalogoService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    constructor() { }

    // Generic Get
    getItems(endpoint: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/${endpoint}`);
    }

    // Generic Get by ID
    getItem(endpoint: string, id: number | string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${endpoint}/${id}`);
    }

    // Generic Create
    createItem(endpoint: string, item: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/${endpoint}`, item);
    }

    // Generic Update
    updateItem(endpoint: string, id: number | string, item: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${endpoint}/${id}`, item);
    }

    // Generic Delete
    deleteItem(endpoint: string, id: number | string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${endpoint}/${id}`);
    }
}
