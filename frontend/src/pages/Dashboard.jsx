import { useState, useEffect } from 'react'
import { drivers, vehicles, payments, reports } from '../api/client'

export default function Dashboard({ user }) {
  const [stats, setStats]       = useState(null)
  const [recent, setRecent]     = useState([])
  const [vehStats, setVehStats] = useState({ total: 0, available: 0, assigned: 0 })
  const [vehList, setVehList]   = useState([])
  const [allPayments, setAllPayments] = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(null)

  useEffect(() => {
    Promise.all([
      reports.summary().catch(() => null),
      payments.list({ limit: 5 }).catch(() => ({ entities: [] })),
      payments.list({ limit: 1000 }).catch(() => ({ entities: [] })),
      vehicles.list({ limit: 100 }).catch(() => ({ entities: [] })),
    ]).then(([summary, pays, allPays, vehs]) => {
      setStats(summary)
      setRecent(pays.entities || [])
      setAllPayments(allPays.entities || [])
      const vs = vehs.entities || []
      setVehList(vs)
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
  const VEH_BADGE    = { available: 'badge-green', assigned: 'badge-blue', maintenance: 'badge-amber' }
  const VEH_PT       = { available: 'Disponível', assigned: 'Atribuído', maintenance: 'Manutenção' }

  if (loading) return <div className="loading-page"><div className="spinner" style={{width:32,height:32}}/></div>

  const upiByDriver = allPayments.reduce((acc, p) => {
    const name = p.driver_name || 'Desconhecido'
    if (!acc[name]) acc[name] = { name, total_upi: 0, count: 0 }
    acc[name].total_upi += (p.upi_earned || 0)
    acc[name].count += 1
    return acc
  }, {})

  const modalTitle = {
    faturation: 'Faturação total bruta',
    liquido:    'Total líquido pago',
    viaturas:   'Viaturas',
    upi:        'UPI gerado por motorista',
    payment:    'Detalhe do pagamento',
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <div className="sub">Bem-vindo, {user?.full_name?.split(' ')[0] || 'utilizador'}</div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="stat-card green" onClick={() => setModal({ type: 'faturation' })} style={{ cursor: 'pointer' }}>
          <div className="icon">🧾 </div>
          <div className="value">{fmt(stats?.total_gross)}</div>
          <div className="label">Faturação total bruta</div>
        </div>
        <div className="stat-card blue" onClick={() => setModal({ type: 'liquido' })} style={{ cursor: 'pointer' }}>
          <div className="icon">🏦 </div>
          <div className="value">{fmt(stats?.total_net)}</div>
          <div className="label">Total líquido pago</div>
        </div>
        <div className="stat-card amber" onClick={() => setModal({ type: 'viaturas' })} style={{ cursor: 'pointer' }}>
          <div className="icon">🚗 </div>
          <div className="value">{vehStats.total}</div>
          <div className="label">Viaturas — {vehStats.available} disponíveis</div>
        </div>
        <div className="stat-card indigo" onClick={() => setModal({ type: 'upi' })} style={{ cursor: 'pointer' }}>
          <div className="icon">💎 </div>
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
          <div className="empty"><div className="icon">🗂 </div><p>Sem pagamentos ainda</p></div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Motorista</th><th>Período</th><th>Bruto</th><th>Líquido</th><th>UPI</th><th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(p => (
                <tr key={p.id} onClick={() => setModal({ type: 'payment', data: p })} style={{ cursor: 'pointer' }}>
                  <td style={{ fontWeight: 500 }}>{p.driver_name}</td>
                  <td style={{ color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{p.period_label || p.week_start}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{fmt(p.total_gross)}</td>
                  <td style={{ fontFamily: 'var(--mono)', color: 'var(--green)' }}>{fmt(p.net_amount)}</td>
                  <td style={{ fontFamily: 'var(--mono)', color: 'var(--indigo)', fontWeight: 600 }}>{fmt(p.upi_earned)}</td>
                  <td><span className={`badge ${STATUS_BADGE[p.status] || 'badge-gray'}`}>{STATUS_PT[p.status] || p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalTitle[modal.type]}</h3>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--muted)' }}>✕</button>
            </div>
            <div className="modal-body">

              {modal.type === 'faturation' && (
                <table className="table">
                  <thead><tr><th>Motorista</th><th>Período</th><th>Bruto</th><th>Estado</th></tr></thead>
                  <tbody>
                    {allPayments.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 500 }}>{p.driver_name}</td>
                        <td style={{ color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{p.period_label || p.week_start}</td>
                        <td style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{fmt(p.total_gross)}</td>
                        <td><span className={`badge ${STATUS_BADGE[p.status] || 'badge-gray'}`}>{STATUS_PT[p.status] || p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {modal.type === 'liquido' && (
                <table className="table">
                  <thead><tr><th>Motorista</th><th>Período</th><th>Bruto</th><th>Deduções</th><th>Líquido</th><th>Estado</th></tr></thead>
                  <tbody>
                    {allPayments.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 500 }}>{p.driver_name}</td>
                        <td style={{ color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{p.period_label || p.week_start}</td>
                        <td style={{ fontFamily: 'var(--mono)' }}>{fmt(p.total_gross)}</td>
                        <td style={{ fontFamily: 'var(--mono)', color: 'var(--red)' }}>-{fmt(p.total_deductions)}</td>
                        <td style={{ fontFamily: 'var(--mono)', color: 'var(--green)', fontWeight: 600 }}>{fmt(p.net_amount)}</td>
                        <td><span className={`badge ${STATUS_BADGE[p.status] || 'badge-gray'}`}>{STATUS_PT[p.status] || p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {modal.type === 'viaturas' && (
                <table className="table">
                  <thead><tr><th>Matrícula</th><th>Marca / Modelo</th><th>Motorista</th><th>Estado</th></tr></thead>
                  <tbody>
                    {vehList.map(v => (
                      <tr key={v.id}>
                        <td style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{v.plate}</td>
                        <td>{v.brand} {v.model}</td>
                        <td style={{ color: 'var(--muted)' }}>{v.driver_name || '—'}</td>
                        <td><span className={`badge ${VEH_BADGE[v.status] || 'badge-gray'}`}>{VEH_PT[v.status] || v.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {modal.type === 'upi' && (
                <table className="table">
                  <thead><tr><th>Motorista</th><th>Nº Pagamentos</th><th>Total UPI</th></tr></thead>
                  <tbody>
                    {Object.values(upiByDriver).sort((a,b) => b.total_upi - a.total_upi).map(d => (
                      <tr key={d.name}>
                        <td style={{ fontWeight: 500 }}>{d.name}</td>
                        <td style={{ color: 'var(--muted)', textAlign: 'center' }}>{d.count}</td>
                        <td style={{ fontFamily: 'var(--mono)', color: 'var(--indigo)', fontWeight: 600 }}>{fmt(d.total_upi)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {modal.type === 'payment' && modal.data && (() => {
                const p = modal.data
                return (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                      <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: 12 }}>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>MOTORISTA</div>
                        <div style={{ fontWeight: 600 }}>{p.driver_name}</div>
                      </div>
                      <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: 12 }}>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>PERÍODO</div>
                        <div style={{ fontFamily: 'var(--mono)' }}>{p.period_label || p.week_start}</div>
                      </div>
                      <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: 12 }}>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>ESTADO</div>
                        <span className={`badge ${STATUS_BADGE[p.status] || 'badge-gray'}`}>{STATUS_PT[p.status] || p.status}</span>
                      </div>
                      <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: 12 }}>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>UPI</div>
                        <div style={{ fontFamily: 'var(--mono)', color: 'var(--indigo)', fontWeight: 700 }}>{fmt(p.upi_earned)}</div>
                      </div>
                    </div>
                    <div style={{ background: 'rgba(99,130,241,.1)', border: '1px solid rgba(99,130,241,.2)', borderRadius: 8, padding: 12, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                      <div><div style={{ fontSize: 11, color: 'var(--muted)' }}>BRUTO</div><div style={{ fontFamily: 'var(--mono)', fontWeight: 700 }}>{fmt(p.total_gross)}</div></div>
                      <div><div style={{ fontSize: 11, color: 'var(--muted)' }}>LÍQUIDO</div><div style={{ fontFamily: 'var(--mono)', color: 'var(--green)', fontWeight: 700 }}>{fmt(p.net_amount)}</div></div>
                      <div><div style={{ fontSize: 11, color: 'var(--muted)' }}>DEDUÇÕES</div><div style={{ fontFamily: 'var(--mono)', color: 'var(--red)', fontWeight: 700 }}>-{fmt(p.total_deductions)}</div></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {[
                        ['Uber (€)', p.uber_gross], ['Bolt (€)', p.bolt_gross],
                        ['Renda (€)', p.vehicle_rental], ['Via Verde (€)', p.via_verde_amount],
                        ['Miio/Prio (€)', p.miio_amount], ['IRS (€)', p.irs_retention],
                        ['IVA (€)', p.iva_amount], ['Empréstimo (€)', p.loan_installment],
                      ].filter(([, val]) => val != null && val !== 0).map(([label, val]) => (
                        <div key={label} style={{ background: 'var(--surface2)', borderRadius: 6, padding: '8px 12px', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{label}</span>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600 }}>{fmt(val)}</span>
                        </div>
                      ))}
                    </div>
                    {p.notes && (
                      <div style={{ marginTop: 12, background: 'var(--surface2)', borderRadius: 8, padding: 12 }}>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>NOTAS</div>
                        <div style={{ fontSize: 13 }}>{p.notes}</div>
                      </div>
                    )}
                  </div>
                )
              })()}

            </div>
          </div>
        </div>
      )}
    </div>
  )
}
