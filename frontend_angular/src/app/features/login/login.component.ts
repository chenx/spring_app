import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  username = '';
  password = '';
  errorMessage = '';
  successMessage = '';

  handleLogin(): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.login(this.username, this.password).subscribe({
      next: (data) => {
        console.log(data);
        this.successMessage = data;

        // Save token if your backend sends one (e.g., JWT)
        localStorage.setItem('token', data.token);
        console.log('token: ', data.token);

        this.router.navigate(['/dashboard']);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status !== 0) {
          this.errorMessage = error.error || 'Invalid username or password.';
        } else {
          this.errorMessage = 'Cannot connect to backend server.';
        }
      },
    });
  }
}
