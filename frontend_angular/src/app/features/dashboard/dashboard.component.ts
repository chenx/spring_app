import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HealthData, UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private readonly userService = inject(UserService);

  healthData: HealthData | null = null;
  loading = false;

  ngOnInit(): void {
    this.checkHealth();
  }

  checkHealth(): void {
    this.loading = true;
    this.userService.healthCheck().subscribe({
      next: (res) => {
        this.healthData = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.healthData = null;
        this.loading = false;
      },
    });
  }
}
