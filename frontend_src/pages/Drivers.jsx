import { useState, useEffect } from 'react'
import { drivers as driversAPI, vehicles as vehiclesAPI } from '../api/client.js'

const STATUS_BADGE = { active:'badge-green', pending:'badge-amber', inactive:'badge-gray', suspended:'badge-red', evaluation:'badge-blue' }
const STATUS_PT    = { active:'Ativo', pending:'Pendente', inactive:'Inativo', suspended:'Suspenso', evaluation:'Avaliação' }
const CONTRACT_PT  = { location:'Locação', slot_standard:'Slot Standard', slot_premium:'Slot Premium', slot_black:'Slot Black' }

const EMPTY = { full_name:'', email:'', phone:'', nif:'', status:'pending', contract_type:'location', commission_rate:20, slot_fee:0, assigned_vehicle_id:'', vehicle_deposit:300, vehicle_deposit_paid:false, iva_regime:'exempt', notes:'' }

export default function Drivers({ user }) {
  const [list, setList]       = useState([])
  const [vehs, setVehs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [form, setForm]       = useState(EMPTY)
  const [editId, setEditId]   = useState(null)
  const [saving, setSaving]   = useState(false)
  const [search, setSearch]   = useState('')

  const load = () => driversAPI.list().then(r => { setList(r.entities || []); setLoading(false) })

  useEffect(() => {
    load()
    vehiclesAPI.list({ status: 'available' }).then(r => setVehs(r.entities || []))
  }, [])

  const openCreate = () => { setForm(EMPTY); setEditId(null); setModal(true) }
  const openEdit   = (d)  => { setForm({ ...d }); setEditId(d.id); setModal(true) }
  const closeModal = ()   => { setModal(false); setEditId(null) }

  const save = async () => {
    setSaving(true)
    try {
      if (editId) await driversAPI.update(editId, form)
      else        await driversAPI.create(form)
      await load(); closeModal()
    } catch(e) { alert(e.response?.data?.detail || 'Erro') }
    finally { setSaving(false) }
  }

  const filtered = list.filter(d =>
    d.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="loading-page"><div className="spinner" style={{width:32,height:32}}/></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Motoristas</h1>
          <div className="sub">{list.length} motoristas registados</div>
        </div>
        {user.role !== 'driver' && (
          <button className="btn btn-primary" onClick={openCreate}>+ Novo motorista</button>
        )}
      </div>

      <div className="card">
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <input className="input" placeholder="🔍  Pesquisar motorista..." value={search}
            onChange={e => setSearch(e.target.value)} style={{ maxWidth: 300 }} />
        </div>
        {filtered.length === 0 ? (
          <div className="empty"><div className="icon">👤</div><p>Sem motoristas</p></div>
        ) : (
          <table className="table">
            <thead><tr>
              <th>Nome</th><th>Email</th><th>Viatura</th><th>Contrato</th><th>UPI</th><th>Estado</th>
              {user.role !== 'driver' && <th></th>}
            </tr></thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 500 }}>{d.full_name}</td>
                  <td style={{ color: 'var(--muted)' }}>{d.email}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{d.assigned_vehicle_plate || '—'}</td>
                  <td><span className="badge badge-gray">{CONTRACT_PT[d.contract_type] || d.contract_type}</span></td>
                  <td style={{ fontFamily: 'var(--mono)', color: 'var(--indigo)' }}>€{(d.upi_balance || 0).toFixed(2)}</td>
                  <td><span className={`badge ${STATUS_BADGE[d.status] || 'badge-gray'}`}>{STATUS_PT[d.status] || d.status}</span></td>
                  {user.role !== 'driver' && (
                    <td><button className="btn btn-ghost" style={{padding:'4px 10px',fontSize:12}} onClick={() => openEdit(d)}>Editar</button></td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Editar motorista' : 'Novo motorista'}</h3>
              <button onClick={closeModal} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:20, cursor:'pointer' }}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group"><label>Nome completo</label>
                  <input className="input" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} /></div>
                <div className="form-group"><label>Email</label>
                  <input className="input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Telefone</label>
                  <input className="input" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                <div className="form-group"><label>NIF</label>
                  <input className="input" value={form.nif || ''} onChange={e => setForm({...form, nif: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Estado</label>
                  <select className="input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    {Object.entries(STATUS_PT).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                  </select></div>
                <div className="form-group"><label>Tipo de contrato</label>
                  <select className="input" value={form.contract_type || ''} onChange={e => setForm({...form, contract_type: e.target.value})}>
                    {Object.entries(CONTRACT_PT).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                  </select></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Taxa comissão (%)</label>
                  <input className="input" type="number" value={form.commission_rate || 0} onChange={e => setForm({...form, commission_rate: +e.target.value})} /></div>
                <div className="form-group"><label>Viatura atribuída</label>
                  <select className="input" value={form.assigned_vehicle_id || ''} onChange={e => setForm({...form, assigned_vehicle_id: e.target.value})}>
                    <option value="">— Nenhuma —</option>
                    {vehs.map(v => <option key={v.id} value={v.id}>{v.brand} {v.model} — {v.license_plate}</option>)}
                  </select></div>
              </div>
              <div className="form-group"><label>Notas</label>
                <textarea className="input" rows={3} value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})} /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? <span className="spinner"/> : (editId ? 'Guardar' : 'Criar')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
