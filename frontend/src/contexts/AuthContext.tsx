import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { authApi } from '../api/authApi'
import type { RegisterPayload, Usuario } from '../types/auth'
import { AuthContext } from './authContextDefinition'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  // Começa true: até a chamada a /auth/me responder, não sabemos se há
  // sessão válida — sem isso, a tela piscaria "deslogado" antes de saber.
  const [carregandoSessao, setCarregandoSessao] = useState(true)

  useEffect(() => {
    authApi
      .buscarUsuarioLogado()
      .then(setUsuario)
      .catch(() => setUsuario(null))
      .finally(() => setCarregandoSessao(false))
  }, [])

  async function login(email: string, senha: string) {
    const usuarioLogado = await authApi.login({ email, senha })
    setUsuario(usuarioLogado)
  }

  async function registrar(dados: RegisterPayload) {
    await authApi.registrar(dados)
    // O endpoint de cadastro só cria o usuário, não gera cookie de sessão
    // (essa responsabilidade é exclusiva do /login, por design do backend).
    // Encadeamos o login aqui para o usuário não precisar redigitar os
    // dados logo após se cadastrar.
    await login(dados.email, dados.senha)
  }

  async function logout() {
    await authApi.logout()
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, carregandoSessao, login, registrar, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
