import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
)

export default function TabRanking() {
  const [rankingMargem, setRankingMargem] = useState([])
  const [rankingDesconto, setRankingDesconto] = useState([])
  const [rankingFrete, setRankingFrete] = useState([])
  const [erro, setErro] = useState('')

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

    const lista = (vendedores || []).map((v) => {
      const vendasDoVendedor = (vendas || []).filter(
        (item) => item.vendedor_id === v.id
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

      return {
        ...v,
        totalMargem,
        totalDesconto,
        totalFrete,
      }
    })

    setRankingMargem(
      [...lista].sort((a, b) => b.totalMargem - a.totalMargem)
    )

    setRankingDesconto(
      [...lista].sort((a, b) => a.totalDesconto - b.totalDesconto)
    )

    setRankingFrete(
      [...lista].sort((a, b) => b.totalFrete - a.totalFrete)
    )
  }

  useEffect(() => {
    carregarRanking()
  }, [])

  function formatMoney(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  function renderLista(titulo, lista, campo) {
    return (
      <div className="info-box" style={{ display: 'grid', gap: 12 }}>
        <h3 style={{ margin: 0 }}>{titulo}</h3>

        {lista.map((v, index) => (
          <div
            key={`${titulo}-${v.id}`}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <strong>{index + 1}º - {v.nome}</strong>
            <span>{formatMoney(v[campo])}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <h2 className="section-title">Ranking de Qualidade</h2>

      {erro && (
        <div style={{ color: 'red', marginBottom: 10 }}>
          Erro: {erro}
        </div>
      )}

      <div style={{ display: 'grid', gap: 16 }}>
        {renderLista('💰 Melhor Margem', rankingMargem, 'totalMargem')}
        {renderLista('🎯 Menor Desconto', rankingDesconto, 'totalDesconto')}
        {renderLista('🚚 Frete', rankingFrete, 'totalFrete')}
      </div>
    </div>
  )
}
