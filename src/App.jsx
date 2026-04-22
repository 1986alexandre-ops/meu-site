import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null

function App() {
  const [msg, setMsg] = useState('Carregando dashboard...')
  const [erro, setErro] = useState('')
  const [vendedores, setVendedores] = useState([])
  const [novoNome, setNovoNome] = useState('')

  async function carregar() {
    if (!supabase) {
      setErro('Supabase não configurado')
      return
    }

    const { data, error } = await supabase
      .from('vendedores')
      .select('*')

    if (error) {
      setErro(error.message)
      return
    }

    setVendedores(data || [])
    setMsg('Dashboard conectado ao Supabase ✅')
  }

  useEffect(() => {
    carregar()
  }, [])

  async function adicionar() {
    if (!novoNome.trim()) return

    const { error } = await supabase
      .from('vendedores')
      .insert([{ nome: novoNome }])

    if (error) {
      setErro(error.message)
      return
    }

    setNovoNome('')
    carregar()
  }

  async function remover(id) {
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

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>{msg}</h1>

      {erro && (
        <p style={{ color: 'red' }}>
          Erro: {erro}
        </p>
      )}

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Nome do vendedor"
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
        />
        <button onClick={adicionar}>Adicionar</button>
      </div>

      <p>Total de vendedores: {vendedores.length}</p>

      <ul>
        {vendedores.map((v) => (
          <li key={v.id}>
            {v.nome}{' '}
            <button onClick={() => remover(v.id)}>
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
