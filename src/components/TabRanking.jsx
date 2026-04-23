import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
)

export default function TabRanking() {
  const [rankingDia, setRankingDia] = useState([])
  const [rankingMes, setRankingMes] = useState([])
  const [rankingAtendDia, setRankingAtendDia] = useState([])
  const [rankingAtendMes, setRankingAtendMes] = useState([])
  const [rankingMargemDia, setRankingMargemDia] = useState([])
  const [rankingMargemMes, setRankingMargemMes] = useState([])
  const [rankingDescontoDia, setRankingDescontoDia] = useState([])
  const [rankingDescontoMes, setRankingDescontoMes] = useState([])
  const [rankingFreteDia, setRankingFreteDia] = useState([])
  const [rankingFreteMes, setRankingFreteMes] = useState([])
  const [erro, setErro] = useState('')
  const [dataSelecionada, setDataSelecionada] = useState(
    new Date().toISOString().slice(0, 10)
  )

  async function carregarRanking() {
    setErro('')

    const { data: vendedores, error: erroVendedores } = await supabase
      .from('vendedores')
      .select('*')

    if (erroVendedores) {
      setErro(erroVendedores.message)
      return
    }

    const { data: vendas, error: erroVendas } = await supabase
      .from('vendas')
      .select('*')

    if (erroVendas) {
      setErro(erroVendas.message)
      return
    }

    const mesRef = dataSelecionada.slice(0, 7)

    const listaDia = (vendedores || []).map((v) => {
      const vendasDoVendedor = (vendas || []).filter(
        (item) => item.vendedor_id === v.id && item.data === dataSelecionada
      )

      const totalVendido = vendasDoVendedor.reduce(
        (soma, item) => soma + Number(item.valor || 0),
        0
      )

      const totalAtendimentos = vendasDoVendedor.reduce(
        (soma, item) => soma + Number(item.atendimentos || 0),
        0
      )

      const totalMargem = vendasDoVendedor.reduce(
        (soma, item) => soma + Number(item.margem || 0),
        0
      )

      const totalDesconto = vendasDoVendedor.reduce(
        (soma, item) => soma + Number(item.desconto || 0),
        0
      )

      const totalFrete = vendasDoVendedor.reduce(
        (soma, item) => soma + Number(item.frete || 0),
        0
      )

      const percentualMeta =
        Number(v.meta_diaria || 0) > 0
          ? (totalVendido / Number(v.meta_diaria)) * 100
          : 0

      return {
        ...v,
        totalVendido,
        totalAtendimentos,
        totalMargem,
        totalDesconto,
        totalFrete,
        percentualMeta,
      }
    })

    const listaMes = (vendedores || []).map((v) => {
      const vendasDoVendedor = (vendas || []).filter(
        (item) =>
          item.vendedor_id === v.id &&
          String(item.data || '').slice(0, 7) === mesRef
      )

      const totalVendido = vendasDoVendedor.reduce(
        (soma, item) => soma + Number(item.valor || 0),
        0
      )

      const totalAtendimentos = vendasDoVendedor.reduce(
        (soma, item) => soma + Number(item.atendimentos || 0),
        0
      )

      const totalMargem = vendasDoVendedor.reduce(
        (soma, item) => soma + Number(item.margem || 0),
        0
      )

      const totalDesconto = vendasDoVendedor.reduce(
        (soma, item) => soma + Number(item.desconto || 0),
        0
      )

      const totalFrete = vendasDoVendedor.reduce(
        (soma, item) => soma + Number(item.frete || 0),
        0
      )

      const percentualMeta =
        Number(v.meta_mensal || 0) > 0
          ? (totalVendido / Number(v.meta_mensal)) * 100
          : 0

      return {
        ...v,
        totalVendido,
        totalAtendimentos,
        totalMargem,
        totalDesconto,
        totalFrete,
        percentualMeta,
      }
    })

    setRankingDia([...listaDia].sort((a, b) => b.totalVendido - a.totalVendido))
    setRankingMes([...listaMes].sort((a, b) => b.totalVendido - a.totalVendido))

    setRankingAtendDia(
      [...listaDia].sort((a, b) => b.totalAtendimentos - a.totalAtendimentos)
    )
    setRankingAtendMes(
      [...listaMes].sort((a, b) => b.totalAtendimentos - a.totalAtendimentos)
    )

    setRankingMargemDia(
      [...listaDia].sort((a, b) => b.totalMargem - a.totalMargem)
    )
    setRankingMargemMes(
      [...listaMes].sort((a, b) => b.totalMargem - a.totalMargem)
    )

    setRankingDescontoDia(
      [...listaDia].sort((a, b) => a.totalDesconto - b.totalDesconto)
    )
    setRankingDescontoMes(
      [...listaMes].sort((a, b) => a.totalDesconto - b.totalDesconto)
    )

    setRankingFreteDia(
      [...listaDia].sort((a, b) => b.totalFrete - a.totalFrete)
    )
    setRankingFreteMes(
      [...listaMes].sort((a, b) => b.totalFrete - a.totalFrete)
    )
  }

  useEffect(() => {
    carregarRanking()
  }, [dataSelecionada])

  function formatMoney(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  function getCorPercentual(valor) {
    if (valor >= 100) return '#166534'
    if (valor >= 80) return '#a16207'
    if (valor >= 50) return '#c2410c'
    return '#991b1b'
  }

  function getBgPercentual(valor) {
    if (valor >= 100) return '#dcfce7'
    if (valor >= 80) return '#fef3c7'
    if (valor >= 50) return '#ffedd5'
    return '#fee2e2'
  }

  function getStatus(valor) {
    if (valor >= 100) return 'Bateu meta'
    if (valor >= 80) return 'Ritmo bom'
    if (valor >= 50) return 'Atenção'
    return 'Crítico'
  }

  function renderLista(titulo, lista, campo, tipo = 'money', mostrarPercentual = false) {
    return (
      <div className="info-box" style={{ display: 'grid', gap: 12 }}>
        <h3 style={{ margin: 0 }}>{titulo}</h3>

        {lista.map((v, index) => (
          <div
            key={`${titulo}-${v.id}`}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              padding: '10px 0',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>
                {index + 1}º - {v.nome}
              </div>

              {mostrarPercentual && (
                <div
                  style={{
                    marginTop: 6,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: getBgPercentual(v.percentualMeta),
                    color: getCorPercentual(v.percentualMeta),
                    padding: '6px 10px',
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  <span>{v.percentualMeta.toFixed(1)}%</span>
                  <span>•</span>
                  <span>{getStatus(v.percentualMeta)}</span>
                </div>
              )}
            </div>

            <div style={{ color: '#374151', fontWeight: 600 }}>
              {tipo === 'money'
                ? formatMoney(v[campo])
                : Number(v[campo] || 0)}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <h2 className="section-title">Ranking</h2>

      <div
        className="info-box"
        style={{
          marginBottom: 20,
          display: 'grid',
          gap: 10,
        }}
      >
        <div style={{ fontWeight: 700 }}>
          Data de referência do ranking
        </div>

        <input
          type="date"
          value={dataSelecionada}
          onChange={(e) => setDataSelecionada(e.target.value)}
          style={{
            padding: 12,
            borderRadius: 10,
            border: '1px solid #d1d5db',
          }}
        />
      </div>

      {erro && (
        <div
          style={{
            marginBottom: 16,
            background: '#fee2e2',
            color: '#991b1b',
            padding: 12,
            borderRadius: 10,
            fontWeight: 600,
          }}
        >
          Erro: {erro}
        </div>
      )}

      <div style={{ display: 'grid', gap: 16 }}>
        {renderLista('🏆 Ranking de vendas do dia', rankingDia, 'totalVendido', 'money', true)}
        {renderLista('📅 Ranking de vendas do mês', rankingMes, 'totalVendido', 'money', true)}

        {renderLista('📞 Ranking de atendimentos do dia', rankingAtendDia, 'totalAtendimentos', 'number')}
        {renderLista('🗓️ Ranking de atendimentos do mês', rankingAtendMes, 'totalAtendimentos', 'number')}

        {renderLista('💰 Melhor margem do dia', rankingMargemDia, 'totalMargem')}
        {renderLista('💰 Melhor margem do mês', rankingMargemMes, 'totalMargem')}

        {renderLista('🎯 Menor desconto do dia', rankingDescontoDia, 'totalDesconto')}
        {renderLista('🎯 Menor desconto do mês', rankingDescontoMes, 'totalDesconto')}

        {renderLista('🚚 Frete do dia', rankingFreteDia, 'totalFrete')}
        {renderLista('🚚 Frete do mês', rankingFreteMes, 'totalFrete')}
      </div>
    </div>
  )
}
