import { useState, useEffect } from 'react'
import { maintenance as maintAPI, vehicles as vehiclesAPI } from '../api/client.js'

const TYPES = ['revision','oil_change','tires','brakes','inspection','other']
const TYPES_PT = { revision:'Revisão', oil_change:'Óleo', tires:'Pneus', brakes:'Travões', inspection:'Inspeção', other:'Outro' }
const fmt = n => (n||0).toLocaleString('pt-PT',{style:'currency',currency:'EUR'})

export default function Maintenance({ user }) {
  const [list, setList]     = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]   = useState(false)
  const [detail, setDetail] = useState(null)
  const [form, setForm]     = useState({ vehicle_id:'', type:'revision', date:'', cost:0, description:'' })
  const [saving, setSaving] = useState(false)

  const load = () => maintAPI.list().then(r=>{setList(r.entities||[]);setLoading(false)})
  useEffect(()=>{ load(); vehiclesAPI.list().then(r=>setVehicles(r.entities||[])) },[])

  const save = async()=>{
    setSaving(true)
    try {
      const veh = vehicles.find(v=>v.id===form.vehicle_id)
      await maintAPI.create({...form, vehicle_plate: veh?.plate||''})
      await load(); setModal(false)
      setForm({ vehicle_id:'', type:'revision', date:'', cost:0, description:'' })
    } catch(e){ alert(e.response?.data?.detail||'Erro') }
    finally{ setSaving(false) }
  }

  if (loading) return <div className="loading-page"><div className="spinner" style={{width:32,height:32}}/></div>

  return (
    <div>
      <div className="page-header">
        <div><h1>Manutenção</h1><div className="sub">{list.length} registos</div></div>
        {user.role!=='driver' && <button className="btn btn-primary" onClick={()=>setModal(true)}>+ Novo registo</button>}
      </div>

      <div className="card">
        {list.length===0 ? <div className="empty"><div className="icon">🔧</div><p>Sem registos de manutenção</p></div> : (
          <table className="table">
            <thead><tr><th>Viatura</th><th>Tipo</th><th>Data</th><th>Custo</th><th>Descrição</th></tr></thead>
            <tbody>{list.map(m=>(
              <tr key={m.id} onClick={()=>setDetail(m)} style={{cursor:'pointer'}}>
                <td style={{fontWeight:500}}>{m.vehicle_plate||m.vehicle_id}</td>
                <td><span className="badge badge-blue">{TYPES_PT[m.type]||m.type}</span></td>
                <td style={{color:'var(--muted)',fontSize:12}}>{m.date}</td>
                <td style={{fontFamily:'var(--mono)'}}>{fmt(m.cost)}</td>
                <td style={{color:'var(--muted)',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.description}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>

      {/* Detail modal */}
      {detail && (
        <div className="modal-overlay" onClick={()=>setDetail(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalhe de manutenção</h3>
              <button onClick={()=>setDetail(null)} style={{background:'none',border:'none',color:'var(--muted)',fontSize:20,cursor:'pointer'}}>×</button>
            </div>
            <div className="modal-body">
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                {[['Viatura',detail.vehicle_plate||detail.vehicle_id],['Tipo',TYPES_PT[detail.type]||detail.type],['Data',detail.date],['Custo',fmt(detail.cost)]].map(([k,v])=>(
                  <div key={k}><div style={{fontSize:11,color:'var(--muted)',marginBottom:4}}>{k}</div><div style={{fontWeight:500}}>{v}</div></div>
                ))}
              </div>
              {detail.description && <div style={{marginTop:14,padding:12,background:'var(--surface2)',borderRadius:8,fontSize:13}}><strong>Descrição:</strong> {detail.description}</div>}
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      {modal && (
        <div className="modal-overlay" onClick={()=>setModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h3>Novo registo</h3><button onClick={()=>setModal(false)} style={{background:'none',border:'none',color:'var(--muted)',fontSize:20,cursor:'pointer'}}>×</button></div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group"><label>Viatura</label>
                  <select className="input" value={form.vehicle_id} onChange={e=>setForm({...form,vehicle_id:e.target.value})}>
                    <option value="">— Selecionar —</option>
                    {vehicles.map(v=><option key={v.id} value={v.id}>{v.plate} — {v.brand} {v.model}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Tipo</label>
                  <select className="input" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
                    {TYPES.map(t=><option key={t} value={t}>{TYPES_PT[t]}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Data</label><input className="input" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></div>
                <div className="form-group"><label>Custo (€)</label><input className="input" type="number" step="0.01" value={form.cost} onChange={e=>setForm({...form,cost:+e.target.value})}/></div>
              </div>
              <div className="form-group"><label>Descrição</label><textarea className="input" rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
            </div>
            <div className="modal-footer"><button className="btn btn-ghost" onClick={()=>setModal(false)}>Cancelar</button><button className="btn btn-primary" onClick={save} disabled={saving}>{saving?<span className="spinner"/>:'Criar'}</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
