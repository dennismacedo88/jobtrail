// Espelham os DTOs do backend (JobTrail.Api/DTOs/AuthDtos.cs).
// Os nomes de campo seguem o JSON retornado pela API (camelCase por padrão
// do System.Text.Json), não os nomes em PascalCase do C#.

export interface Usuario {
  id: number
  nome: string
  email: string
  criadoEm: string
}

export interface RegisterPayload {
  nome: string
  email: string
  senha: string
}

export interface LoginPayload {
  email: string
  senha: string
}
