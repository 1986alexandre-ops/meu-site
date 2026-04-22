import { useState } from 'react'
import TabDashboard from './components/TabDashboard'
import TabVendedores from './components/TabVendedores'

function App() {
  const [aba, setAba] = useState('dashboard')

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>Meu Sistema</h1>

      {/* MENU */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setAba('dashboard')}>
          Dashboard
        </button>

        <button onClick={() => setAba('vendedores')}>
          Vendedores
        </button>
      </div>

      {/* CONTEÚDO */}
      {aba === 'dashboard' && <TabDashboard />}
      {aba === 'vendedores' && <TabVendedores />}
    </div>
  )
}

export default App
