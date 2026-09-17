import { httpClient } from './httpClient'
import type { LoginPayload, RegisterPayload, Usuario } from '../types/auth'

export const authApi = {
  registrar: (dados: RegisterPayload) => httpClient.post<Usuario>('/auth/register', dados),

  login: (dados: LoginPayload) => httpClient.post<Usuario>('/auth/login', dados),

  logout: () => httpClient.post<void>('/auth/logout'),

  buscarUsuarioLogado: () => httpClient.get<Usuario>('/auth/me'),
}
