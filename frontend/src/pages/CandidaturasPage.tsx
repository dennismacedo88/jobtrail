import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { candidaturasApi } from '../api/candidaturasApi'
import { empresasApi } from '../api/empresasApi'
import { ApiError } from '../api/httpClient'
import type { Candidatura, StatusCandidatura } from '../types/candidatura'
import { STATUS_CANDIDATURA, STATUS_LABEL } from '../types/candidatura'
import type { Empresa } from '../types/empresa'
import './Candidaturas.css'

type FiltroStatus = StatusCandidatura | 'Todos'

const FORM_INICIAL = {
  cargo: '',
  empresaId: '',
  linkVaga: '',
  salarioPretendido: '',
  salarioOferecido: '',
  notas: '',
  dataAplicacao: '',
}

export function CandidaturasPage() {
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('Todos')

  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [carregandoEmpresas, setCarregandoEmpresas] = useState(true)

  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [form, setForm] = useState(FORM_INICIAL)
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    // Guarda para não chamar setState se o componente já tiver desmontado
    // quando a resposta chegar (evita o warning "unmounted component").
    let cancelado = false

    candidaturasApi
      .listar()
      .then((dados) => {
        if (!cancelado) setCandidaturas(dados)
      })
      .catch((erro) => {
        if (!cancelado) {
          setErro(erro instanceof ApiError ? erro.message : 'Não foi possível carregar as candidaturas.')
        }
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })

    empresasApi
      .listar()
      .then((dados) => {
        if (!cancelado) setEmpresas(dados)
      })
      .catch(() => {
        // Erro ao carregar empresas é tratado só na validação do formulário
        // (select fica vazio) — não precisa de outra mensagem de erro na tela.
      })
      .finally(() => {
        if (!cancelado) setCarregandoEmpresas(false)
      })

    return () => {
      cancelado = true
    }
  }, [])

  // Filtro é aplicado no cliente: a API ainda não expõe um parâmetro de
  // filtro por status, e a lista já vem inteira do backend por usuário.
  const candidaturasFiltradas = useMemo(() => {
    if (filtroStatus === 'Todos') return candidaturas
    return candidaturas.filter((c) => c.status === filtroStatus)
  }, [candidaturas, filtroStatus])

  function iniciarEdicao(candidatura: Candidatura) {
    setEditandoId(candidatura.id)
    setForm({
      cargo: candidatura.cargo,
      empresaId: String(candidatura.empresaId),
      linkVaga: candidatura.linkVaga ?? '',
      salarioPretendido: candidatura.salarioPretendido != null ? String(candidatura.salarioPretendido) : '',
      salarioOferecido: candidatura.salarioOferecido != null ? String(candidatura.salarioOferecido) : '',
      notas: candidatura.notas ?? '',
      dataAplicacao: '',
    })
    setErroForm(null)
  }

  function cancelarEdicao() {
    setEditandoId(null)
    setForm(FORM_INICIAL)
    setErroForm(null)
  }

  async function handleSubmit(evento: FormEvent) {
    evento.preventDefault()
    setErroForm(null)
    setEnviando(true)

    const salarioPretendido = form.salarioPretendido.trim() ? Number(form.salarioPretendido) : null
    const salarioOferecido = form.salarioOferecido.trim() ? Number(form.salarioOferecido) : null

    try {
      if (editandoId == null) {
        const novaCandidatura = await candidaturasApi.criar({
          cargo: form.cargo,
          empresaId: Number(form.empresaId),
          linkVaga: form.linkVaga.trim() || null,
          salarioPretendido,
          salarioOferecido,
          notas: form.notas.trim() || null,
          dataAplicacao: form.dataAplicacao || null,
        })
        // Mantém a lista ordenada por data de aplicação (mais recente primeiro),
        // igual ao backend (OrderByDescending(c => c.DataAplicacao)).
        setCandidaturas((atual) =>
          [...atual, novaCandidatura].sort(
            (a, b) => new Date(b.dataAplicacao).getTime() - new Date(a.dataAplicacao).getTime(),
          ),
        )
      } else {
        await candidaturasApi.atualizar(editandoId, {
          cargo: form.cargo,
          linkVaga: form.linkVaga.trim() || null,
          salarioPretendido,
          salarioOferecido,
          notas: form.notas.trim() || null,
        })
        // O PUT devolve 204 (sem corpo) — atualiza o estado local com os
        // campos editados, mantendo status/empresa/datas como já estavam.
        setCandidaturas((atual) =>
          atual.map((c) =>
            c.id === editandoId
              ? { ...c, cargo: form.cargo, linkVaga: form.linkVaga.trim() || null, salarioPretendido, salarioOferecido, notas: form.notas.trim() || null }
              : c,
          ),
        )
      }

      cancelarEdicao()
    } catch (erro) {
      setErroForm(
        erro instanceof ApiError ? erro.message : 'Não foi possível salvar a candidatura.',
      )
    } finally {
      setEnviando(false)
    }
  }

  const emModoEdicao = editandoId != null
  const semEmpresasCadastradas = !carregandoEmpresas && empresas.length === 0

  return (
    <div className="candidaturas-page">
      <h2>Candidaturas</h2>

      <form className="candidatura-form" onSubmit={handleSubmit}>
        <h3>{emModoEdicao ? 'Editar candidatura' : 'Nova candidatura'}</h3>

        {semEmpresasCadastradas && (
          <p className="candidaturas-aviso">
            Cadastre uma empresa antes de criar uma candidatura.
          </p>
        )}

        <div className="candidatura-form-linha">
          <div className="candidatura-form-campo">
            <label htmlFor="cargo">Cargo</label>
            <input
              id="cargo"
              type="text"
              value={form.cargo}
              onChange={(evento) => setForm({ ...form, cargo: evento.target.value })}
              required
            />
          </div>

          <div className="candidatura-form-campo">
            <label htmlFor="empresaId">Empresa</label>
            <select
              id="empresaId"
              value={form.empresaId}
              onChange={(evento) => setForm({ ...form, empresaId: evento.target.value })}
              required
              disabled={emModoEdicao || semEmpresasCadastradas}
            >
              <option value="" disabled>
                Selecione...
              </option>
              {empresas.map((empresa) => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="candidatura-form-linha">
          <div className="candidatura-form-campo">
            <label htmlFor="linkVaga">Link da vaga</label>
            <input
              id="linkVaga"
              type="url"
              placeholder="https://..."
              value={form.linkVaga}
              onChange={(evento) => setForm({ ...form, linkVaga: evento.target.value })}
            />
          </div>

          {!emModoEdicao && (
            <div className="candidatura-form-campo">
              <label htmlFor="dataAplicacao">Data da aplicação</label>
              <input
                id="dataAplicacao"
                type="date"
                value={form.dataAplicacao}
                onChange={(evento) => setForm({ ...form, dataAplicacao: evento.target.value })}
              />
            </div>
          )}
        </div>

        <div className="candidatura-form-linha">
          <div className="candidatura-form-campo">
            <label htmlFor="salarioPretendido">Salário pretendido</label>
            <input
              id="salarioPretendido"
              type="number"
              min="0"
              step="0.01"
              value={form.salarioPretendido}
              onChange={(evento) => setForm({ ...form, salarioPretendido: evento.target.value })}
            />
          </div>

          <div className="candidatura-form-campo">
            <label htmlFor="salarioOferecido">Salário oferecido</label>
            <input
              id="salarioOferecido"
              type="number"
              min="0"
              step="0.01"
              value={form.salarioOferecido}
              onChange={(evento) => setForm({ ...form, salarioOferecido: evento.target.value })}
            />
          </div>
        </div>

        <div className="candidatura-form-campo">
          <label htmlFor="notas">Notas</label>
          <textarea
            id="notas"
            rows={2}
            value={form.notas}
            onChange={(evento) => setForm({ ...form, notas: evento.target.value })}
          />
        </div>

        {erroForm && <p className="candidaturas-erro">{erroForm}</p>}

        <div className="candidatura-form-acoes">
          <button type="submit" disabled={enviando || semEmpresasCadastradas}>
            {enviando ? 'Salvando...' : emModoEdicao ? 'Salvar alterações' : 'Adicionar candidatura'}
          </button>
          {emModoEdicao && (
            <button type="button" className="candidatura-form-cancelar" onClick={cancelarEdicao}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="candidaturas-cabecalho">
        <div className="candidaturas-filtro">
          <label htmlFor="filtroStatus">Status</label>
          <select
            id="filtroStatus"
            value={filtroStatus}
            onChange={(evento) => setFiltroStatus(evento.target.value as FiltroStatus)}
          >
            <option value="Todos">Todos</option>
            {STATUS_CANDIDATURA.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABEL[status]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {carregando && <p>Carregando candidaturas...</p>}
      {erro && <p className="candidaturas-erro">{erro}</p>}

      {!carregando && !erro && candidaturas.length === 0 && (
        <p>Nenhuma candidatura cadastrada ainda.</p>
      )}

      {!carregando && !erro && candidaturas.length > 0 && candidaturasFiltradas.length === 0 && (
        <p>Nenhuma candidatura com esse status.</p>
      )}

      {!carregando && candidaturasFiltradas.length > 0 && (
        <div className="tabela-scroll">
          <table className="candidaturas-tabela">
            <thead>
              <tr>
                <th>Cargo</th>
                <th>Empresa</th>
                <th>Status</th>
                <th>Aplicada em</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {candidaturasFiltradas.map((candidatura) => (
                <tr key={candidatura.id}>
                  <td>
                    {candidatura.linkVaga ? (
                      <a href={candidatura.linkVaga} target="_blank" rel="noreferrer">
                        {candidatura.cargo}
                      </a>
                    ) : (
                      candidatura.cargo
                    )}
                  </td>
                  <td>{candidatura.nomeEmpresa}</td>
                  <td>
                    <span className={`status-badge status-badge-${candidatura.status}`}>
                      {STATUS_LABEL[candidatura.status]}
                    </span>
                  </td>
                  <td>{new Date(candidatura.dataAplicacao).toLocaleDateString('pt-BR')}</td>
                  <td className="candidaturas-tabela-acoes">
                    <Link to={`/candidaturas/${candidatura.id}`} className="candidatura-editar">
                      Detalhes
                    </Link>
                    <button type="button" className="candidatura-editar" onClick={() => iniciarEdicao(candidatura)}>
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
