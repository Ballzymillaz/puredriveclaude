import { useState, useEffect } from 'react'
import { payments as paymentsAPI, drivers as driversAPI } from '../api/client.js'

const fmt = n => (n||0).toLocaleString('pt-PT',{style:'currency',currency:'EUR',minimumFractionDigits:2})

export default function CashFlow({ user }) {
  const [pays, setPays]         = useState([])
  const [drivers, setDrivers]   = useState([])
  const [filterDriver, setFilterDriver] = useState('all')
  const [loading, setLoading]   = useState(true)

  useEffect(()=>{
    Promise.all([
      paymentsAPI.list(),
      driversAPI.list()
    ]).then(([p,d])=>{
      setPays(p.entities||[])
      setDrivers(d.entities||[])
      setLoading(false)
    })
  },[])

  const filtered = filterDriver==='all' ? pays : pays.filter(p=>p.driver_id===filterDriver)

  // Calculs agrégés
  const totalGross   = filtered.reduce((s,p)=>s+(p.total_gross||0),0)
  const totalRental  = filtered.reduce((s,p)=>s+(p.vehicle_rental||0),0)
  const totalVV      = filtered.reduce((s,p)=>s+(p.via_verde_amount||0),0)
  const totalMiio    = filtered.reduce((s,p)=>s+(p.miio_amount||0),0)
  const totalIRS     = filtered.reduce((s,p)=>s+(p.irs_retention||0),0)
  const totalIVA     = filtered.reduce((s,p)=>s+(p.iva_amount||0),0)
  const totalNet     = filtered.reduce((s,p)=>s+(p.net_amount||0),0)
  const totalUPI     = filtered.reduce((s,p)=>s+(p.upi_earned||0),0)

  // Receitas empresa = rendas + via verde + miio + IRS + IVA (o que fica na empresa)
  const companyRevenue = totalRental + totalVV + totalMiio
  const companyExpenses = 0 // simplificado
  const profit = companyRevenue - companyExpenses

  // Despesas por categoria para o gráfico de barras simples
  const categories = [
    { label:'Rendas', value:totalRental, color:'var(--indigo)' },
    { label:'Via Verde', value:totalVV, color:'var(--blue)' },
    { label:'Miio/Prio', value:totalMiio, color:'var(--amber)' },
    { label:'IRS', value:totalIRS, color:'var(--red)' },
    { label:'IVA', value:totalIVA, color:'var(--faint)' },
  ].filter(c=>c.value>0)
  const maxVal = Math.max(...categories.map(c=>c.value),1)

  if (loading) return <div className="loading-page"><div className="spinner" style={{width:32,height:32}}/></div>

  return (
    <div>
      <div className="page-header">
        <div><h1>Fluxo de Caixa</h1><div className="sub">Análise financeira da frota</div></div>
        <select className="input" style={{width:220}} value={filterDriver} onChange={e=>setFilterDriver(e.target.value)}>
          <option value="all">Todos os motoristas</option>
          {drivers.map(d=><option key={d.id} value={d.id}>{d.full_name}</option>)}
        </select>
      </div>

      {/* KPI Cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16,marginBottom:24}}>
        <div className="stat-card green"><div className="value">{fmt(totalGross)}</div><div className="label">Faturação bruta total</div></div>
        <div className="stat-card blue"><div className="value">{fmt(totalNet)}</div><div className="label">Total líquido motoristas</div></div>
        <div className="stat-card indigo"><div className="value">{fmt(companyRevenue)}</div><div className="label">Receitas empresa</div></div>
        <div className="stat-card amber"><div className="value">{fmt(totalUPI)}</div><div className="label">UPI gerado</div></div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:24}}>
        {/* Despesas por categoria */}
        <div className="card" style={{padding:20}}>
          <h3 style={{fontSize:14,fontWeight:600,marginBottom:16}}>Despesas por categoria</h3>
          {categories.map(c=>(
            <div key={c.label} style={{marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}>
                <span style={{color:'var(--muted)'}}>{c.label}</span>
                <span style={{fontFamily:'var(--mono)',fontWeight:500}}>{fmt(c.value)}</span>
              </div>
              <div style={{height:6,background:'var(--surface2)',borderRadius:3,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${(c.value/maxVal)*100}%`,background:c.color,borderRadius:3,transition:'width .3s'}}/>
              </div>
            </div>
          ))}
        </div>

        {/* Resumo financeiro */}
        <div className="card" style={{padding:20}}>
          <h3 style={{fontSize:14,fontWeight:600,marginBottom:16}}>Resumo financeiro</h3>
          {[
            ['Faturação bruta',totalGross,'var(--text)'],
            ['→ Líquido motoristas',-totalNet,'var(--red)'],
            ['→ UPI gerado',-totalUPI,'var(--indigo)'],
            ['Receitas empresa (rendas+fees)',companyRevenue,'var(--green)'],
            ['IRS retido',totalIRS,'var(--amber)'],
            ['IVA cobrado',totalIVA,'var(--amber)'],
          ].map(([label,val,color])=>(
            <div key={label} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid rgba(51,65,85,.3)',fontSize:13}}>
              <span style={{color:'var(--muted)'}}>{label}</span>
              <span style={{fontFamily:'var(--mono)',fontWeight:600,color}}>{val<0?'-':''}{fmt(Math.abs(val))}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detalhe por motorista */}
      <div className="card">
        <div style={{padding:'14px 20px',borderBottom:'1px solid var(--border)'}}><h3 style={{fontSize:14,fontWeight:600}}>Detalhe por motorista</h3></div>
        <table className="table">
          <thead><tr><th>Motorista</th><th>Bruto</th><th>Renda</th><th>Via Verde</th><th>IRS</th><th>Líquido</th><th>UPI</th></tr></thead>
          <tbody>
            {drivers.filter(d=>filterDriver==='all'||d.id===filterDriver).map(d=>{
              const dp = filtered.filter(p=>p.driver_id===d.id)
              if (!dp.length) return null
              const gross  = dp.reduce((s,p)=>s+(p.total_gross||0),0)
              const rental = dp.reduce((s,p)=>s+(p.vehicle_rental||0),0)
              const vv     = dp.reduce((s,p)=>s+(p.via_verde_amount||0),0)
              const irs    = dp.reduce((s,p)=>s+(p.irs_retention||0),0)
              const net    = dp.reduce((s,p)=>s+(p.net_amount||0),0)
              const upi    = dp.reduce((s,p)=>s+(p.upi_earned||0),0)
              return (
                <tr key={d.id}>
                  <td style={{fontWeight:500}}>{d.full_name}</td>
                  <td style={{fontFamily:'var(--mono)'}}>{fmt(gross)}</td>
                  <td style={{fontFamily:'var(--mono)',color:'var(--red)'}}>-{fmt(rental)}</td>
                  <td style={{fontFamily:'var(--mono)',color:'var(--red)'}}>-{fmt(vv)}</td>
                  <td style={{fontFamily:'var(--mono)',color:'var(--amber)'}}>-{fmt(irs)}</td>
                  <td style={{fontFamily:'var(--mono)',color:'var(--green)',fontWeight:600}}>{fmt(net)}</td>
                  <td style={{fontFamily:'var(--mono)',color:'var(--indigo)'}}>{fmt(upi)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
