import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Casca visual compartilhada por todas as páginas protegidas: cabeçalho
// com navegação + dados do usuário logado. O conteúdo de cada página entra
// via <Outlet /> (rotas aninhadas em AppRoutes).
export function Layout() {
  const { usuario, logout } = useAuth()

  return (
    <>
      <header className="page-header">
        <div className="page-header-marca">
          <h1>JobTrail</h1>
          <nav className="page-header-nav">
            <NavLink to="/" end>
              Início
            </NavLink>
            <NavLink to="/empresas">Empresas</NavLink>
          </nav>
        </div>

        <div className="page-header-usuario">
          <span>Olá, {usuario?.nome}</span>
          <button type="button" onClick={() => logout()}>
            Sair
          </button>
        </div>
      </header>

      <main className="page">
        <Outlet />
      </main>
    </>
  )
}
