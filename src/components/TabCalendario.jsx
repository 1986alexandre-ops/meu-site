import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
)

export default function TabCalendario() {
  const [vendedores, setVendedores] = useState([])
  const [vendedorId, setVendedorId] = useState('')
  const [data, setData] = useState('')
  const [tipo, setTipo] = useState('FD')
  const [msg, setMsg] = useState('')

  async function carregarVendedores() {
    const { data } = await supabase.from('vendedores').select('*')
    setVendedores(data || [])
  }

  useEffect(() => {
    carregarVendedores()
  }, [])

  async function salvar() {
    if (!vendedorId || !data) {
      setMsg('Preencha tudo')
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
    </div>
  )
}
