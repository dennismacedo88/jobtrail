import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { empresasApi } from '../api/empresasApi'
import { ApiError } from '../api/httpClient'
import type { Empresa } from '../types/empresa'
import './Empresas.css'

export function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erroLista, setErroLista] = useState<string | null>(null)

  const [nome, setNome] = useState('')
  const [site, setSite] = useState('')
  const [notas, setNotas] = useState('')
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    // Guarda para não chamar setState se o componente já tiver desmontado
    // quando a resposta chegar (evita o warning "unmounted component").
    let cancelado = false

    empresasApi
      .listar()
      .then((dados) => {
        if (!cancelado) setEmpresas(dados)
      })
      .catch((erro) => {
        if (!cancelado) {
          setErroLista(erro instanceof ApiError ? erro.message : 'Não foi possível carregar as empresas.')
        }
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })

    return () => {
      cancelado = true
    }
  }, [])

  async function handleSubmit(evento: FormEvent) {
    evento.preventDefault()
    setErroForm(null)
    setEnviando(true)

    try {
      const novaEmpresa = await empresasApi.criar({
        nome,
        site: site.trim() || null,
        notas: notas.trim() || null,
      })
      // Mantém a lista ordenada por nome, igual ao backend (OrderBy(e => e.Nome)).
      setEmpresas((atual) =>
        [...atual, novaEmpresa].sort((a, b) => a.nome.localeCompare(b.nome)),
      )
      setNome('')
      setSite('')
      setNotas('')
    } catch (erro) {
      setErroForm(erro instanceof ApiError ? erro.message : 'Não foi possível cadastrar a empresa.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="empresas-page">
      <h2>Empresas</h2>

      <form className="empresa-form" onSubmit={handleSubmit}>
        <div className="empresa-form-linha">
          <div className="empresa-form-campo">
            <label htmlFor="nome">Nome</label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(evento) => setNome(evento.target.value)}
              required
            />
          </div>

          <div className="empresa-form-campo">
            <label htmlFor="site">Site</label>
            <input
              id="site"
              type="url"
              placeholder="https://..."
              value={site}
              onChange={(evento) => setSite(evento.target.value)}
            />
          </div>
        </div>

        <div className="empresa-form-campo">
          <label htmlFor="notas">Notas</label>
          <textarea
            id="notas"
            rows={2}
            value={notas}
            onChange={(evento) => setNotas(evento.target.value)}
          />
        </div>

        {erroForm && <p className="empresas-erro">{erroForm}</p>}

        <button type="submit" disabled={enviando}>
          {enviando ? 'Salvando...' : 'Adicionar empresa'}
        </button>
      </form>

      {carregando && <p>Carregando empresas...</p>}
      {erroLista && <p className="empresas-erro">{erroLista}</p>}

      {!carregando && !erroLista && empresas.length === 0 && (
        <p>Nenhuma empresa cadastrada ainda.</p>
      )}

      {!carregando && empresas.length > 0 && (
        <div className="tabela-scroll">
          <table className="empresas-tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Site</th>
                <th>Candidaturas</th>
                <th>Cadastrada em</th>
              </tr>
            </thead>
            <tbody>
              {empresas.map((empresa) => (
                <tr key={empresa.id}>
                  <td>{empresa.nome}</td>
                  <td>
                    {empresa.site ? (
                      <a href={empresa.site} target="_blank" rel="noreferrer">
                        {empresa.site}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{empresa.totalCandidaturas}</td>
                  <td>{new Date(empresa.criadoEm).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
