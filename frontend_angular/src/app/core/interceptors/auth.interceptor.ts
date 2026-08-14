import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

// Mirrors utils/request.ts: attaches the JWT to every request and
// redirects to /login on a 401 response from the server.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        localStorage.removeItem('token');
        router.navigate(['/login']);
        return throwError(() => new Error('Session expired. Please log in again.'));
      }

      const message = error.error?.message || error.message || 'Request failed';
      return throwError(() => new Error(message));
    })
  );
};
