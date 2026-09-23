// Espelha os DTOs do backend (JobTrail.Api/DTOs/CandidaturaDtos.cs).
// O enum StatusCandidatura chega como string por causa do JsonStringEnumConverter
// configurado no Program.cs (ex: "Entrevista", não 3).

export type StatusCandidatura =
  | 'Aplicado'
  | 'Triagem'
  | 'TesteTecnico'
  | 'Entrevista'
  | 'Oferta'
  | 'Rejeitado'
  | 'Desistiu'

export const STATUS_CANDIDATURA: StatusCandidatura[] = [
  'Aplicado',
  'Triagem',
  'TesteTecnico',
  'Entrevista',
  'Oferta',
  'Rejeitado',
  'Desistiu',
]

export const STATUS_LABEL: Record<StatusCandidatura, string> = {
  Aplicado: 'Aplicado',
  Triagem: 'Triagem',
  TesteTecnico: 'Teste técnico',
  Entrevista: 'Entrevista',
  Oferta: 'Oferta',
  Rejeitado: 'Rejeitado',
  Desistiu: 'Desistiu',
}

export interface Candidatura {
  id: number
  cargo: string
  empresaId: number
  nomeEmpresa: string
  linkVaga: string | null
  salarioPretendido: number | null
  salarioOferecido: number | null
  notas: string | null
  status: StatusCandidatura
  dataAplicacao: string
  criadoEm: string
}

// Espelha CandidaturaRequestDto — usado para CRIAR
export interface CandidaturaPayload {
  cargo: string
  empresaId: number
  linkVaga?: string | null
  salarioPretendido?: number | null
  salarioOferecido?: number | null
  notas?: string | null
  dataAplicacao?: string | null
}

// Espelha CandidaturaUpdateDto — usado para ATUALIZAR.
// Sem empresaId (a empresa não pode ser trocada por aqui) e sem status
// (mudança de status é feita pelo endpoint dedicado PATCH /status).
export interface CandidaturaUpdatePayload {
  cargo: string
  linkVaga?: string | null
  salarioPretendido?: number | null
  salarioOferecido?: number | null
  notas?: string | null
}

// Espelha HistoricoStatusResponseDto
export interface HistoricoStatus {
  id: number
  statusAnterior: StatusCandidatura
  statusNovo: StatusCandidatura
  dataMudanca: string
}
