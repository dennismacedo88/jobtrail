// Wrapper fino sobre fetch, centralizando o que toda chamada à API precisa:
// - base relativa '/api' (o proxy do Vite cuida de levar isso até o backend)
// - credentials: 'include', obrigatório para o cookie HttpOnly de sessão
//   viajar junto na requisição
// - conversão do corpo de erro { message: "..." } do backend numa exceção
//   com mensagem pronta para exibir na tela
//
// Mesmo espírito do MapToResponseDto nos Controllers do backend: evita
// repetir essa lógica em cada tela que precisar chamar a API (DRY).

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

const BASE_URL = '/api'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const mensagem = await extrairMensagemDeErro(response)
    throw new ApiError(mensagem, response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

async function extrairMensagemDeErro(response: Response): Promise<string> {
  try {
    const corpo = await response.json()
    if (typeof corpo?.message === 'string') {
      return corpo.message
    }
  } catch {
    // corpo vazio ou não é JSON — cai na mensagem genérica abaixo
  }

  return 'Não foi possível completar a operação. Tente novamente.'
}

export const httpClient = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
