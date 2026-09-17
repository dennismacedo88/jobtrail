import { useAuth } from '../hooks/useAuth'

// Página inicial provisória — só existe para validar o fluxo de
// autenticação de ponta a ponta. Vai dar lugar à listagem de
// Candidaturas quando essa tela for construída.
export function HomePage() {
  const { usuario, logout } = useAuth()

  return (
    <div className="page">
      <header className="page-header">
        <h1>JobTrail</h1>
        <div className="page-header-usuario">
          <span>Olá, {usuario?.nome}</span>
          <button type="button" onClick={() => logout()}>
            Sair
          </button>
        </div>
      </header>

      <p>Login funcionando. As telas de Empresas e Candidaturas vêm a seguir.</p>
    </div>
  )
}
