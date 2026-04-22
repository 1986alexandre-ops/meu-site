export default function TabVendedores({
  vendedores,
  diario,
  addVendedor,
  removeVendedor,
}) {
  async function handleAdd() {
    const nome = prompt('Nome do vendedor')
    if (!nome) return

    try {
      await addVendedor({ nome })
    } catch (err) {
      alert(err.message)
    }
  }

  function totalVendas(id) {
    return diario
      .filter((d) => d.vendedor_id === id)
      .reduce((s, d) => s + Number(d.faturamento_dia || 0), 0)
  }

  function totalAtendimentos(id) {
    return diario
      .filter((d) => d.vendedor_id === id)
      .reduce((s, d) => s + Number(d.atendimentos_dia || 0), 0)
  }

  function format(v) {
    return Number(v || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  return (
    <div>
      <h2>👥 Vendedores</h2>

      <button onClick={handleAdd}>+ Adicionar vendedor</button>

      <ul style={{ marginTop: 20 }}>
        {vendedores.map((v) => (
          <li key={v.id} style={{ marginBottom: 12 }}>
            <strong>{v.nome}</strong>
            <div>Vendas: {format(totalVendas(v.id))}</div>
            <div>Atendimentos: {totalAtendimentos(v.id)}</div>
            <button onClick={() => removeVendedor(v.id)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
