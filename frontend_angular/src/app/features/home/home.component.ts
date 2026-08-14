import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { HealthData, UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatDividerModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
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
