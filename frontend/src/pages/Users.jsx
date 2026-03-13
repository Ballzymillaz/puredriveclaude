import { useState, useEffect } from 'react'
import { users as usersAPI } from '../api/client.js'

const ROLES = ['admin','fleet_manager','driver']
const ROLES_PT = { admin:'Admin', fleet_manager:'Fleet Manager', driver:'Motorista' }
const ROLE_BADGE = { admin:'badge-indigo', fleet_manager:'badge-blue', driver:'badge-green' }
const EMPTY = { full_name:'', email:'', role:'driver', password:'' }

export default function Users({ user }) {
  const [list, setList]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm]   = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [confirm, setConfirm] = useState(null)

  const load = () => usersAPI.list().then(r=>{setList(r.entities||[]);setLoading(false)})
  useEffect(()=>load(),[])

  const openCreate = () => { setForm(EMPTY); setEditId(null); setModal(true) }
  const openEdit   = (u)  => { setForm({full_name:u.full_name,email:u.email,role:u.role,password:''}); setEditId(u.id); setModal(true) }

  const save = async()=>{
    setSaving(true)
    try {
      const payload = {...form}
      if (!payload.password) delete payload.password
      if (editId) await usersAPI.update(editId, payload)
      else        await usersAPI.create(payload)
      await load(); setModal(false)
    } catch(e){ alert(e.response?.data?.detail||'Erro') }
    finally{ setSaving(false) }
  }

  const remove = async(id)=>{
    try { await usersAPI.remove(id); await load() } catch(e){ alert(e.response?.data?.detail||'Erro') }
    setConfirm(null)
  }

  if (loading) return <div className="loading-page"><div className="spinner" style={{width:32,height:32}}/></div>

  return (
    <div>
      <div className="page-header">
        <div><h1>Utilizadores</h1><div className="sub">{list.length} contas</div></div>
        <button className="btn btn-primary" onClick={openCreate}>+ Novo utilizador</button>
      </div>

      <div className="card">
        <table className="table">
          <thead><tr><th>Nome</th><th>Email</th><th>Papel</th><th>Estado</th><th></th></tr></thead>
          <tbody>{list.map(u=>(
            <tr key={u.id}>
              <td style={{fontWeight:500}}>{u.full_name}</td>
              <td style={{color:'var(--muted)',fontSize:12}}>{u.email}</td>
              <td><span className={`badge ${ROLE_BADGE[u.role]||'badge-gray'}`}>{ROLES_PT[u.role]||u.role}</span></td>
              <td><span className={`badge ${u.is_active?'badge-green':'badge-gray'}`}>{u.is_active?'Ativo':'Inativo'}</span></td>
              <td style={{display:'flex',gap:6}}>
                <button className="btn btn-ghost" style={{padding:'4px 10px',fontSize:12}} onClick={()=>openEdit(u)}>Editar</button>
                {u.id !== user.id && <button className="btn btn-danger" style={{padding:'4px 10px',fontSize:12}} onClick={()=>setConfirm(u)}>Apagar</button>}
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      {confirm && (
        <div className="modal-overlay" onClick={()=>setConfirm(null)}>
          <div className="modal" style={{maxWidth:380}} onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h3>Confirmar eliminação</h3></div>
            <div className="modal-body"><p style={{color:'var(--muted)'}}>Apagar <strong>{confirm.full_name}</strong>? Esta ação é irreversível.</p></div>
            <div className="modal-footer"><button className="btn btn-ghost" onClick={()=>setConfirm(null)}>Cancelar</button><button className="btn btn-danger" onClick={()=>remove(confirm.id)}>Apagar</button></div>
          </div>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={()=>setModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h3>{editId?'Editar utilizador':'Novo utilizador'}</h3><button onClick={()=>setModal(false)} style={{background:'none',border:'none',color:'var(--muted)',fontSize:20,cursor:'pointer'}}>×</button></div>
            <div className="modal-body">
              <div className="form-group"><label>Nome completo</label><input className="input" value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})}/></div>
              <div className="form-row">
                <div className="form-group"><label>Email</label><input className="input" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
                <div className="form-group"><label>Papel</label>
                  <select className="input" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
                    {ROLES.map(r=><option key={r} value={r}>{ROLES_PT[r]}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group"><label>{editId?'Nova password (deixar vazio para não alterar)':'Password'}</label><input className="input" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder={editId?'••••••••':''}/></div>
            </div>
            <div className="modal-footer"><button className="btn btn-ghost" onClick={()=>setModal(false)}>Cancelar</button><button className="btn btn-primary" onClick={save} disabled={saving}>{saving?<span className="spinner"/>:(editId?'Guardar':'Criar')}</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
