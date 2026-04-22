import { useEffect, useState } 
  from 'react'
import { createClient } from 
  '@supabase/supabase-js'

const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL
const supabaseKey = 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, 
                   supabaseKey)
    : null

function App() {
  const [msg, setMsg] = 
    useState('Carregando dashboard...')
  const [erro, setErro] = 
    useState('')
  const [vendedores, 
         setVendedores] = useState([])

  useEffect(() => {
    async function carregar() {
      if (!supabase) {
        setErro('Supabase não configurado')
        return
      }

      const { data, error } = 
        await supabase
        .from('vendedores')
        .select('*')

      if (error) {
        setErro(error.message)
        return
      }

      setVendedores(data || [])
      setMsg('Dashboard conectado ao Supabase ✅')
    }

    carregar()
  }, [])

  return (
    <div style={{ padding: 20, 
                 fontFamily: 'Arial' }}>
      <h1>{msg}</h1>

      {erro && (
        <p style={{ color: 
          'red' }}>
          Erro: {erro}
        </p>
      )}

      <p>Total de vendedores: 
        {vendedores.length}</p>

      <ul>
        {vendedores.map((v) => (
          <li key={v.id}>{v.nome}</li> 
    ))}
      </ul>
    </div>
  )
}

export default App
