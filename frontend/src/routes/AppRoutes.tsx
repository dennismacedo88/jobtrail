import { Route, Routes } from 'react-router-dom'
import { LoginPage } from '../pages/LoginPage'
import { CadastroPage } from '../pages/CadastroPage'
import { HomePage } from '../pages/HomePage'
import { RotaProtegida } from './RotaProtegida'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<CadastroPage />} />
      <Route
        path="/"
        element={
          <RotaProtegida>
            <HomePage />
          </RotaProtegida>
        }
      />
    </Routes>
  )
}
