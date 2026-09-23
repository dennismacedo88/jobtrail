import { httpClient } from './httpClient'
import type {
  Candidatura,
  CandidaturaPayload,
  CandidaturaUpdatePayload,
  HistoricoStatus,
  StatusCandidatura,
} from '../types/candidatura'

export const candidaturasApi = {
  listar: () => httpClient.get<Candidatura[]>('/candidaturas'),

  buscarPorId: (id: number) => httpClient.get<Candidatura>(`/candidaturas/${id}`),

  criar: (dados: CandidaturaPayload) => httpClient.post<Candidatura>('/candidaturas', dados),

  // PUT retorna 204 No Content — o Controller não devolve o DTO atualizado,
  // então a tela precisa mesclar os campos editados no estado local.
  atualizar: (id: number, dados: CandidaturaUpdatePayload) =>
    httpClient.put<void>(`/candidaturas/${id}`, dados),

  historico: (id: number) => httpClient.get<HistoricoStatus[]>(`/candidaturas/${id}/historico`),

  mudarStatus: (id: number, novoStatus: StatusCandidatura) =>
    httpClient.patch<Candidatura>(`/candidaturas/${id}/status`, { novoStatus }),
}
