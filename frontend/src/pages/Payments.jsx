import { useState, useEffect } from 'react'
import { payments as paymentsAPI, drivers as driversAPI } from '../api/client.js'

const STATUS_BADGE = { paid:'badge-green', approved:'badge-blue', submitted:'badge-amber', draft:'badge-gray' }
const STATUS_PT    = { paid:'Pago', approved:'Aprovado', submitted:'Submetido', draft:'Rascunho' }
const fmt = n => (n||0).toLocaleString('pt-PT',{style:'currency',currency:'EUR',minimumFractionDigits:2})

function PaymentDetail({ p, onClose }) {
  const print = () => window.print()
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:640}} onClick={e=>e.stopPropagation()}>
        <div className="modal-header no-print">
          <h3>Detalhe do pagamento</h3>
          <div style={{display:'flex',gap:8}}>
            <button className="btn btn-ghost" style={{padding:'6px 12px',fontSize:12}} onClick={print}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Imprimir / PDF
            </button>
            <button onClick={onClose} style={{background:'none',border:'none',color:'var(--muted)',fontSize:20,cursor:'pointer'}}>×</button>
          </div>
        </div>
        <div className="modal-body" id="payment-detail-print">
          {/* Header */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,paddingBottom:16,borderBottom:'1px solid var(--border)'}}>
            <div>
              <div style={{fontSize:18,fontWeight:700}}>{p.driver_name}</div>
              <div style={{color:'var(--muted)',fontSize:13,marginTop:2}}>{p.period_label || p.week_start}</div>
            </div>
            <span className={`badge ${STATUS_BADGE[p.status]||'badge-gray'}`} style={{fontSize:13}}>{STATUS_PT[p.status]||p.status}</span>
          </div>

          {/* Receitas */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:8}}>Receitas</div>
            {[['Uber',p.uber_gross],['Bolt',p.bolt_gross],['Outras plataformas',p.other_platform_gross]].filter(([,v])=>v).map(([k,v])=>(
              <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid rgba(51,65,85,.3)',fontSize:13}}>
                <span style={{color:'var(--muted)'}}>{k}</span>
                <span style={{fontFamily:'var(--mono)',fontWeight:500}}>{fmt(v)}</span>
              </div>
            ))}
            <div style={{display:'flex',justifyContent:'space-between',padding:'8px 0',fontWeight:700}}>
              <span>Total Bruto</span>
              <span style={{fontFamily:'var(--mono)',color:'var(--green)'}}>{fmt(p.total_gross)}</span>
            </div>
          </div>

          {/* Deduções */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:8}}>Deduções</div>
            {[
              ['Renda viatura', p.vehicle_rental],
              ['Via Verde', p.via_verde_amount],
              ['MyPrio / Miio', p.miio_amount],
              ['IRS', p.irs_retention],
              ['IVA', p.iva_amount],
              ['Prestação empréstimo', p.loan_installment],
              ['Prestação compra viatura', p.vehicle_purchase_installment],
            ].filter(([,v])=>v).map(([k,v])=>(
              <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid rgba(51,65,85,.3)',fontSize:13}}>
                <span style={{color:'var(--muted)'}}>{k}</span>
                <span style={{fontFamily:'var(--mono)',color:'var(--red)'}}>-{fmt(v)}</span>
              </div>
            ))}
            {p.reimbursement_credit > 0 && (
              <div style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid rgba(51,65,85,.3)',fontSize:13}}>
                <span style={{color:'var(--muted)'}}>Reembolso / Crédito</span>
                <span style={{fontFamily:'var(--mono)',color:'var(--green)'}}>+{fmt(p.reimbursement_credit)}</span>
              </div>
            )}
            {p.goal_bonus > 0 && (
              <div style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid rgba(51,65,85,.3)',fontSize:13}}>
                <span style={{color:'var(--muted)'}}>Bónus ranking</span>
                <span style={{fontFamily:'var(--mono)',color:'var(--green)'}}>+{fmt(p.goal_bonus)}</span>
              </div>
            )}
            <div style={{display:'flex',justifyContent:'space-between',padding:'8px 0',fontWeight:700}}>
              <span>Total Deduções</span>
              <span style={{fontFamily:'var(--mono)',color:'var(--red)'}}>-{fmt(p.total_deductions)}</span>
            </div>
          </div>

          {/* Resumo */}
          <div style={{background:'rgba(99,102,241,.08)',border:'1px solid rgba(99,102,241,.2)',borderRadius:10,padding:16,display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:11,color:'var(--muted)',marginBottom:4}}>BRUTO</div>
              <div style={{fontFamily:'var(--mono)',fontWeight:700,fontSize:16}}>{fmt(p.total_gross)}</div>
            </div>
            <div style={{textAlign:'center',borderLeft:'1px solid var(--border)',borderRight:'1px solid var(--border)'}}>
              <div style={{fontSize:11,color:'var(--muted)',marginBottom:4}}>LÍQUIDO</div>
              <div style={{fontFamily:'var(--mono)',fontWeight:700,fontSize:16,color:'var(--green)'}}>{fmt(p.net_amount)}</div>
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:11,color:'var(--muted)',marginBottom:4}}>UPI (4%)</div>
              <div style={{fontFamily:'var(--mono)',fontWeight:700,fontSize:16,color:'var(--indigo)'}}>{fmt(p.upi_earned)}</div>
            </div>
          </div>

          {p.notes && <div style={{marginTop:14,padding:12,background:'var(--surface2)',borderRadius:8,fontSize:13,color:'var(--muted)'}}><strong>Notas:</strong> {p.notes}</div>}
        </div>
      </div>
    </div>
  )
}

const EMPTY = { driver_id:'', driver_name:'', week_start:'', week_end:'', period_label:'', uber_gross:0, bolt_gross:0, other_platform_gross:0, vehicle_rental:0, via_verde_amount:0, myprio_amount:0, miio_amount:0, loan_installment:0, vehicle_purchase_installment:0, irs_retention:0, iva_amount:0, reimbursement_credit:0, goal_bonus:0, notes:'', status:'draft' }

export default function Payments({ user }) {
  const [list, setList]           = useState([])
  const [driverList, setDriverList] = useState([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(false)
  const [detail, setDetail]       = useState(null)
  const [form, setForm]           = useState(EMPTY)
  const [editId, setEditId]       = useState(null)
  const [saving, setSaving]       = useState(false)

  const load = () => paymentsAPI.list().then(r => { setList(r.entities||[]); setLoading(false) })
  useEffect(() => {
    load()
    if (user.role !== 'driver') driversAPI.list({status:'active'}).then(r=>setDriverList(r.entities||[]))
  }, [])

  const calcNet = (f) => {
    const gross = (+f.uber_gross||0)+(+f.bolt_gross||0)+(+f.other_platform_gross||0)
    const ded   = (+f.vehicle_rental||0)+(+f.via_verde_amount||0)+(+f.miio_amount||0)+(+f.loan_installment||0)+(+f.vehicle_purchase_installment||0)+(+f.irs_retention||0)+(+f.iva_amount||0)-(+f.reimbursement_credit||0)-(+f.goal_bonus||0)
    return { gross, net: gross-ded, upi: gross*0.04 }
  }

  const save = async () => {
    setSaving(true)
    try {
      const { gross, net, upi } = calcNet(form)
      const d = driverList.find(d=>d.id===form.driver_id)
      const payload = { ...form, driver_name:d?.full_name||form.driver_name, total_gross:gross, net_amount:Math.max(0,net), upi_earned:upi, total_deductions:gross-net }
      if (editId) await paymentsAPI.update(editId, payload)
      else        await paymentsAPI.create(payload)
      await load(); setModal(false)
    } catch(e) { alert(e.response?.data?.detail||'Erro') }
    finally { setSaving(false) }
  }

  const { gross, net, upi } = calcNet(form)
  if (loading) return <div className="loading-page"><div className="spinner" style={{width:32,height:32}}/></div>

  return (
    <div>
      <div className="page-header">
        <div><h1>Pagamentos</h1><div className="sub">{list.length} registos</div></div>
        {user.role !== 'driver' && <button className="btn btn-primary" onClick={()=>{setForm(EMPTY);setEditId(null);setModal(true)}}>+ Novo pagamento</button>}
      </div>

      <div className="card">
        {list.length===0 ? <div className="empty"><div className="icon">💶</div><p>Sem pagamentos registados</p></div> : (
          <table className="table">
            <thead><tr><th>Motorista</th><th>Período</th><th>Bruto</th><th>Deduções</th><th>Líquido</th><th>UPI</th><th>Estado</th>{user.role!=='driver'&&<th></th>}</tr></thead>
            <tbody>
              {list.map(p=>(
                <tr key={p.id} onClick={()=>setDetail(p)} style={{cursor:'pointer'}}>
                  <td style={{fontWeight:500}}>{p.driver_name}</td>
                  <td style={{color:'var(--muted)',fontSize:12}}>{p.period_label||p.week_start}</td>
                  <td style={{fontFamily:'var(--mono)',fontWeight:600}}>{fmt(p.total_gross)}</td>
                  <td style={{fontFamily:'var(--mono)',color:'var(--red)'}}>-{fmt(p.total_deductions)}</td>
                  <td style={{fontFamily:'var(--mono)',color:'var(--green)',fontWeight:600}}>{fmt(p.net_amount)}</td>
                  <td style={{fontFamily:'var(--mono)',color:'var(--indigo)'}}>{fmt(p.upi_earned)}</td>
                  <td><span className={`badge ${STATUS_BADGE[p.status]||'badge-gray'}`}>{STATUS_PT[p.status]||p.status}</span></td>
                  {user.role!=='driver'&&<td onClick={e=>e.stopPropagation()}><button className="btn btn-ghost" style={{padding:'4px 10px',fontSize:12}} onClick={()=>{setForm({...p});setEditId(p.id);setModal(true)}}>Editar</button></td>}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {detail && <PaymentDetail p={detail} onClose={()=>setDetail(null)} />}

      {modal && (
        <div className="modal-overlay" onClick={()=>setModal(false)}>
          <div className="modal" style={{maxWidth:600}} onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h3>{editId?'Editar pagamento':'Novo pagamento'}</h3><button onClick={()=>setModal(false)} style={{background:'none',border:'none',color:'var(--muted)',fontSize:20,cursor:'pointer'}}>×</button></div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group"><label>Motorista</label>
                  <select className="input" value={form.driver_id} onChange={e=>setForm({...form,driver_id:e.target.value})}>
                    <option value="">— Selecionar —</option>{driverList.map(d=><option key={d.id} value={d.id}>{d.full_name}</option>)}
                  </select></div>
                <div className="form-group"><label>Período</label><input className="input" value={form.period_label||''} onChange={e=>setForm({...form,period_label:e.target.value})} placeholder="ex: Semana 09/03 - 15/03"/></div>
              </div>
              <div style={{background:'var(--surface2)',borderRadius:8,padding:12,marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:700,color:'var(--muted)',marginBottom:8}}>RECEITAS</div>
                <div className="form-row">
                  <div className="form-group"><label>Uber (€)</label><input className="input" type="number" step="0.01" value={form.uber_gross||0} onChange={e=>setForm({...form,uber_gross:+e.target.value})}/></div>
                  <div className="form-group"><label>Bolt (€)</label><input className="input" type="number" step="0.01" value={form.bolt_gross||0} onChange={e=>setForm({...form,bolt_gross:+e.target.value})}/></div>
                </div>
              </div>
              <div style={{background:'var(--surface2)',borderRadius:8,padding:12,marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:700,color:'var(--muted)',marginBottom:8}}>DEDUÇÕES</div>
                <div className="form-row">
                  <div className="form-group"><label>Renda (€)</label><input className="input" type="number" step="0.01" value={form.vehicle_rental||0} onChange={e=>setForm({...form,vehicle_rental:+e.target.value})}/></div>
                  <div className="form-group"><label>Via Verde (€)</label><input className="input" type="number" step="0.01" value={form.via_verde_amount||0} onChange={e=>setForm({...form,via_verde_amount:+e.target.value})}/></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Miio/Prio (€)</label><input className="input" type="number" step="0.01" value={form.miio_amount||0} onChange={e=>setForm({...form,miio_amount:+e.target.value})}/></div>
                  <div className="form-group"><label>IRS (€)</label><input className="input" type="number" step="0.01" value={form.irs_retention||0} onChange={e=>setForm({...form,irs_retention:+e.target.value})}/></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>IVA (€)</label><input className="input" type="number" step="0.01" value={form.iva_amount||0} onChange={e=>setForm({...form,iva_amount:+e.target.value})}/></div>
                  <div className="form-group"><label>Prestação empréstimo (€)</label><input className="input" type="number" step="0.01" value={form.loan_installment||0} onChange={e=>setForm({...form,loan_installment:+e.target.value})}/></div>
                </div>
              </div>
              <div style={{background:'rgba(99,102,241,.1)',border:'1px solid rgba(99,102,241,.2)',borderRadius:8,padding:12,display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:12}}>
                <div style={{textAlign:'center'}}><div style={{fontSize:11,color:'var(--muted)'}}>BRUTO</div><div style={{fontFamily:'var(--mono)',fontWeight:700}}>{fmt(gross)}</div></div>
                <div style={{textAlign:'center'}}><div style={{fontSize:11,color:'var(--muted)'}}>LÍQUIDO</div><div style={{fontFamily:'var(--mono)',fontWeight:700,color:'var(--green)'}}>{fmt(net)}</div></div>
                <div style={{textAlign:'center'}}><div style={{fontSize:11,color:'var(--muted)'}}>UPI</div><div style={{fontFamily:'var(--mono)',fontWeight:700,color:'var(--indigo)'}}>{fmt(upi)}</div></div>
              </div>
              <div className="form-group"><label>Estado</label>
                <select className="input" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                  {Object.entries(STATUS_PT).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer"><button className="btn btn-ghost" onClick={()=>setModal(false)}>Cancelar</button><button className="btn btn-primary" onClick={save} disabled={saving}>{saving?<span className="spinner"/>:(editId?'Guardar':'Criar')}</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
