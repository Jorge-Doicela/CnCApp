import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs'; // Import Observable

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    login(ci: string, password: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/login`, { ci, password });
    }

    register(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/register`, data);
    }

    getProfile(token: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
}
