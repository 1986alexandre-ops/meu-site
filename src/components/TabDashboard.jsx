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
    percentualProjecao: 0,
    status: 'Sem dados',
    ticketMedio: 0,
  })

  const [dataRef, setDataRef] = useState(
    new Date().toISOString().slice(0, 10)
  )

  const [diasUteisMes, setDiasUteisMes] = useState('')
  const [diasUteisDecorridos, setDiasUteisDecorridos] = useState('')
  const [msg, setMsg] = useState('')

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

    const diasMes = Number(conf?.dias_uteis_mes || 0)
    const diasDecorridos = Number(conf?.dias_uteis_decorridos || 0)
    const dataReferencia = conf?.data_referencia || dataRef

    setDiasUteisMes(conf?.dias_uteis_mes ?? '')
    setDiasUteisDecorridos(conf?.dias_uteis_decorridos ?? '')

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

    const totalAtendimentos = vendasMes.reduce(
      (soma, v) => soma + Number(v.atendimentos || 0),
      0
    )

    const ticketMedio =
      totalAtendimentos > 0 ? realizado / totalAtendimentos : 0

    const projecao =
      diasDecorridos > 0
        ? (realizado / diasDecorridos) * diasMes
        : 0

    const falta = Math.max(0, metaTotal - realizado)
    const percentual = metaTotal > 0 ? (realizado / metaTotal) * 100 : 0
    const percentualProjecao =
      metaTotal > 0 ? (projecao / metaTotal) * 100 : 0

    let status = 'Crítico'
    if (percentualProjecao >= 100) status = 'Meta provável'
    else if (percentualProjecao >= 80) status = 'Ritmo bom'
    else if (percentualProjecao >= 50) status = 'Atenção'

    setResumo({
      meta: metaTotal,
      realizado,
      falta,
      projecao,
      percentual,
      percentualProjecao,
      status,
      ticketMedio,
    })
  }

  async function salvarConfiguracao() {
    const mesRef = dataRef.slice(0, 7)

    const { error } = await supabase
      .from('configuracao_mes')
      .upsert(
        {
          mes_ref: mesRef,
          dias_uteis_mes: diasUteisMes ? Number(diasUteisMes) : null,
          dias_uteis_decorridos: diasUteisDecorridos
            ? Number(diasUteisDecorridos)
            : null,
          data_referencia: dataRef,
        },
        { onConflict: 'mes_ref' }
      )

    if (error) {
      setMsg(error.message)
      return
    }

    setMsg('Configuração salva com sucesso ✅')
    carregar()
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
    if (status === 'Meta provável') return '#166534'
    if (status === 'Ritmo bom') return '#a16207'
    if (status === 'Atenção') return '#c2410c'
    return '#991b1b'
  }

  function getStatusBg(status) {
    if (status === 'Meta provável') return '#dcfce7'
    if (status === 'Ritmo bom') return '#fef3c7'
    if (status === 'Atenção') return '#ffedd5'
    return '#fee2e2'
  }

  return (
    <div>
      <h2 className="section-title">Dashboard</h2>

      <div className="info-box" style={{ marginBottom: 20, display: 'grid', gap: 10 }}>
        <div style={{ fontWeight: 700 }}>Configuração do mês</div>

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

        <input
          type="number"
          placeholder="Dias úteis do mês"
          value={diasUteisMes}
          onChange={(e) => setDiasUteisMes(e.target.value)}
          style={{
            padding: 12,
            borderRadius: 10,
            border: '1px solid #d1d5db',
          }}
        />

        <input
          type="number"
          placeholder="Dias úteis já passados"
          value={diasUteisDecorridos}
          onChange={(e) => setDiasUteisDecorridos(e.target.value)}
          style={{
            padding: 12,
            borderRadius: 10,
            border: '1px solid #d1d5db',
          }}
        />

        <button onClick={salvarConfiguracao} className="tab-btn active">
          Salvar configuração
        </button>

        {msg && <div>{msg}</div>}
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

        <div className="info-box">
          <div style={{ fontSize: 14, color: '#6b7280' }}>Ticket médio</div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>
            {money(resumo.ticketMedio)}
          </div>
        </div>
      </div>

      <div className="info-box" style={{ display: 'grid', gap: 12 }}>
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
          <span>{resumo.percentual.toFixed(1)}% realizado</span>
          <span>•</span>
          <span>{resumo.percentualProjecao.toFixed(1)}% projeção</span>
          <span>•</span>
          <span>{resumo.status}</span>
        </div>
      </div>
    </div>
  )
}
