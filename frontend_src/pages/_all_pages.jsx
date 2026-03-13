// ═══ LOANS ═══════════════════════════════════════════════════
import { useState, useEffect } from 'react'
import { loans as loansAPI, upi as upiAPI, purchases as purchasesAPI,
         maintenance as maintAPI, messages as msgsAPI,
         reports as reportsAPI, fleetManagers as fmAPI, users as usersAPI,
         drivers as driversAPI } from '../api/client.js'

const L_STATUS = { requested:'badge-amber', approved:'badge-blue', active:'badge-green', completed:'badge-gray', rejected:'badge-red' }
const L_STATUS_PT = { requested:'Solicitado', approved:'Aprovado', active:'Ativo', completed:'Concluído', rejected:'Rejeitado' }
const fmt = n => (n||0).toLocaleString('pt-PT',{style:'currency',currency:'EUR',minimumFractionDigits:2})

export function Loans({ user }) {
  const [list, setList] = useState([])
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ driver_id:'', amount:500, duration_weeks:4 })
  const [saving, setSaving] = useState(false)

  const load = () => loansAPI.list().then(r => { setList(r.entities||[]); setLoading(false) })
  useEffect(() => { load(); driversAPI.list({status:'active'}).then(r=>setDrivers(r.entities||[])) }, [])

  const approve = async (id) => { await loansAPI.approve(id); load() }
  const reject  = async (id) => { await loansAPI.reject(id);  load() }

  const save = async () => {
    setSaving(true)
    try { await loansAPI.create(form); await load(); setModal(false) }
    catch(e) { alert(e.response?.data?.detail||'Erro') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="loading-page"><div className="spinner" style={{width:32,height:32}}/></div>

  return (
    <div>
      <div className="page-header">
        <div><h1>Empréstimos</h1><div className="sub">{list.length} registos</div></div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Solicitar empréstimo</button>
      </div>
      <div className="card">
        {list.length === 0 ? <div className="empty"><div className="icon">🏦</div><p>Sem empréstimos</p></div> : (
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
                  {l.status==='requested'&&<><button className="btn btn-primary" style={{padding:'4px 10px',fontSize:12}} onClick={()=>approve(l.id)}>✓ Aprovar</button>
                  <button className="btn btn-danger" style={{padding:'4px 10px',fontSize:12}} onClick={()=>reject(l.id)}>✗ Rejeitar</button></>}
                </td>}
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
      {modal && <div className="modal-overlay" onClick={()=>setModal(false)}>
        <div className="modal" onClick={e=>e.stopPropagation()}>
          <div className="modal-header"><h3>Solicitar empréstimo</h3><button onClick={()=>setModal(false)} style={{background:'none',border:'none',color:'var(--muted)',fontSize:20,cursor:'pointer'}}>×</button></div>
          <div className="modal-body">
            <div className="form-group"><label>Motorista</label>
              <select className="input" value={form.driver_id} onChange={e=>setForm({...form,driver_id:e.target.value})}>
                <option value="">— Selecionar —</option>{drivers.map(d=><option key={d.id} value={d.id}>{d.full_name}</option>)}
              </select></div>
            <div className="form-row">
              <div className="form-group"><label>Montante (€)</label><input className="input" type="number" value={form.amount} onChange={e=>setForm({...form,amount:+e.target.value})} /></div>
              <div className="form-group"><label>Duração (semanas)</label><input className="input" type="number" min={1} max={24} value={form.duration_weeks} onChange={e=>setForm({...form,duration_weeks:+e.target.value})} /></div>
            </div>
            <div style={{background:'rgba(99,102,241,.1)',borderRadius:8,padding:12,fontSize:13,color:'var(--muted)'}}>
              💡 Total estimado: {fmt(form.amount * (1 + 0.01 * form.duration_weeks))} • Prestação: {fmt(form.amount * (1 + 0.01 * form.duration_weeks) / form.duration_weeks)}/semana
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={()=>setModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving?<span className="spinner"/>:'Solicitar'}</button>
          </div>
        </div>
      </div>}
    </div>
  )
}

// ═══ UPI ══════════════════════════════════════════════════════
export function UPI({ user }) {
  const [txs, setTxs] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { upiAPI.transactions().then(r=>{ setTxs(r.entities||[]); setLoading(false) }) }, [])
  const typeColor = { earned:'badge-green', credit:'badge-blue', debit:'badge-red' }
  const typePT    = { earned:'Ganho', credit:'Crédito', debit:'Débito' }
  if (loading) return <div className="loading-page"><div className="spinner" style={{width:32,height:32}}/></div>
  return (
    <div>
      <div className="page-header"><div><h1>UPI — Unidade de Participação Interna</h1><div className="sub">{txs.length} transações</div></div></div>
      <div className="card">
        {txs.length===0 ? <div className="empty"><div className="icon">💎</div><p>Sem transações UPI</p></div> : (
          <table className="table">
            <thead><tr><th>Motorista</th><th>Tipo</th><th>Montante</th><th>Fonte</th><th>Semana</th><th>Data</th></tr></thead>
            <tbody>{txs.map(t=>(
              <tr key={t.id}>
                <td style={{fontWeight:500}}>{t.driver_name}</td>
                <td><span className={`badge ${typeColor[t.type]||'badge-gray'}`}>{typePT[t.type]||t.type}</span></td>
                <td style={{fontFamily:'var(--mono)',color:'var(--indigo)',fontWeight:600}}>{fmt(t.amount)}</td>
                <td style={{color:'var(--muted)'}}>{t.source}</td>
                <td style={{fontSize:12,color:'var(--muted)'}}>{t.week_label}</td>
                <td style={{fontSize:12,color:'var(--faint)'}}>{t.created_date?.slice(0,10)}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ═══ PURCHASES ════════════════════════════════════════════════
export function Purchases({ user }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { purchasesAPI.list().then(r=>{ setList(r.entities||[]); setLoading(false) }) }, [])
  const approve = async (id) => { await purchasesAPI.approve(id); purchasesAPI.list().then(r=>setList(r.entities||[])) }
  if (loading) return <div className="loading-page"><div className="spinner" style={{width:32,height:32}}/></div>
  return (
    <div>
      <div className="page-header"><div><h1>Opção de Compra</h1><div className="sub">{list.length} pedidos</div></div></div>
      <div className="card">
        {list.length===0 ? <div className="empty"><div className="icon">🔑</div><p>Sem pedidos de compra</p></div> : (
          <table className="table">
            <thead><tr><th>Motorista</th><th>Viatura</th><th>Preço base</th><th>Total (×1.25)</th><th>Meses</th><th>Prestação</th><th>Estado</th>{user.role==='admin'&&<th></th>}</tr></thead>
            <tbody>{list.map(p=>(
              <tr key={p.id}>
                <td style={{fontWeight:500}}>{p.driver_name}</td>
                <td style={{fontFamily:'var(--mono)',fontSize:12}}>{p.vehicle_info}</td>
                <td style={{fontFamily:'var(--mono)'}}>{fmt(p.base_price)}</td>
                <td style={{fontFamily:'var(--mono)',color:'var(--amber)'}}>{fmt(p.total_price)}</td>
                <td>{p.duration_months}</td>
                <td style={{fontFamily:'var(--mono)'}}>{fmt(p.weekly_installment)}</td>
                <td><span className={`badge ${p.status==='active'?'badge-green':p.status==='requested'?'badge-amber':'badge-gray'}`}>{p.status}</span></td>
                {user.role==='admin'&&<td>{p.status==='requested'&&<button className="btn btn-primary" style={{padding:'4px 10px',fontSize:12}} onClick={()=>approve(p.id)}>Aprovar</button>}</td>}
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ═══ MAINTENANCE ══════════════════════════════════════════════
export function Maintenance({ user }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ vehicle_id:'', type:'revision', service_date:'', cost:0, description:'' })
  const [saving, setSaving] = useState(false)
  const load = () => maintAPI.list().then(r=>{ setList(r.entities||[]); setLoading(false) })
  useEffect(() => { load() }, [])
  const save = async () => {
    setSaving(true)
    try { await maintAPI.create(form); await load(); setModal(false) }
    catch(e) { alert(e.response?.data?.detail||'Erro') }
    finally { setSaving(false) }
  }
  if (loading) return <div className="loading-page"><div className="spinner" style={{width:32,height:32}}/></div>
  return (
    <div>
      <div className="page-header">
        <div><h1>Manutenção</h1><div className="sub">{list.length} registos</div></div>
        {user.role!=='driver'&&<button className="btn btn-primary" onClick={()=>setModal(true)}>+ Novo registo</button>}
      </div>
      <div className="card">
        {list.length===0 ? <div className="empty"><div className="icon">🔧</div><p>Sem registos de manutenção</p></div> : (
          <table className="table">
            <thead><tr><th>Viatura</th><th>Tipo</th><th>Data</th><th>Custo</th><th>Km</th><th>Próxima</th></tr></thead>
            <tbody>{list.map(r=>(
              <tr key={r.id}>
                <td style={{fontWeight:500}}>{r.vehicle_info||r.vehicle_id}</td>
                <td><span className="badge badge-blue">{r.type}</span></td>
                <td style={{fontFamily:'var(--mono)',fontSize:12}}>{r.service_date}</td>
                <td style={{fontFamily:'var(--mono)'}}>{fmt(r.cost)}</td>
                <td style={{fontFamily:'var(--mono)',fontSize:12}}>{r.mileage_at_service?`${Number(r.mileage_at_service).toLocaleString()} km`:'—'}</td>
                <td style={{fontSize:12,color:r.next_service_date?'var(--amber)':'var(--faint)'}}>{r.next_service_date||'—'}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
      {modal&&<div className="modal-overlay" onClick={()=>setModal(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header"><h3>Novo registo</h3><button onClick={()=>setModal(false)} style={{background:'none',border:'none',color:'var(--muted)',fontSize:20,cursor:'pointer'}}>×</button></div>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group"><label>ID Viatura</label><input className="input" value={form.vehicle_id} onChange={e=>setForm({...form,vehicle_id:e.target.value})} /></div>
            <div className="form-group"><label>Tipo</label><input className="input" value={form.type} onChange={e=>setForm({...form,type:e.target.value})} placeholder="revision, oil, tires..." /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Data</label><input className="input" type="date" value={form.service_date} onChange={e=>setForm({...form,service_date:e.target.value})} /></div>
            <div className="form-group"><label>Custo (€)</label><input className="input" type="number" value={form.cost} onChange={e=>setForm({...form,cost:+e.target.value})} /></div>
          </div>
          <div className="form-group"><label>Descrição</label><textarea className="input" rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /></div>
        </div>
        <div className="modal-footer"><button className="btn btn-ghost" onClick={()=>setModal(false)}>Cancelar</button><button className="btn btn-primary" onClick={save} disabled={saving}>{saving?<span className="spinner"/>:'Criar'}</button></div>
      </div></div>}
    </div>
  )
}

// ═══ MESSAGES ════════════════════════════════════════════════
export function Messages({ user }) {
  const [convs, setConvs] = useState([])
  const [msgs, setMsgs]   = useState([])
  const [selected, setSelected] = useState(null)
  const [content, setContent]   = useState('')
  const [loading, setLoading]   = useState(true)
  useEffect(() => { msgsAPI.conversations().then(r=>{ setConvs(r.entities||[]); setLoading(false) }) }, [])
  const selectConv = (c) => {
    setSelected(c)
    msgsAPI.getMessages(c.id).then(r=>setMsgs(r.entities||[]))
  }
  const send = async () => {
    if (!content.trim()||!selected) return
    await msgsAPI.send(selected.id, content); setContent('')
    msgsAPI.getMessages(selected.id).then(r=>setMsgs(r.entities||[]))
  }
  if (loading) return <div className="loading-page"><div className="spinner" style={{width:32,height:32}}/></div>
  return (
    <div>
      <div className="page-header"><div><h1>Mensagens</h1></div></div>
      <div style={{display:'grid',gridTemplateColumns:'260px 1fr',gap:16,height:500}}>
        <div className="card" style={{overflowY:'auto'}}>
          {convs.length===0 ? <div className="empty"><div className="icon">💬</div><p>Sem conversas</p></div> :
          convs.map(c=>(
            <div key={c.id} onClick={()=>selectConv(c)} style={{padding:'12px 16px',cursor:'pointer',background:selected?.id===c.id?'rgba(99,102,241,.1)':'transparent',borderLeft:selected?.id===c.id?'2px solid var(--indigo)':'2px solid transparent',borderBottom:'1px solid var(--border)'}}>
              <div style={{fontWeight:500,fontSize:13}}>{c.title}</div>
              {c.last_message&&<div style={{fontSize:11,color:'var(--muted)',marginTop:3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.last_message}</div>}
            </div>
          ))}
        </div>
        <div className="card" style={{display:'flex',flexDirection:'column'}}>
          {!selected ? <div className="empty" style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}><div className="icon">💬</div><p>Selecione uma conversa</p></div> : (
            <>
              <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)',fontWeight:600}}>{selected.title}</div>
              <div style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:10}}>
                {msgs.map(m=>{
                  const isMe = m.sender_id === user.email
                  return <div key={m.id} style={{alignSelf:isMe?'flex-end':'flex-start',maxWidth:'70%'}}>
                    {!isMe&&<div style={{fontSize:11,color:'var(--muted)',marginBottom:3}}>{m.sender_name}</div>}
                    <div style={{background:isMe?'var(--indigo)':'var(--surface2)',borderRadius:isMe?'12px 12px 4px 12px':'12px 12px 12px 4px',padding:'8px 14px',fontSize:13}}>{m.content}</div>
                  </div>
                })}
              </div>
              <div style={{padding:12,borderTop:'1px solid var(--border)',display:'flex',gap:8}}>
                <input className="input" value={content} onChange={e=>setContent(e.target.value)} placeholder="Escrever mensagem..." onKeyDown={e=>e.key==='Enter'&&send()} style={{flex:1}} />
                <button className="btn btn-primary" onClick={send} style={{padding:'8px 16px'}}>Enviar</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══ REPORTS ═════════════════════════════════════════════════
export function Reports() {
  const [summary, setSummary] = useState(null)
  const [weekly, setWeekly]   = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    Promise.all([reportsAPI.summary(), reportsAPI.weekly()])
      .then(([s, w]) => { setSummary(s); setWeekly(w.weeks||[]); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])
  if (loading) return <div className="loading-page"><div className="spinner" style={{width:32,height:32}}/></div>
  return (
    <div>
      <div className="page-header"><div><h1>Relatórios</h1></div></div>
      {summary && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16,marginBottom:24}}>
          {[
            {label:'Total Bruto',val:fmt(summary.total_gross),color:'green'},
            {label:'Total Líquido',val:fmt(summary.total_net),color:'blue'},
            {label:'Total Rendas',val:fmt(summary.total_rental),color:'amber'},
            {label:'Total UPI',val:fmt(summary.total_upi),color:'indigo'},
            {label:'Total IRS',val:fmt(summary.total_irs),color:'red'},
          ].map(s=>(
            <div key={s.label} className={`stat-card ${s.color}`}>
              <div className="value" style={{fontSize:18}}>{s.val}</div>
              <div className="label">{s.label}</div>
            </div>
          ))}
        </div>
      )}
      <div className="card">
        <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)'}}><h3 style={{fontSize:14,fontWeight:600}}>Histórico semanal</h3></div>
        {weekly.length===0 ? <div className="empty"><div className="icon">📊</div><p>Sem dados</p></div> : (
          <table className="table">
            <thead><tr><th>Semana</th><th>Bruto</th><th>Líquido</th><th>Pagamentos</th></tr></thead>
            <tbody>{weekly.map((w,i)=>(
              <tr key={i}>
                <td style={{fontFamily:'var(--mono)',fontSize:12}}>{w.week_start}</td>
                <td style={{fontFamily:'var(--mono)',fontWeight:600}}>{fmt(w.gross)}</td>
                <td style={{fontFamily:'var(--mono)',color:'var(--green)'}}>{fmt(w.net)}</td>
                <td><span className="badge badge-blue">{w.payments}</span></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ═══ FLEET MANAGERS ════════════════════════════════════════════
export function FleetManagers({ user }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { fmAPI.list().then(r=>{ setList(r.entities||[]); setLoading(false) }) }, [])
  if (loading) return <div className="loading-page"><div className="spinner" style={{width:32,height:32}}/></div>
  return (
    <div>
      <div className="page-header"><div><h1>Fleet Managers</h1><div className="sub">{list.length} gestores</div></div></div>
      <div className="card">
        {list.length===0 ? <div className="empty"><div className="icon">🏢</div><p>Sem fleet managers</p></div> : (
          <table className="table">
            <thead><tr><th>Nome</th><th>Email</th><th>Telefone</th><th>Motoristas</th><th>Estado</th></tr></thead>
            <tbody>{list.map(fm=>(
              <tr key={fm.id}>
                <td style={{fontWeight:500}}>{fm.full_name}</td>
                <td style={{color:'var(--muted)'}}>{fm.email}</td>
                <td style={{color:'var(--muted)'}}>{fm.phone||'—'}</td>
                <td><span className="badge badge-blue">{fm.total_drivers||0}</span></td>
                <td><span className={`badge ${fm.status==='active'?'badge-green':'badge-amber'}`}>{fm.status}</span></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ═══ USERS ════════════════════════════════════════════════════
export function Users({ user }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ email:'', full_name:'', password:'', role:'driver' })
  const [saving, setSaving] = useState(false)
  const load = () => usersAPI.list().then(r=>{ setList(r.entities||[]); setLoading(false) })
  useEffect(() => { load() }, [])
  const save = async () => {
    setSaving(true)
    try { await usersAPI.create(form); await load(); setModal(false) }
    catch(e) { alert(e.response?.data?.detail||'Erro') }
    finally { setSaving(false) }
  }
  const toggle = async (id) => { await usersAPI.toggleActive(id); load() }
  if (loading) return <div className="loading-page"><div className="spinner" style={{width:32,height:32}}/></div>
  const ROLE_COLOR = { admin:'badge-indigo', fleet_manager:'badge-blue', driver:'badge-green' }
  const ROLE_PT    = { admin:'Admin', fleet_manager:'Fleet Manager', driver:'Motorista' }
  return (
    <div>
      <div className="page-header">
        <div><h1>Utilizadores</h1><div className="sub">{list.length} contas</div></div>
        <button className="btn btn-primary" onClick={()=>setModal(true)}>+ Novo utilizador</button>
      </div>
      <div className="card">
        <table className="table">
          <thead><tr><th>Nome</th><th>Email</th><th>Papel</th><th>Estado</th><th></th></tr></thead>
          <tbody>{list.map(u=>(
            <tr key={u.id}>
              <td style={{fontWeight:500}}>{u.full_name||'—'}</td>
              <td style={{color:'var(--muted)'}}>{u.email}</td>
              <td><span className={`badge ${ROLE_COLOR[u.role]||'badge-gray'}`}>{ROLE_PT[u.role]||u.role}</span></td>
              <td><span className={`badge ${u.is_active?'badge-green':'badge-red'}`}>{u.is_active?'Ativo':'Inativo'}</span></td>
              <td><button className="btn btn-ghost" style={{padding:'4px 10px',fontSize:12}} onClick={()=>toggle(u.id)}>{u.is_active?'Desativar':'Ativar'}</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {modal&&<div className="modal-overlay" onClick={()=>setModal(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header"><h3>Novo utilizador</h3><button onClick={()=>setModal(false)} style={{background:'none',border:'none',color:'var(--muted)',fontSize:20,cursor:'pointer'}}>×</button></div>
        <div className="modal-body">
          <div className="form-group"><label>Nome completo</label><input className="input" value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})} /></div>
          <div className="form-group"><label>Email</label><input className="input" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></div>
          <div className="form-group"><label>Palavra-passe inicial</label><input className="input" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} /></div>
          <div className="form-group"><label>Papel</label>
            <select className="input" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
              <option value="driver">Motorista</option>
              <option value="fleet_manager">Fleet Manager</option>
              <option value="admin">Admin</option>
            </select></div>
        </div>
        <div className="modal-footer"><button className="btn btn-ghost" onClick={()=>setModal(false)}>Cancelar</button><button className="btn btn-primary" onClick={save} disabled={saving}>{saving?<span className="spinner"/>:'Criar'}</button></div>
      </div></div>}
    </div>
  )
}

export default Loans
