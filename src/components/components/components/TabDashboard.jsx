export default function TabDashboard({ kpis }) {
  const {
    realizado,
    faltaMeta,
    pctMeta,
    ticketMedio,
    atendimentosTotais,
    projecao,
    metaMensal,
  } = kpis

  function format(v) {
    return Number(v || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  return (
    <div>
      <h2>📊 Resumo Geral</h2>

      <div style={{ display: 'grid', gap: 10 }}>
        <div>Meta mensal: {format(metaMensal)}</div>
        <div>Realizado: {format(realizado)}</div>
        <div>Falta para meta: {format(faltaMeta)}</div>
        <div>% da meta: {pctMeta.toFixed(1)}%</div>
        <div>Projeção: {format(projecao)}</div>
        <div>Atendimentos: {atendimentosTotais}</div>
        <div>Ticket médio: {format(ticketMedio)}</div>
      </div>
    </div>
  )
}
