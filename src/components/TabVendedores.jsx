import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
)

export default function TabVendedores() {
  const [vendedores, setVendedores] = useState([])
  const [vendas, setVendas] = useState([])
  const [novoNome, setNovoNome] = useState('')
  const [metaMensal, setMetaMensal] = useState('')
  const [metaDiaria, setMetaDiaria] = useState('')
  const [erro, setErro] = useState('')
  const [dataLancamento, setDataLancamento] = useState(
    new Date().toISOString().slice(0, 10)
  )
  const [vendaDia, setVendaDia] = useState({})
  const [atendDia, setAtendDia] = useState({})

  async function carregar() {
    setErro('')

    const { data, error } = await supabase
      .from('vendedores')
      .select('*')
      .order('nome', { ascending: true })

    if (error) {
      setErro(error.message)
      return
    }

    setVendedores(data || [])
  }

  async function carregarVendas() {
    setErro('')

    const { data, error } = await supabase
      .from('vendas')
      .select('*')

    if (error) {
      setErro(error.message)
      return
    }

    setVendas(data || [])
  }

  useEffect(() => {
    carregar()
    carregarVendas()
  }, [])

  async function adicionar() {
    if (!novoNome.trim()) return

    setErro('')

    const { error } = await supabase
      .from('vendedores')
      .insert([
        {
          nome: novoNome.trim(),
          meta_mensal: metaMensal ? Number(metaMensal) : null,
          meta_diaria: metaDiaria ? Number(metaDiaria) : null,
        },
      ])

    if (error) {
      setErro(error.message)
      return
    }

    setNovoNome('')
    setMetaMensal('')
    setMetaDiaria('')
    carregar()
  }

  async function remover(id) {
    setErro('')

    const { error } = await supabase
      .from('vendedores')
      .delete()
      .eq('id', id)

    if (error) {
      setErro(error.message)
      return
    }

    carregar()
  }

  async function registrarDia(vendedorId) {
    setErro('')

    const valor = vendaDia[vendedorId] ? Number(vendaDia[vendedorId]) : 0
    const atendimentos = atendDia[vendedorId] ? Number(atendDia[vendedorId]) : 0

    const { error } = await supabase
      .from('vendas')
      .insert([
        {
          vendedor_id: vendedorId,
          data: dataLancamento,
          valor,
          atendimentos,
        },
      ])

    if (error) {
      setErro(error.message)
      return
    }

    setVendaDia((prev) => ({ ...prev, [vendedorId]: '' }))
    setAtendDia((prev) => ({ ...prev, [vendedorId]: '' }))
    await carregarVendas()
    alert('Venda do dia registrada com sucesso')
  }

  function formatMoney(valor) {
    if (valor === null || valor === undefined || valor === '') {
      return 'Não definida'
    }

    return Number(valor).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  function getResumo(vendedorId) {
    const vendasDaData = vendas.filter(
      (item) => item.vendedor_id === vendedorId && item.data === dataLancamento
    )

    const valor = vendasDaData.reduce(
      (soma, item) => soma + Number(item.valor || 0),
      0
    )

    const atendimentos = vendasDaData.reduce(
      (soma, item) => soma + Number(item.atendimentos || 0),
      0
    )

    return { valor, atendimentos }
  }

  function getTicketMedio(vendedorId) {
    const resumo = getResumo(vendedorId)
    if (!resumo.atendimentos) return 0
    return resumo.valor / resumo.atendimentos
  }

  function getPercentualMeta(vendedor) {
    const resumo = getResumo(vendedor.id)
    const meta = Number(vendedor.meta_diaria || 0)
    if (!meta) return 0
    return (resumo.valor / meta) * 100
  }

  return (
    <div>
      <h2 className="section-title">Vendedores</h2>

      <div
        className="info-box"
        style={{
          marginBottom: 20,
          display: 'grid',
          gap: 10,
        }}
      >
        <input
          placeholder="Nome do vendedor"
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          style={{
            padding: 12,
            borderRadius: 10,
            border: '1px solid #d1d5db',
          }}
        />

        <input
          placeholder="Meta mensal"
          type="number"
          value={metaMensal}
          onChange={(e) => setMetaMensal(e.target.value)}
          style={{
            padding: 12,
            borderRadius: 10,
            border: '1px solid #d1d5db',
          }}
        />

        <input
          placeholder="Meta diária"
          type="number"
          value={metaDiaria}
          onChange={(e) => setMetaDiaria(e.target.value)}
          style={{
            padding: 12,
            borderRadius: 10,
            border: '1px solid #d1d5db',
          }}
        />

        <button onClick={adicionar} className="tab-btn active">
          Adicionar
        </button>
      </div>

      <div
        className="info-box"
        style={{
          marginBottom: 20,
          display: 'grid',
          gap: 10,
        }}
      >
        <div style={{ fontWeight: 700 }}>Data dos lançamentos</div>

        <input
          type="date"
          value={dataLancamento}
          onChange={(e) => setDataLancamento(e.target.value)}
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

      <div style={{ display: 'grid', gap: 12 }}>
        {vendedores.map((v) => {
          const resumo = getResumo(v.id)
          const ticket = getTicketMedio(v.id)
          const percentual = getPercentualMeta(v)

          return (
            <div
              key={v.id}
              className="info-box"
              style={{
                display: 'grid',
                gap: 12,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{v.nome}</div>

                  <div style={{ fontSize: 14, color: '#6b7280', marginTop: 6 }}>
                    Meta mensal: {formatMoney(v.meta_mensal)}
                  </div>

                  <div style={{ fontSize: 14, color: '#6b7280' }}>
                    Meta diária: {formatMoney(v.meta_diaria)}
                  </div>
                </div>

                <button
                  onClick={() => remover(v.id)}
                  style={{
                    border: 'none',
                    background: '#fee2e2',
                    color: '#991b1b',
                    padding: '10px 14px',
                    borderRadius: 10,
                    fontWeight: 700,
                  }}
                >
                  Excluir
                </button>
              </div>

              <div
                style={{
                  display: 'grid',
                  gap: 8,
                  background: '#f9fafb',
                  padding: 12,
                  borderRadius: 10,
                }}
              >
                <div>Vendido na data: {formatMoney(resumo.valor)}</div>
                <div>Atendimentos na data: {resumo.atendimentos}</div>
                <div>Ticket médio: {formatMoney(ticket)}</div>
                <div>% da meta diária: {percentual.toFixed(1)}%</div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gap: 10,
                  gridTemplateColumns: '1fr 1fr auto',
                }}
              >
                <input
                  type="number"
                  placeholder="Venda do dia"
                  value={vendaDia[v.id] || ''}
                  onChange={(e) =>
                    setVendaDia((prev) => ({
                      ...prev,
                      [v.id]: e.target.value,
                    }))
                  }
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    border: '1px solid #d1d5db',
                  }}
                />

                <input
                  type="number"
                  placeholder="Atendimentos"
                  value={atendDia[v.id] || ''}
                  onChange={(e) =>
                    setAtendDia((prev) => ({
                      ...prev,
                      [v.id]: e.target.value,
                    }))
                  }
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    border: '1px solid #d1d5db',
                  }}
                />

                <button
                  onClick={() => registrarDia(v.id)}
                  className="tab-btn active"
                >
                  Registrar dia
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
