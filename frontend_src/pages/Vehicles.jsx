// ═══════════════════ VEHICLES ═══════════════════════════════
import { useState, useEffect } from 'react'
import { vehicles as vehiclesAPI, drivers as driversAPI } from '../api/client.js'

const V_STATUS = { available:'badge-green', assigned:'badge-blue', alugado:'badge-indigo', maintenance:'badge-amber', inactive:'badge-gray' }
const V_STATUS_PT = { available:'Disponível', assigned:'Atribuída', alugado:'Alugada', maintenance:'Manutenção', inactive:'Inativa' }
const FUEL_PT = { electric:'Elétrico', diesel:'Diesel', gasoline:'Gasolina', hybrid:'Híbrido' }
const EMPTY_V = { brand:'', model:'', license_plate:'', first_registration_date:'', color:'', fuel_type:'diesel', market_price:0, base_purchase_price:0, weekly_rental_price:0, status:'available', notes:'', photo_url:'' }

export function Vehicles({ user }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY_V)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => vehiclesAPI.list().then(r => { setList(r.entities || []); setLoading(false) })
  useEffect(() => { load() }, [])

  const save = async () => {
    setSaving(true)
    try {
      if (editId) await vehiclesAPI.update(editId, form)
      else        await vehiclesAPI.create(form)
      await load(); setModal(false)
    } catch(e) { alert(e.response?.data?.detail || 'Erro') }
    finally { setSaving(false) }
  }

  const fmt = (n) => n ? `€${Number(n).toLocaleString('pt-PT', {minimumFractionDigits:0})}` : '—'

  if (loading) return <div className="loading-page"><div className="spinner" style={{width:32,height:32}}/></div>

  return (
    <div>
      <div className="page-header">
        <div><h1>Viaturas</h1><div className="sub">{list.length} viaturas registadas</div></div>
        {user.role !== 'driver' && <button className="btn btn-primary" onClick={() => { setForm(EMPTY_V); setEditId(null); setModal(true) }}>+ Nova viatura</button>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {list.map(v => (
          <div key={v.id} className="card" style={{ overflow: 'hidden' }}>
            {v.photo_url && <img src={v.photo_url} alt={v.model} style={{ width:'100%', height:150, objectFit:'cover' }} />}
            {!v.photo_url && <div style={{ height:80, background:'var(--surface2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32 }}>🚗</div>}
            <div style={{ padding: 16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                <div>
                  <div style={{ fontWeight:600 }}>{v.brand} {v.model}</div>
                  <div style={{ fontFamily:'var(--mono)', fontSize:12, color:'var(--indigo)', marginTop:2 }}>{v.license_plate}</div>
                </div>
                <span className={`badge ${V_STATUS[v.status] || 'badge-gray'}`}>{V_STATUS_PT[v.status] || v.status}</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, fontSize:12, color:'var(--muted)' }}>
                <span>⛽ {FUEL_PT[v.fuel_type] || v.fuel_type}</span>
                <span>📅 {v.first_registration_date?.slice(0,4) || '—'}</span>
                <span>💶 {fmt(v.weekly_rental_price)}/sem</span>
                <span>🔧 {v.mileage ? `${Number(v.mileage).toLocaleString('pt-PT')} km` : '—'}</span>
              </div>
              {v.assigned_driver_name && <div style={{ marginTop:10, fontSize:12, color:'var(--muted)' }}>👤 {v.assigned_driver_name}</div>}
              {user.role !== 'driver' && (
                <button className="btn btn-ghost" style={{ width:'100%', justifyContent:'center', marginTop:12, fontSize:12 }}
                  onClick={() => { setForm({...v}); setEditId(v.id); setModal(true) }}>Editar</button>
              )}
            </div>
          </div>
        ))}
        {list.length === 0 && <div className="empty" style={{gridColumn:'1/-1'}}><div className="icon">🚗</div><p>Sem viaturas</p></div>}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Editar viatura' : 'Nova viatura'}</h3>
              <button onClick={() => setModal(false)} style={{ background:'none',border:'none',color:'var(--muted)',fontSize:20,cursor:'pointer' }}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group"><label>Marca</label><input className="input" value={form.brand} onChange={e=>setForm({...form,brand:e.target.value})} /></div>
                <div className="form-group"><label>Modelo</label><input className="input" value={form.model} onChange={e=>setForm({...form,model:e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Matrícula</label><input className="input" value={form.license_plate} onChange={e=>setForm({...form,license_plate:e.target.value})} /></div>
                <div className="form-group"><label>1ª matrícula</label><input className="input" type="date" value={form.first_registration_date||''} onChange={e=>setForm({...form,first_registration_date:e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Combustível</label>
                  <select className="input" value={form.fuel_type||'diesel'} onChange={e=>setForm({...form,fuel_type:e.target.value})}>
                    {Object.entries(FUEL_PT).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                  </select></div>
                <div className="form-group"><label>Estado</label>
                  <select className="input" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                    {Object.entries(V_STATUS_PT).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                  </select></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Preço mercado (€)</label><input className="input" type="number" value={form.market_price||0} onChange={e=>setForm({...form,market_price:+e.target.value})} /></div>
                <div className="form-group"><label>Renda semanal (€)</label><input className="input" type="number" value={form.weekly_rental_price||0} onChange={e=>setForm({...form,weekly_rental_price:+e.target.value})} /></div>
              </div>
              <div className="form-group"><label>URL foto</label><input className="input" value={form.photo_url||''} onChange={e=>setForm({...form,photo_url:e.target.value})} /></div>
              <div className="form-group"><label>Km atual</label><input className="input" type="number" value={form.mileage||0} onChange={e=>setForm({...form,mileage:+e.target.value})} /></div>
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

export default Vehicles
