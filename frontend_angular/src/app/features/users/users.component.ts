import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User, UserRequest } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';
import { UserFormDialogComponent, UserFormDialogData } from './user-form-dialog.component';
import { ConfirmDialogComponent } from './confirm-dialog.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatDialogModule,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  users: User[] = [];
  loading = false;
  displayedColumns = ['id', 'username', 'email', 'role', 'createdAt', 'actions'];

  ngOnInit(): void {
    this.fetchUsers();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString();
  }

  isProtected(id: number): boolean {
    return [1, 2].includes(Number(id));
  }

  fetchUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (res) => {
        this.users = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.notify(err.message || 'Failed to fetch users');
        this.loading = false;
      },
    });
  }

  handleAdd(): void {
    const ref = this.dialog.open<UserFormDialogComponent, UserFormDialogData, UserRequest>(
      UserFormDialogComponent,
      { width: '500px', data: { isEdit: false } }
    );

    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.userService.createUser(result).subscribe({
        next: () => {
          this.notify('User created successfully');
          this.fetchUsers();
        },
        error: (err) => this.notify(err.message || 'Operation failed'),
      });
    });
  }

  handleEdit(row: User): void {
    const ref = this.dialog.open<UserFormDialogComponent, UserFormDialogData, UserRequest>(
      UserFormDialogComponent,
      { width: '500px', data: { isEdit: true, user: row } }
    );

    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.userService.updateUser(row.id, result).subscribe({
        next: () => {
          this.notify('User updated successfully');
          this.fetchUsers();
        },
        error: (err) => this.notify(err.message || 'Operation failed'),
      });
    });
  }

  handleDelete(row: User): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete user "${row.username}"?`,
      },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.userService.deleteUser(row.id).subscribe({
        next: () => {
          this.notify('User deleted successfully');
          this.fetchUsers();
        },
        error: (err) => this.notify(err.message || 'Failed to delete user'),
      });
    });
  }

  private notify(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }
}
