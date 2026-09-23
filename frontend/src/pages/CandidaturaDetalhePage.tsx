import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { candidaturasApi } from '../api/candidaturasApi'
import { ApiError } from '../api/httpClient'
import type { Candidatura, HistoricoStatus, StatusCandidatura } from '../types/candidatura'
import { STATUS_CANDIDATURA, STATUS_LABEL } from '../types/candidatura'
import './CandidaturaDetalhe.css'

export function CandidaturaDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const candidaturaId = Number(id)

  const [candidatura, setCandidatura] = useState<Candidatura | null>(null)
  const [historico, setHistorico] = useState<HistoricoStatus[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const [novoStatus, setNovoStatus] = useState<StatusCandidatura>('Aplicado')
  const [atualizando, setAtualizando] = useState(false)
  const [erroStatus, setErroStatus] = useState<string | null>(null)

  useEffect(() => {
    let cancelado = false

    Promise.all([candidaturasApi.buscarPorId(candidaturaId), candidaturasApi.historico(candidaturaId)])
      .then(([dadosCandidatura, dadosHistorico]) => {
        if (cancelado) return
        setCandidatura(dadosCandidatura)
        setNovoStatus(dadosCandidatura.status)
        setHistorico(dadosHistorico)
      })
      .catch((erro) => {
        if (!cancelado) {
          setErro(erro instanceof ApiError ? erro.message : 'Não foi possível carregar a candidatura.')
        }
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })

    return () => {
      cancelado = true
    }
  }, [candidaturaId])

  async function handleAtualizarStatus() {
    if (!candidatura) return

    setErroStatus(null)
    setAtualizando(true)

    try {
      const candidaturaAtualizada = await candidaturasApi.mudarStatus(candidaturaId, novoStatus)
      setCandidatura(candidaturaAtualizada)
      // O PATCH devolve só a candidatura, não o histórico — recarrega a
      // lista para pegar a entrada gerada pelo backend nessa mudança.
      const historicoAtualizado = await candidaturasApi.historico(candidaturaId)
      setHistorico(historicoAtualizado)
    } catch (erro) {
      setErroStatus(erro instanceof ApiError ? erro.message : 'Não foi possível atualizar o status.')
    } finally {
      setAtualizando(false)
    }
  }

  if (carregando) {
    return <p>Carregando candidatura...</p>
  }

  if (erro || !candidatura) {
    return <p className="candidaturas-erro">{erro ?? 'Candidatura não encontrada.'}</p>
  }

  return (
    <div className="candidatura-detalhe-page">
      <Link to="/" className="candidatura-detalhe-voltar">
        ← Voltar para candidaturas
      </Link>

      <h2>{candidatura.cargo}</h2>
      <p className="candidatura-detalhe-empresa">{candidatura.nomeEmpresa}</p>

      <div className="candidatura-detalhe-info">
        <div>
          <span className="candidatura-detalhe-label">Status atual</span>
          <span className={`status-badge status-badge-${candidatura.status}`}>
            {STATUS_LABEL[candidatura.status]}
          </span>
        </div>

        <div>
          <span className="candidatura-detalhe-label">Aplicada em</span>
          <span>{new Date(candidatura.dataAplicacao).toLocaleDateString('pt-BR')}</span>
        </div>

        {candidatura.linkVaga && (
          <div>
            <span className="candidatura-detalhe-label">Link da vaga</span>
            <a href={candidatura.linkVaga} target="_blank" rel="noreferrer">
              {candidatura.linkVaga}
            </a>
          </div>
        )}

        {candidatura.salarioPretendido != null && (
          <div>
            <span className="candidatura-detalhe-label">Salário pretendido</span>
            <span>{candidatura.salarioPretendido}</span>
          </div>
        )}

        {candidatura.salarioOferecido != null && (
          <div>
            <span className="candidatura-detalhe-label">Salário oferecido</span>
            <span>{candidatura.salarioOferecido}</span>
          </div>
        )}

        {candidatura.notas && (
          <div>
            <span className="candidatura-detalhe-label">Notas</span>
            <span>{candidatura.notas}</span>
          </div>
        )}
      </div>

      <div className="candidatura-detalhe-mudar-status">
        <h3>Mudar status</h3>
        <div className="candidatura-detalhe-mudar-status-controles">
          <select value={novoStatus} onChange={(evento) => setNovoStatus(evento.target.value as StatusCandidatura)}>
            {STATUS_CANDIDATURA.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABEL[status]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAtualizarStatus}
            disabled={atualizando || novoStatus === candidatura.status}
          >
            {atualizando ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>
        {erroStatus && <p className="candidaturas-erro">{erroStatus}</p>}
      </div>

      <h3>Histórico de status</h3>
      {historico.length === 0 ? (
        <p>Nenhuma mudança de status registrada ainda.</p>
      ) : (
        <div className="tabela-scroll">
          <table className="candidaturas-tabela">
            <thead>
              <tr>
                <th>De</th>
                <th>Para</th>
                <th>Quando</th>
              </tr>
            </thead>
            <tbody>
              {historico.map((entrada) => (
                <tr key={entrada.id}>
                  <td>
                    <span className={`status-badge status-badge-${entrada.statusAnterior}`}>
                      {STATUS_LABEL[entrada.statusAnterior]}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-badge-${entrada.statusNovo}`}>
                      {STATUS_LABEL[entrada.statusNovo]}
                    </span>
                  </td>
                  <td>{new Date(entrada.dataMudanca).toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
