import { httpClient } from './httpClient'
import type { Empresa, EmpresaPayload } from '../types/empresa'

export const empresasApi = {
  listar: () => httpClient.get<Empresa[]>('/empresas'),

  criar: (dados: EmpresaPayload) => httpClient.post<Empresa>('/empresas', dados),
}
