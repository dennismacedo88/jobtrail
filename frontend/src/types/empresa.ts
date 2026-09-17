// Espelha os DTOs do backend (JobTrail.Api/DTOs/EmpresaDtos.cs).

export interface Empresa {
  id: number
  nome: string
  site: string | null
  notas: string | null
  criadoEm: string
  totalCandidaturas: number
}

export interface EmpresaPayload {
  nome: string
  site?: string | null
  notas?: string | null
}
