import { useState, useEffect } from 'react'
import { fleetManagers as fmAPI } from '../api/client.js'

const EMPTY = { full_name:'', email:'', phone:'', status:'active' }

export default function FleetManagers({ user }) {
  const [list, setList]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm]   = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [confirm, setConfirm] = useState(null)

  const load = () => fmAPI.list().then(r=>{setList(r.entities||[]);setLoading(false)})
  useEffect(()=>load(),[])

  const openCreate = () => { setForm(EMPTY); setEditId(null); setModal(true) }
  const openEdit   = (fm) => { setForm({full_name:fm.full_name,email:fm.email,phone:fm.phone||'',status:fm.status||'active'}); setEditId(fm.id); setModal(true) }

  const save = async()=>{
    setSaving(true)
    try {
      if (editId) await fmAPI.update(editId, form)
      else        await fmAPI.create(form)
      await load(); setModal(false)
    } catch(e){ alert(e.response?.data?.detail||'Erro') }
    finally{ setSaving(false) }
  }

  const remove = async(id)=>{
    try { await fmAPI.remove(id); await load() } catch(e){ alert(e.response?.data?.detail||'Erro') }
    setConfirm(null)
  }

  if (loading) return <div className="loading-page"><div className="spinner" style={{width:32,height:32}}/></div>

  return (
    <div>
      <div className="page-header">
        <div><h1>Fleet Managers</h1><div className="sub">{list.length} gestores</div></div>
        <button className="btn btn-primary" onClick={openCreate}>+ Novo gestor</button>
      </div>

      <div className="card">
        {list.length===0 ? <div className="empty"><div className="icon">🏠</div><p>Sem fleet managers</p></div> : (
          <table className="table">
            <thead><tr><th>Nome</th><th>Email</th><th>Telefone</th><th>Motoristas</th><th>Estado</th><th></th></tr></thead>
            <tbody>{list.map(fm=>(
              <tr key={fm.id}>
                <td style={{fontWeight:500}}>{fm.full_name}</td>
                <td style={{color:'var(--muted)'}}>{fm.email}</td>
                <td style={{color:'var(--muted)'}}>{fm.phone||'—'}</td>
                <td>{fm.driver_count>0&&<span className="badge badge-blue">{fm.driver_count}</span>}</td>
                <td><span className={`badge ${fm.status==='active'?'badge-green':'badge-gray'}`}>{fm.status==='active'?'Ativo':'Inativo'}</span></td>
                <td style={{display:'flex',gap:6}}>
                  <button className="btn btn-ghost" style={{padding:'4px 10px',fontSize:12}} onClick={()=>openEdit(fm)}>Editar</button>
                  <button className="btn btn-danger" style={{padding:'4px 10px',fontSize:12}} onClick={()=>setConfirm(fm)}>Remover</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>

      {/* Confirm delete */}
      {confirm && (
        <div className="modal-overlay" onClick={()=>setConfirm(null)}>
          <div className="modal" style={{maxWidth:400}} onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h3>Confirmar remoção</h3></div>
            <div className="modal-body"><p style={{color:'var(--muted)'}}>Tem a certeza que quer remover <strong>{confirm.full_name}</strong>?</p></div>
            <div className="modal-footer"><button className="btn btn-ghost" onClick={()=>setConfirm(null)}>Cancelar</button><button className="btn btn-danger" onClick={()=>remove(confirm.id)}>Remover</button></div>
          </div>
        </div>
      )}

      {/* Create/Edit modal */}
      {modal && (
        <div className="modal-overlay" onClick={()=>setModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h3>{editId?'Editar gestor':'Novo fleet manager'}</h3><button onClick={()=>setModal(false)} style={{background:'none',border:'none',color:'var(--muted)',fontSize:20,cursor:'pointer'}}>×</button></div>
            <div className="modal-body">
              <div className="form-group"><label>Nome completo</label><input className="input" value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})} placeholder="Nome"/></div>
              <div className="form-row">
                <div className="form-group"><label>Email</label><input className="input" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="email@exemplo.com"/></div>
                <div className="form-group"><label>Telefone</label><input className="input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+351 9xx xxx xxx"/></div>
              </div>
              <div className="form-group"><label>Estado</label>
                <select className="input" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                  <option value="active">Ativo</option><option value="inactive">Inativo</option>
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
