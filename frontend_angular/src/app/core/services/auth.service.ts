import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Uses HttpBackend directly (bypassing the auth interceptor's 401 handling),
  // mirroring the Vue app's use of the raw `axios` instance instead of the
  // configured `api` instance for the login call.
  private readonly http = new HttpClient(inject(HttpBackend));

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>('/api/auth/login', { username, password });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
  }
}
