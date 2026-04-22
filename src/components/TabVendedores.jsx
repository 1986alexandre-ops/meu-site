import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
)

export default function TabVendedores() {
  const [vendedores, setVendedores] = useState([])
  const [novoNome, setNovoNome] = useState('')

  async function carregar() {
    const { data } = await supabase
      .from('vendedores')
      .select('*')

    setVendedores(data || [])
  }

  useEffect(() => {
    carregar()
  }, [])

  async function adicionar() {
    if (!novoNome.trim()) return

    await supabase
      .from('vendedores')
      .insert([{ nome: novoNome }])

    setNovoNome('')
    carregar()
  }

  async function remover(id) {
    await supabase
      .from('vendedores')
      .delete()
      .eq('id', id)

    carregar()
  }

  return (
    <div>
      <h2>Vendedores</h2>

      <input
        placeholder="Nome"
        value={novoNome}
        onChange={(e) => setNovoNome(e.target.value)}
      />
      <button onClick={adicionar}>Adicionar</button>

      <ul>
        {vendedores.map((v) => (
          <li key={v.id}>
            {v.nome}
            <button onClick={() => remover(v.id)}>❌</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
