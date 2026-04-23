import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
)

export default function TabDashboard() {
  const [resumo, setResumo] = useState({
    meta: 0,
    realizado: 0,
    falta: 0,
    projecao: 0,
    percentual: 0,
    status: 'Sem dados',
  })

  const [dataRef, setDataRef] = useState(
    new Date().toISOString().slice(0, 10)
  )

  async function carregar() {
    const mesRef = dataRef.slice(0, 7)

    const { data: vendedores } = await supabase
      .from('vendedores')
      .select('*')

    const { data: vendas } = await supabase
      .from('vendas')
      .select('*')

    const { data: config } = await supabase
      .from('configuracao_mes')
      .select('*')

    const conf = (config || []).find((c) => c.mes_ref === mesRef)

    const dataReferencia = conf?.data_referencia || dataRef
    const diasUteis = Number(conf?.dias_uteis_mes || 0)

    const metaTotal = (vendedores || []).reduce(
      (soma, v) => soma + Number(v.meta_mensal || 0),
      0
    )

    const vendasMes = (vendas || []).filter(
      (v) =>
        String(v.data || '').slice(0, 7) === mesRef &&
        String(v.data) <= String(dataReferencia)
    )

    const realizado = vendasMes.reduce(
      (soma, v) => soma + Number(v.valor || 0),
      0
    )

    const diaAtual = new Date(dataReferencia).getDate()
    const media = diaAtual > 0 ? realizado / diaAtual : 0
    const projecao = media * diasUteis
    const falta = Math.max(0, metaTotal - realizado)
    const percentual = metaTotal > 0 ? (realizado / metaTotal) * 100 : 0

    let status = 'Crítico'
    if (percentual >= 100) status = 'Meta batida'
    else if (percentual >= 80) status = 'Ritmo bom'
    else if (percentual >= 50) status = 'Atenção'

    setResumo({
      meta: metaTotal,
      realizado,
      falta,
      projecao,
      percentual,
      status,
    })
  }

  useEffect(() => {
    carregar()
  }, [dataRef])

  function money(v) {
    return Number(v || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  function getStatusColor(status) {
    if (status === 'Meta batida') return '#166534'
    if (status === 'Ritmo bom') return '#a16207'
    if (status === 'Atenção') return '#c2410c'
    return '#991b1b'
  }

  function getStatusBg(status) {
    if (status === 'Meta batida') return '#dcfce7'
    if (status === 'Ritmo bom') return '#fef3c7'
    if (status === 'Atenção') return '#ffedd5'
    return '#fee2e2'
  }

  return (
    <div>
      <h2 className="section-title">Dashboard</h2>

      <div className="info-box" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>
          Data de referência
        </div>

        <input
          type="date"
          value={dataRef}
          onChange={(e) => setDataRef(e.target.value)}
          style={{
            padding: 12,
            borderRadius: 10,
            border: '1px solid #d1d5db',
          }}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div className="info-box">
          <div style={{ fontSize: 14, color: '#6b7280' }}>Meta da loja</div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>
            {money(resumo.meta)}
          </div>
        </div>

        <div className="info-box">
          <div style={{ fontSize: 14, color: '#6b7280' }}>Realizado</div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>
            {money(resumo.realizado)}
          </div>
        </div>

        <div className="info-box">
          <div style={{ fontSize: 14, color: '#6b7280' }}>Falta para meta</div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>
            {money(resumo.falta)}
          </div>
        </div>

        <div className="info-box">
          <div style={{ fontSize: 14, color: '#6b7280' }}>Projeção do mês</div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>
            {money(resumo.projecao)}
          </div>
        </div>
      </div>

      <div
        className="info-box"
        style={{
          display: 'grid',
          gap: 12,
        }}
      >
        <div style={{ fontWeight: 700 }}>Status geral da loja</div>

        <div
          style={{
            display: 'inline-flex',
            width: 'fit-content',
            alignItems: 'center',
            gap: 8,
            background: getStatusBg(resumo.status),
            color: getStatusColor(resumo.status),
            padding: '8px 12px',
            borderRadius: 999,
            fontWeight: 700,
          }}
        >
          <span>{resumo.percentual.toFixed(1)}%</span>
          <span>•</span>
          <span>{resumo.status}</span>
        </div>
      </div>
    </div>
  )
}
