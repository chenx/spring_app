export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface UserRequest {
  username: string;
  email: string;
  role?: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
