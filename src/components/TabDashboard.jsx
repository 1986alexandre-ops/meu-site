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

    setResumo({
      meta: metaTotal,
      realizado,
      falta,
      projecao,
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

  return (
    <div>
      <h2 className="section-title">Dashboard</h2>

      <div style={{ marginBottom: 20 }}>
        <input
          type="date"
          value={dataRef}
          onChange={(e) => setDataRef(e.target.value)}
        />
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        <div className="info-box">
          <strong>Meta da loja</strong>
          <div>{money(resumo.meta)}</div>
        </div>

        <div className="info-box">
          <strong>Realizado</strong>
          <div>{money(resumo.realizado)}</div>
        </div>

        <div className="info-box">
          <strong>Falta para meta</strong>
          <div>{money(resumo.falta)}</div>
        </div>

        <div className="info-box">
          <strong>Projeção do mês</strong>
          <div>{money(resumo.projecao)}</div>
        </div>
      </div>
    </div>
  )
}
