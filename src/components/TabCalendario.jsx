import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
)

export default function TabCalendario() {
  const [vendedores, setVendedores] = useState([])
  const [registros, setRegistros] = useState([])
  const [vendedorId, setVendedorId] = useState('')
  const [data, setData] = useState('')
  const [tipo, setTipo] = useState('FD')
  const [msg, setMsg] = useState('')

  async function carregarTudo() {
    const { data: vends } = await supabase
      .from('vendedores')
      .select('*')

    const { data: cal } = await supabase
      .from('calendario_vendedor')
      .select('*')
      .order('data', { ascending: false })

    setVendedores(vends || [])
    setRegistros(cal || [])
  }

  useEffect(() => {
    carregarTudo()
  }, [])

  async function salvar() {
    if (!vendedorId || !data) {
      setMsg('Preencha tudo')
      return
    }

    const jaExiste = registros.some(
      (r) => r.vendedor_id === vendedorId && r.data === data
    )

    if (jaExiste) {
      setMsg('Já existe lançamento para esse vendedor nessa data')
      return
    }

    const { error } = await supabase
      .from('calendario_vendedor')
      .insert([
        {
          vendedor_id: vendedorId,
          data,
          status_dia: tipo,
        },
      ])

    if (error) {
      setMsg(error.message)
      return
    }

    setMsg('Salvo com sucesso ✅')
    carregarTudo()
  }

  function nomeVendedor(id) {
    const v = vendedores.find((v) => v.id === id)
    return v ? v.nome : 'Desconhecido'
  }

  return (
    <div>
      <h2 className="section-title">Calendário</h2>

      <div className="info-box" style={{ display: 'grid', gap: 10 }}>
        <select
          value={vendedorId}
          onChange={(e) => setVendedorId(e.target.value)}
        >
          <option value="">Selecione vendedor</option>
          {vendedores.map((v) => (
            <option key={v.id} value={v.id}>
              {v.nome}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
        />

        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="FD">Folga Domingo (FD)</option>
          <option value="FE">Folga Extra (FE)</option>
        </select>

        <button onClick={salvar} className="tab-btn active">
          Salvar
        </button>

        {msg && <div>{msg}</div>}
      </div>

      <div
        className="info-box"
        style={{ marginTop: 20, display: 'grid', gap: 10 }}
      >
        <strong>Registros lançados</strong>

        {registros.map((r) => (
          <div
            key={r.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #e5e7eb',
              padding: '6px 0',
              gap: 10,
            }}
          >
            <span>{nomeVendedor(r.vendedor_id)}</span>
            <span>{r.data}</span>
            <span>{r.status_dia}</span>

            <button
              onClick={async () => {
                const confirmar = confirm('Deseja excluir esse lançamento?')

                if (!confirmar) return

                const { error } = await supabase
                  .from('calendario_vendedor')
                  .delete()
                  .eq('id', r.id)

                if (error) {
                  setMsg(error.message)
                  return
                }

                setMsg('Removido com sucesso 🗑️')
                carregarTudo()
              }}
              style={{
                border: 'none',
                background: '#fee2e2',
                color: '#991b1b',
                padding: '6px 10px',
                borderRadius: 8,
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
