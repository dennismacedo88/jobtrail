import { Route, Routes } from 'react-router-dom'
import { LoginPage } from '../pages/LoginPage'
import { CadastroPage } from '../pages/CadastroPage'
import { HomePage } from '../pages/HomePage'
import { EmpresasPage } from '../pages/EmpresasPage'
import { RotaProtegida } from './RotaProtegida'
import { Layout } from '../components/Layout'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<CadastroPage />} />

      <Route
        element={
          <RotaProtegida>
            <Layout />
          </RotaProtegida>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/empresas" element={<EmpresasPage />} />
      </Route>
    </Routes>
  )
}
