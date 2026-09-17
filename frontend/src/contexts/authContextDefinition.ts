import { createContext } from 'react'
import type { RegisterPayload, Usuario } from '../types/auth'

export interface AuthContextValor {
  usuario: Usuario | null
  carregandoSessao: boolean
  login: (email: string, senha: string) => Promise<void>
  registrar: (dados: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValor | undefined>(undefined)
