import { useState } from 'react'
import TabDashboard from './components/TabDashboard'
import TabVendedores from './components/TabVendedores'
import TabRanking from './components/TabRanking'

function App() {
  const [aba, setAba] = useState('dashboard')

  return (
    <div className="app-shell">
      <div className="app-card">
        <h1 className="app-title">Radar Comercial</h1>
        <p className="app-subtitle">
          Controle de desempenho da equipe
        </p>

        <div className="tabs">
          <button
            className={`tab-btn ${aba === 'dashboard' ? 'active' : ''}`}
            onClick={() => setAba('dashboard')}
          >
            📊 Dashboard
          </button>

          <button
            className={`tab-btn ${aba === 'vendedores' ? 'active' : ''}`}
            onClick={() => setAba('vendedores')}
          >
            👥 Vendedores
          </button>

          <button
            className={`tab-btn ${aba === 'ranking' ? 'active' : ''}`}
            onClick={() => setAba('ranking')}
          >
            🏆 Ranking
          </button>
        </div>

        {aba === 'dashboard' && <TabDashboard />}
        {aba === 'vendedores' && <TabVendedores />}
        {aba === 'ranking' && <TabRanking />}
      </div>
    </div>
  )
}

export default App
