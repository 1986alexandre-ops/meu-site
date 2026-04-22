export default function TabDashboard() {
  const cards = [
    { titulo: 'Meta mensal', valor: 'R$ 50.000' },
    { titulo: 'Realizado', valor: 'R$ 18.450' },
    { titulo: 'Falta para meta', valor: 'R$ 31.550' },
    { titulo: '% atingido', valor: '36,9%' },
  ]

  return (
    <div>
      <h2 className="section-title">Dashboard</h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          marginBottom: 20,
        }}
      >
        {cards.map((card) => (
          <div key={card.titulo} className="info-box">
            <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
              {card.titulo}
            </div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>
              {card.valor}
            </div>
          </div>
        ))}
      </div>

      <div className="info-box">
        <strong>Resumo geral</strong>
        <p style={{ marginBottom: 0 }}>
          Aqui vamos mostrar os indicadores principais da loja.
        </p>
      </div>
    </div>
  )
}
