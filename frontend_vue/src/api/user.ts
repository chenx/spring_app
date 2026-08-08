import api from '@/utils/request'
import type { User, UserRequest, ApiResponse } from '@/types'

export function getUsers(): Promise<ApiResponse<User[]>> {
  return api.get('/users')
}

export function getUserById(id: number): Promise<ApiResponse<User>> {
  return api.get(`/users/${id}`)
}

export function createUser(data: UserRequest): Promise<ApiResponse<User>> {
  return api.post('/users', data)
}

export function updateUser(id: number, data: UserRequest): Promise<ApiResponse<User>> {
  return api.put(`/users/${id}`, data)
}

export function deleteUser(id: number): Promise<ApiResponse<void>> {
  return api.delete(`/users/${id}`)
}

export function healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string; service: string }>> {
  return api.get('/health')
}
