import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Envolve páginas que exigem usuário autenticado. Enquanto a sessão ainda
// está sendo verificada (chamada a /auth/me em andamento), não redireciona
// de imediato — isso evitaria jogar um usuário já logado de volta pro
// /login só porque a resposta do /me ainda não chegou.
export function RotaProtegida({ children }: { children: ReactNode }) {
  const { usuario, carregandoSessao } = useAuth()

  if (carregandoSessao) {
    return <p>Carregando...</p>
  }

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
