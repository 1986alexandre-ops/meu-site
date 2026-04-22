import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
)

export default function TabRanking() {
  const [ranking, setRanking] = useState([])
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

      const totalVendido = vendasDoVendedor.reduce(
        (soma, item) => soma + Number(item.valor || 0),
        0
      )

      const totalAtendimentos = vendasDoVendedor.reduce(
        (soma, item) => soma + Number(item.atendimentos || 0),
        0
      )

      const ticketMedio =
        totalAtendimentos > 0 ? totalVendido / totalAtendimentos : 0

      return {
        ...v,
        totalVendido,
        totalAtendimentos,
        ticketMedio,
      }
    })

    lista.sort((a, b) => b.totalVendido - a.totalVendido)
    setRanking(lista)
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

  return (
    <div>
      <h2 className="section-title">Ranking</h2>

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

      <div style={{ display: 'grid', gap: 12 }}>
        {ranking.map((v, index) => (
          <div
            key={v.id}
            className="info-box"
            style={{
              display: 'flex',
              justifyContent: 'space-between
