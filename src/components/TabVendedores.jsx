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

  useEffect(() => {
    carregar()
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

  function formatMoney(valor) {
    if (valor === null || valor === undefined || valor === '') {
      return 'Não definida'
    }

    return Number(valor).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
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

        <button
          onClick={adicionar}
          className="tab-btn active"
        >
          Adicionar
        </button>
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
        {vendedores.map((v) => (
          <div
            key={v.id}
            className="info-box"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>
                {v.nome}
              </div>

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
        ))}
      </div>
    </div>
  )
}
