import { useState, useEffect } from 'react'
import { payments as paymentsAPI, drivers as driversAPI } from '../api/client.js'

const STATUS_BADGE = { paid:'badge-green', approved:'badge-blue', submitted:'badge-amber', draft:'badge-gray' }
const STATUS_PT    = { paid:'Pago', approved:'Aprovado', submitted:'Submetido', draft:'Rascunho' }

const EMPTY = {
  driver_id:'', driver_name:'', week_start:'', week_end:'', period_label:'',
  uber_gross:0, bolt_gross:0, other_platform_gross:0,
  vehicle_rental:0, via_verde_amount:0, myprio_amount:0, miio_amount:0,
  loan_installment:0, vehicle_purchase_installment:0,
  irs_retention:0, iva_amount:0, reimbursement_credit:0, goal_bonus:0,
  notes:'', status:'draft'
}

export default function Payments({ user }) {
  const [list, setList]       = useState([])
  const [driverList, setDriverList] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [form, setForm]       = useState(EMPTY)
  const [editId, setEditId]   = useState(null)
  const [saving, setSaving]   = useState(false)

  const load = () => paymentsAPI.list().then(r => { setList(r.entities || []); setLoading(false) })
  useEffect(() => {
    load()
    driversAPI.list({ status: 'active' }).then(r => setDriverList(r.entities || []))
  }, [])

  const fmt = n => (n||0).toLocaleString('pt-PT', {style:'currency',currency:'EUR',minimumFractionDigits:2})

  const calcNet = (f) => {
    const gross = (+f.uber_gross||0) + (+f.bolt_gross||0) + (+f.other_platform_gross||0)
    const deductions = (+f.vehicle_rental||0) + (+f.via_verde_amount||0) + (+f.myprio_amount||0) +
      (+f.miio_amount||0) + (+f.loan_installment||0) + (+f.vehicle_purchase_installment||0) +
      (+f.irs_retention||0) + (+f.iva_amount||0) - (+f.reimbursement_credit||0) - (+f.goal_bonus||0)
    return { gross, net: gross - deductions, upi: gross * 0.04 }
  }

  const save = async () => {
    setSaving(true)
    try {
      const { gross, net, upi } = calcNet(form)
      const d = driverList.find(d => d.id === form.driver_id)
      const payload = {
        ...form,
        driver_name: d?.full_name || form.driver_name,
        total_gross: gross,
        net_amount: Math.max(0, net),
        upi_earned: upi,
        total_deductions: gross - net,
      }
      if (editId) await paymentsAPI.update(editId, payload)
      else        await paymentsAPI.create(payload)
      await load(); setModal(false)
    } catch(e) { alert(e.response?.data?.detail || 'Erro') }
    finally { setSaving(false) }
  }

  const { gross, net, upi } = calcNet(form)

  if (loading) return <div className="loading-page"><div className="spinner" style={{width:32,height:32}}/></div>

  return (
    <div>
      <div className="page-header">
        <div><h1>Pagamentos</h1><div className="sub">{list.length} registos</div></div>
        {user.role !== 'driver' && (
          <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setEditId(null); setModal(true) }}>+ Novo pagamento</button>
        )}
      </div>

      <div className="card">
        {list.length === 0 ? (
          <div className="empty"><div className="icon">💶</div><p>Sem pagamentos registados</p></div>
        ) : (
          <table className="table">
            <thead><tr><th>Motorista</th><th>Período</th><th>Uber</th><th>Bolt</th><th>Bruto</th><th>Deduções</th><th>Líquido</th><th>UPI</th><th>Estado</th>{user.role !== 'driver' && <th></th>}</tr></thead>
            <tbody>
              {list.map(p => (
                <tr key={p.id}>
                  <td style={{fontWeight:500}}>{p.driver_name}</td>
                  <td style={{color:'var(--muted)',fontSize:12}}>{p.period_label || p.week_start}</td>
                  <td style={{fontFamily:'var(--mono)'}}>{fmt(p.uber_gross)}</td>
                  <td style={{fontFamily:'var(--mono)'}}>{fmt(p.bolt_gross)}</td>
                  <td style={{fontFamily:'var(--mono)',fontWeight:600}}>{fmt(p.total_gross)}</td>
                  <td style={{fontFamily:'var(--mono)',color:'var(--red)'}}>-{fmt(p.total_deductions)}</td>
                  <td style={{fontFamily:'var(--mono)',color:'var(--green)',fontWeight:600}}>{fmt(p.net_amount)}</td>
                  <td style={{fontFamily:'var(--mono)',color:'var(--indigo)'}}>{fmt(p.upi_earned)}</td>
                  <td><span className={`badge ${STATUS_BADGE[p.status]||'badge-gray'}`}>{STATUS_PT[p.status]||p.status}</span></td>
                  {user.role !== 'driver' && <td><button className="btn btn-ghost" style={{padding:'4px 10px',fontSize:12}} onClick={() => { setForm({...p}); setEditId(p.id); setModal(true) }}>Editar</button></td>}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" style={{maxWidth:600}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Editar pagamento' : 'Novo pagamento'}</h3>
              <button onClick={() => setModal(false)} style={{background:'none',border:'none',color:'var(--muted)',fontSize:20,cursor:'pointer'}}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group"><label>Motorista</label>
                  <select className="input" value={form.driver_id} onChange={e=>setForm({...form,driver_id:e.target.value})}>
                    <option value="">— Selecionar —</option>
                    {driverList.map(d=><option key={d.id} value={d.id}>{d.full_name}</option>)}
                  </select></div>
                <div className="form-group"><label>Período</label>
                  <input className="input" value={form.period_label||''} onChange={e=>setForm({...form,period_label:e.target.value})} placeholder="ex: Semana 09/03 - 15/03/2026" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Início semana</label><input className="input" type="date" value={form.week_start||''} onChange={e=>setForm({...form,week_start:e.target.value})} /></div>
                <div className="form-group"><label>Fim semana</label><input className="input" type="date" value={form.week_end||''} onChange={e=>setForm({...form,week_end:e.target.value})} /></div>
              </div>
              <div style={{background:'var(--surface2)',borderRadius:8,padding:12,marginBottom:14}}>
                <div style={{fontSize:12,fontWeight:600,color:'var(--muted)',marginBottom:10}}>RECEITAS</div>
                <div className="form-row">
                  <div className="form-group"><label>Uber (€)</label><input className="input" type="number" step="0.01" value={form.uber_gross||0} onChange={e=>setForm({...form,uber_gross:+e.target.value})} /></div>
                  <div className="form-group"><label>Bolt (€)</label><input className="input" type="number" step="0.01" value={form.bolt_gross||0} onChange={e=>setForm({...form,bolt_gross:+e.target.value})} /></div>
                </div>
              </div>
              <div style={{background:'var(--surface2)',borderRadius:8,padding:12,marginBottom:14}}>
                <div style={{fontSize:12,fontWeight:600,color:'var(--muted)',marginBottom:10}}>DEDUÇÕES</div>
                <div className="form-row">
                  <div className="form-group"><label>Renda viatura (€)</label><input className="input" type="number" step="0.01" value={form.vehicle_rental||0} onChange={e=>setForm({...form,vehicle_rental:+e.target.value})} /></div>
                  <div className="form-group"><label>Via Verde (€)</label><input className="input" type="number" step="0.01" value={form.via_verde_amount||0} onChange={e=>setForm({...form,via_verde_amount:+e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Miio/Prio (€)</label><input className="input" type="number" step="0.01" value={form.miio_amount||0} onChange={e=>setForm({...form,miio_amount:+e.target.value})} /></div>
                  <div className="form-group"><label>IRS (€)</label><input className="input" type="number" step="0.01" value={form.irs_retention||0} onChange={e=>setForm({...form,irs_retention:+e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>IVA (€)</label><input className="input" type="number" step="0.01" value={form.iva_amount||0} onChange={e=>setForm({...form,iva_amount:+e.target.value})} /></div>
                  <div className="form-group"><label>Prestação empréstimo (€)</label><input className="input" type="number" step="0.01" value={form.loan_installment||0} onChange={e=>setForm({...form,loan_installment:+e.target.value})} /></div>
                </div>
              </div>
              {/* Preview */}
              <div style={{background:'rgba(99,102,241,.1)',border:'1px solid rgba(99,102,241,.3)',borderRadius:8,padding:12,display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                <div style={{textAlign:'center'}}><div style={{fontSize:11,color:'var(--muted)'}}>BRUTO</div><div style={{fontFamily:'var(--mono)',fontWeight:700}}>{fmt(gross)}</div></div>
                <div style={{textAlign:'center'}}><div style={{fontSize:11,color:'var(--muted)'}}>LÍQUIDO</div><div style={{fontFamily:'var(--mono)',fontWeight:700,color:'var(--green)'}}>{fmt(net)}</div></div>
                <div style={{textAlign:'center'}}><div style={{fontSize:11,color:'var(--muted)'}}>UPI (4%)</div><div style={{fontFamily:'var(--mono)',fontWeight:700,color:'var(--indigo)'}}>{fmt(upi)}</div></div>
              </div>
              <div className="form-group" style={{marginTop:12}}>
                <label>Estado</label>
                <select className="input" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                  {Object.entries(STATUS_PT).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? <span className="spinner"/> : (editId ? 'Guardar' : 'Criar')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
