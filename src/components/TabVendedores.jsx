import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
)

export default function TabVendedores() {
  const [vendedores, setVendedores] = useState([])
  const [novoNome, setNovoNome] = useState('')
  const [metaMensal, setMetaMensal] = useState('')
  const [metaDiaria, setMetaDiaria] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [msg, setMsg] = useState('')

  async function carregar() {
    const { data } = await supabase
      .from('vendedores')
      .select('*')
      .order('nome', { ascending: true })

    setVendedores(data || [])
  }

  useEffect(() => {
    carregar()
  }, [])

  function limparFormulario() {
    setNovoNome('')
    setMetaMensal('')
    setMetaDiaria('')
    setEditandoId(null)
  }

  async function salvar() {
    if (!novoNome.trim()) {
      setMsg('Digite o nome')
      return
    }

    if (editandoId) {
      const { error } = await supabase
        .from('vendedores')
        .update({
          nome: novoNome,
          meta_mensal: metaMensal ? Number(metaMensal) : null,
          meta_diaria: metaDiaria ? Number(metaDiaria) : null,
        })
        .eq('id', editandoId)

      if (error) {
        setMsg(error.message)
        return
      }

      setMsg('Atualizado com sucesso ✏️')
    } else {
      const { error } = await supabase
        .from('vendedores')
        .insert([
          {
            nome: novoNome,
            meta_mensal: metaMensal ? Number(metaMensal) : null,
            meta_diaria: metaDiaria ? Number(metaDiaria) : null,
          },
        ])

      if (error) {
        setMsg(error.message)
        return
      }

      setMsg('Cadastrado com sucesso ✅')
    }

    limparFormulario()
    carregar()
  }

  function editar(v) {
    setEditandoId(v.id)
    setNovoNome(v.nome || '')
    setMetaMensal(v.meta_mensal || '')
    setMetaDiaria(v.meta_diaria || '')
    setMsg('Editando vendedor...')
  }

  async function remover(id) {
    const confirmar = confirm('Deseja excluir?')
    if (!confirmar) return

    const { error } = await supabase
      .from('vendedores')
      .delete()
      .eq('id', id)

    if (error) {
      setMsg(error.message)
      return
    }

    setMsg('Removido com sucesso 🗑️')
    carregar()
  }

  return (
    <div>
      <h2 className="section-title">Vendedores</h2>

      <div className="info-box" style={{ display: 'grid', gap: 10 }}>
        <input
          placeholder="Nome"
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
        />

        <input
          placeholder="Meta mensal"
          type="number"
          value={metaMensal}
          onChange={(e) => setMetaMensal(e.target.value)}
        />

        <input
          placeholder="Meta diária"
          type="number"
          value={metaDiaria}
          onChange={(e) => setMetaDiaria(e.target.value)}
        />

        <button onClick={salvar} className="tab-btn active">
          {editandoId ? 'Atualizar' : 'Adicionar'}
        </button>

        {editandoId && (
          <button onClick={limparFormulario}>
            Cancelar edição
          </button>
        )}

        {msg && <div>{msg}</div>}
      </div>

      <div
        className="info-box"
        style={{ marginTop: 20, display: 'grid', gap: 10 }}
      >
        <strong>Lista</strong>

        {vendedores.map((v) => (
          <div
            key={v.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 10,
              borderBottom: '1px solid #e5e7eb',
              padding: '6px 0',
            }}
          >
            <div>
              <strong>{v.nome}</strong>
              <div style={{ fontSize: 12 }}>
                Meta Mês: {v.meta_mensal || '-'} | Meta Dia: {v.meta_diaria || '-'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => editar(v)}>
                Editar
              </button>

              <button
                onClick={() => remover(v.id)}
                style={{
                  background: '#fee2e2',
                  color: '#991b1b',
                  border: 'none',
                  padding: '6px 10px',
                  borderRadius: 8,
                }}
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
