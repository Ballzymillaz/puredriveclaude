import { useState, useEffect } from 'react'
import { loans as loansAPI, drivers as driversAPI } from '../api/client.js'

const L_STATUS = { requested:'badge-amber', approved:'badge-blue', active:'badge-green', completed:'badge-gray', rejected:'badge-red' }
const L_STATUS_PT = { requested:'Solicitado', approved:'Aprovado', active:'Ativo', completed:'Concluído', rejected:'Rejeitado' }
const fmt = n => (n||0).toLocaleString('pt-PT',{style:'currency',currency:'EUR',minimumFractionDigits:2})

export default function Loans({ user }) {
  const [list, setList]     = useState([])
  const [drivers, setDrivers] = useState([])
  const [myDriver, setMyDriver] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal]   = useState(false)
  const [form, setForm]     = useState({ driver_id:'', amount:500, duration_weeks:4 })
  const [saving, setSaving] = useState(false)

  const load = () => loansAPI.list().then(r=>{setList(r.entities||[]);setLoading(false)})

  useEffect(()=>{
    load()
    if (user.role !== 'driver') {
      driversAPI.list({status:'active'}).then(r=>setDrivers(r.entities||[]))
    } else {
      // Driver: pré-remplir avec son propre ID
      driversAPI.list().then(r=>{
        const me = r.entities?.[0]
        if (me) { setMyDriver(me); setForm(f=>({...f, driver_id:me.id})) }
      })
    }
  },[])

  const approve = async(id)=>{await loansAPI.approve(id);load()}
  const reject  = async(id)=>{await loansAPI.reject(id);load()}

  const save = async()=>{
    setSaving(true)
    try{await loansAPI.create(form);await load();setModal(false)}
    catch(e){alert(e.response?.data?.detail||'Erro')}
    finally{setSaving(false)}
  }

  const weeklyEst = (form.amount*(1+0.01*form.duration_weeks)/form.duration_weeks)
  const totalEst  = form.amount*(1+0.01*form.duration_weeks)

  if (loading) return <div className="loading-page"><div className="spinner" style={{width:32,height:32}}/></div>

  return (
    <div>
      <div className="page-header">
        <div><h1>Empréstimos</h1><div className="sub">{list.length} registos</div></div>
        <button className="btn btn-primary" onClick={()=>setModal(true)}>+ Solicitar empréstimo</button>
      </div>

      <div className="card">
        {list.length===0 ? <div className="empty"><div className="icon">🏦</div><p>Sem empréstimos</p></div> : (
          <table className="table">
            <thead><tr><th>Motorista</th><th>Montante</th><th>Total c/juros</th><th>Prestação</th><th>Semanas</th><th>Estado</th>{user.role==='admin'&&<th></th>}</tr></thead>
            <tbody>{list.map(l=>(
              <tr key={l.id}>
                <td style={{fontWeight:500}}>{l.driver_name}</td>
                <td style={{fontFamily:'var(--mono)'}}>{fmt(l.amount)}</td>
                <td style={{fontFamily:'var(--mono)',color:'var(--amber)'}}>{fmt(l.total_with_interest)}</td>
                <td style={{fontFamily:'var(--mono)'}}>{fmt(l.weekly_installment)}</td>
                <td>{l.duration_weeks}</td>
                <td><span className={`badge ${L_STATUS[l.status]||'badge-gray'}`}>{L_STATUS_PT[l.status]||l.status}</span></td>
                {user.role==='admin'&&<td style={{display:'flex',gap:6}}>
                  {l.status==='requested'&&<>
                    <button className="btn btn-primary" style={{padding:'4px 10px',fontSize:12}} onClick={()=>approve(l.id)}>✓</button>
                    <button className="btn btn-danger" style={{padding:'4px 10px',fontSize:12}} onClick={()=>reject(l.id)}>✗</button>
                  </>}
                </td>}
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={()=>setModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h3>Solicitar empréstimo</h3><button onClick={()=>setModal(false)} style={{background:'none',border:'none',color:'var(--muted)',fontSize:20,cursor:'pointer'}}>×</button></div>
            <div className="modal-body">
              {user.role==='driver' ? (
                <div style={{background:'var(--surface2)',borderRadius:8,padding:12,marginBottom:14,fontSize:13}}>
                  <span style={{color:'var(--muted)'}}>Motorista: </span><strong>{myDriver?.full_name||'Você'}</strong>
                </div>
              ) : (
                <div className="form-group"><label>Motorista</label>
                  <select className="input" value={form.driver_id} onChange={e=>setForm({...form,driver_id:e.target.value})}>
                    <option value="">— Selecionar —</option>{drivers.map(d=><option key={d.id} value={d.id}>{d.full_name}</option>)}
                  </select>
                </div>
              )}
              <div className="form-row">
                <div className="form-group"><label>Montante (€)</label><input className="input" type="number" min={100} max={5000} value={form.amount} onChange={e=>setForm({...form,amount:+e.target.value})}/></div>
                <div className="form-group"><label>Duração (semanas)</label><input className="input" type="number" min={1} max={24} value={form.duration_weeks} onChange={e=>setForm({...form,duration_weeks:+e.target.value})}/></div>
              </div>
              <div style={{background:'rgba(99,102,241,.1)',border:'1px solid rgba(99,102,241,.2)',borderRadius:8,padding:14}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div><div style={{fontSize:11,color:'var(--muted)',marginBottom:4}}>TOTAL A PAGAR</div><div style={{fontFamily:'var(--mono)',fontWeight:700,fontSize:16}}>{fmt(totalEst)}</div></div>
                  <div><div style={{fontSize:11,color:'var(--muted)',marginBottom:4}}>PRESTAÇÃO/SEMANA</div><div style={{fontFamily:'var(--mono)',fontWeight:700,fontSize:16}}>{fmt(weeklyEst)}</div></div>
                </div>
                <div style={{marginTop:10,fontSize:11,color:'var(--faint)'}}>Juros: 1% por semana • {form.duration_weeks} semanas</div>
              </div>
            </div>
            <div className="modal-footer"><button className="btn btn-ghost" onClick={()=>setModal(false)}>Cancelar</button><button className="btn btn-primary" onClick={save} disabled={saving}>{saving?<span className="spinner"/>:'Solicitar'}</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
