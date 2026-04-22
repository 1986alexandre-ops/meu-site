import { useEffect, useState } from 'react'

function App() {
  const [msg, setMsg] = useState('Carregando...')

  useEffect(() => {
    setMsg('Dashboard iniciado 🚀')
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>{msg}</h1>
      <p>Seu sistema está online no Vercel</p>
    </div>
  )
}

export default App
