import { useState, useEffect } from 'react'
import { upi as upiAPI } from '../api/client.js'

const fmt = n => (n||0).toLocaleString('pt-PT',{style:'currency',currency:'EUR'})

export default function UPI({ user }) {
  const [list, setList]   = useState([])
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState(null)

  useEffect(()=>{ upiAPI.transactions().then(r=>{setList(r.entities||[]);setLoading(false)}) },[])

  if (loading) return <div className="loading-page"><div className="spinner" style={{width:32,height:32}}/></div>

  const total = list.reduce((s,t)=>s+(t.type==='earned'?t.amount:-t.amount),0)

  return (
    <div>
      <div className="page-header">
        <div><h1>UPI — Unidade de Participação Interna</h1><div className="sub">{list.length} transações</div></div>
        <div style={{background:'rgba(99,102,241,.1)',border:'1px solid rgba(99,102,241,.2)',borderRadius:10,padding:'10px 20px',textAlign:'center'}}>
          <div style={{fontSize:11,color:'var(--muted)'}}>SALDO TOTAL</div>
          <div style={{fontFamily:'var(--mono)',fontWeight:700,fontSize:18,color:'var(--indigo)'}}>{fmt(total)}</div>
        </div>
      </div>

      <div className="card">
        {list.length===0 ? <div className="empty"><div className="icon">💎</div><p>Sem transações UPI</p></div> : (
          <table className="table">
            <thead><tr><th>Motorista</th><th>Tipo</th><th>Montante</th><th>Fonte</th><th>Semana</th><th>Data</th></tr></thead>
            <tbody>{list.map(t=>(
              <tr key={t.id} onClick={()=>setDetail(t)} style={{cursor:'pointer'}}>
                <td style={{fontWeight:500}}>{t.driver_name}</td>
                <td><span className={`badge ${t.type==='earned'?'badge-green':'badge-red'}`}>{t.type==='earned'?'Ganho':'Débito'}</span></td>
                <td style={{fontFamily:'var(--mono)',color:t.type==='earned'?'var(--green)':'var(--red)',fontWeight:600}}>{t.type==='earned'?'+':'-'}{fmt(t.amount)}</td>
                <td style={{color:'var(--muted)',fontSize:12}}>{t.source}</td>
                <td style={{color:'var(--muted)',fontSize:12}}>{t.week_label||t.week_start}</td>
                <td style={{color:'var(--muted)',fontSize:12}}>{t.created_date?.slice(0,10)}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>

      {detail && (
        <div className="modal-overlay" onClick={()=>setDetail(null)}>
          <div className="modal" style={{maxWidth:420}} onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h3>Detalhe UPI</h3><button onClick={()=>setDetail(null)} style={{background:'none',border:'none',color:'var(--muted)',fontSize:20,cursor:'pointer'}}>×</button></div>
            <div className="modal-body">
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                {[['Motorista',detail.driver_name],['Tipo',detail.type==='earned'?'Ganho':'Débito'],['Montante',fmt(detail.amount)],['Fonte',detail.source],['Semana',detail.week_label||detail.week_start],['Data',detail.created_date?.slice(0,10)]].map(([k,v])=>(
                  <div key={k}><div style={{fontSize:11,color:'var(--muted)',marginBottom:4}}>{k}</div><div style={{fontWeight:500}}>{v||'—'}</div></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
