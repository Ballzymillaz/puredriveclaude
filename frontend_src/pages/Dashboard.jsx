import { useState, useEffect } from 'react'
import { drivers, vehicles, payments, reports } from '../api/client.js'

export default function Dashboard({ user }) {
  const [stats, setStats]   = useState(null)
  const [recent, setRecent] = useState([])
  const [vehStats, setVehStats] = useState({ total: 0, available: 0, assigned: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      reports.summary().catch(() => null),
      payments.list({ limit: 5 }).catch(() => ({ entities: [] })),
      vehicles.list({ limit: 100 }).catch(() => ({ entities: [] })),
    ]).then(([summary, pays, vehs]) => {
      setStats(summary)
      setRecent(pays.entities || [])
      const vs = vehs.entities || []
      setVehStats({
        total: vs.length,
        available: vs.filter(v => v.status === 'available').length,
        assigned: vs.filter(v => v.status === 'assigned').length,
      })
      setLoading(false)
    })
  }, [])

  const fmt = (n) => (n || 0).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 })
  const STATUS_BADGE = { paid: 'badge-green', approved: 'badge-blue', submitted: 'badge-amber', draft: 'badge-gray' }
  const STATUS_PT    = { paid: 'Pago', approved: 'Aprovado', submitted: 'Submetido', draft: 'Rascunho' }

  if (loading) return <div className="loading-page"><div className="spinner" style={{width:32,height:32}}/></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <div className="sub">Bem-vindo, {user.full_name?.split(' ')[0] || 'utilizador'}</div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="stat-card green">
          <div className="icon">💶</div>
          <div className="value">{fmt(stats?.total_gross)}</div>
          <div className="label">Faturação total bruta</div>
        </div>
        <div className="stat-card blue">
          <div className="icon">💳</div>
          <div className="value">{fmt(stats?.total_net)}</div>
          <div className="label">Total líquido pago</div>
        </div>
        <div className="stat-card amber">
          <div className="icon">🚗</div>
          <div className="value">{vehStats.total}</div>
          <div className="label">Viaturas — {vehStats.available} disponíveis</div>
        </div>
        <div className="stat-card indigo">
          <div className="icon">💎</div>
          <div className="value">{fmt(stats?.total_upi)}</div>
          <div className="label">UPI gerado</div>
        </div>
      </div>

      {/* Recent payments */}
      <div className="card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600 }}>Pagamentos recentes</h3>
        </div>
        {recent.length === 0 ? (
          <div className="empty"><div className="icon">💶</div><p>Sem pagamentos ainda</p></div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Motorista</th>
                <th>Período</th>
                <th>Bruto</th>
                <th>Líquido</th>
                <th>UPI</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500 }}>{p.driver_name}</td>
                  <td style={{ color: 'var(--muted)' }}>{p.period_label || p.week_start}</td>
                  <td style={{ fontFamily: 'var(--mono)' }}>{fmt(p.total_gross)}</td>
                  <td style={{ fontFamily: 'var(--mono)', color: 'var(--green)' }}>{fmt(p.net_amount)}</td>
                  <td style={{ fontFamily: 'var(--mono)', color: 'var(--indigo)' }}>{fmt(p.upi_earned)}</td>
                  <td><span className={`badge ${STATUS_BADGE[p.status] || 'badge-gray'}`}>{STATUS_PT[p.status] || p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
