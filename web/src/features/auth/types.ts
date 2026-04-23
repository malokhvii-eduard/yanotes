export interface AuthTokens {
  access: string
  refresh: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_staff: boolean
  password?: string
}

export interface RegisterPayload {
  username: string
  email: string
  first_name: string
  last_name: string
  password: string
}
