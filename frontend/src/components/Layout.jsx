import { useState, useEffect } from 'react'
import { users as usersAPI } from '../api/client.js'

const NAV = [
  { key: 'dashboard',      label: 'Dashboard',       roles: ['admin','fleet_manager','driver'],
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { key: 'drivers',        label: 'Motoristas',      roles: ['admin','fleet_manager'],
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { key: 'vehicles',       label: 'Viaturas',        roles: ['admin','fleet_manager'],
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg> },
  { key: 'payments',       label: 'Pagamentos',      roles: ['admin','fleet_manager','driver'],
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
  { key: 'cashflow',       label: 'Fluxo de Caixa',  roles: ['admin','fleet_manager'],
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg> },
  { key: 'loans',          label: 'Empréstimos',     roles: ['admin','fleet_manager','driver'],
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
  { key: 'purchases',      label: 'Compra Viatura',  roles: ['admin','fleet_manager'],
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> },
  { key: 'upi',            label: 'UPI',             roles: ['admin','fleet_manager','driver'],
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
  { key: 'maintenance',    label: 'Manutenção',      roles: ['admin','fleet_manager'],
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg> },
  { key: 'messages',       label: 'Mensagens',       roles: ['admin','fleet_manager','driver'],
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { key: 'reports',        label: 'Relatórios',      roles: ['admin','fleet_manager'],
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { key: 'fleet_managers', label: 'Fleet Managers',  roles: ['admin'],
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg> },
  { key: 'users',          label: 'Utilizadores',    roles: ['admin'],
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
]

const ROLE_BADGE = { admin:'badge-indigo', fleet_manager:'badge-blue', driver:'badge-green' }
const ROLE_PT    = { admin:'Admin', fleet_manager:'Fleet Manager', driver:'Motorista' }

export default function Layout({ user, page, navigate, onLogout, children }) {
  const [collapsed, setCollapsed]       = useState(false)
  const [simulating, setSimulating]     = useState(null)
  const [showSwitcher, setShowSwitcher] = useState(false)
  const [userList, setUserList]         = useState([])

  const activeUser = simulating || user

  useEffect(() => {
    if (user.role === 'admin') usersAPI.list().then(r => setUserList(r.entities || []))
  }, [])

  const links    = NAV.filter(n => n.roles.includes(activeUser.role))
  const startSim = (u) => { setSimulating(u); setShowSwitcher(false); navigate('dashboard') }
  const stopSim  = ()  => { setSimulating(null); navigate('dashboard') }
  const others   = userList.filter(u => u.email !== user.email && u.is_active)

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      <aside style={{ width: collapsed ? 56 : 224, background:'linear-gradient(180deg,#0a1628 0%,#0d1f3c 100%)', borderRight:'1px solid rgba(59,130,246,.15)', display:'flex', flexDirection:'column', transition:'width .2s', flexShrink:0, overflow:'hidden' }}>

        <div style={{ padding: collapsed ? '12px' : '12px 16px', borderBottom:'1px solid rgba(59,130,246,.12)', display:'flex', alignItems:'center', gap:10, minHeight:60 }}>
          <img src="/logo_icon.png" alt="PureDrivePT" style={{ width:120, height:40, objectFit:'contain', flexShrink:0, filter:'drop-shadow(0 0 8px rgba(59,130,246,.6))' }}/>
          {!collapsed && (
            <div>
              <div style={{ fontWeight:800, fontSize:14, whiteSpace:'nowrap', background:'linear-gradient(90deg,#fff 0%,#60a5fa 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                PureDrive<span style={{ fontSize:10, fontWeight:700, verticalAlign:'super' }}>PT</span>
              </div>
              <div style={{ fontSize:9, color:'rgba(148,163,184,.5)', letterSpacing:'.06em', marginTop:-1 }}>GESTÃO DE FROTA TVDE</div>
            </div>
          )}
        </div>

        {simulating && !collapsed && (
          <div style={{ background:'rgba(245,158,11,.08)', borderBottom:'1px solid rgba(245,158,11,.15)', padding:'7px 14px' }}>
            <div style={{ fontSize:9, color:'#fbbf24', fontWeight:800, letterSpacing:'.1em' }}>MODO SIMULAÇÃO</div>
            <div style={{ fontSize:11, color:'#e2e8f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginTop:2 }}>{simulating.full_name}</div>
            <button onClick={stopSim} style={{ marginTop:5, background:'rgba(245,158,11,.15)', border:'1px solid rgba(245,158,11,.25)', borderRadius:4, color:'#fbbf24', fontSize:10, padding:'2px 8px', cursor:'pointer', width:'100%' }}>✕ Sair</button>
          </div>
        )}

        <nav style={{ flex:1, overflowY:'auto', padding:'6px 0' }}>
          {links.map(n => {
            const active = page === n.key
            return (
              <button key={n.key} onClick={() => navigate(n.key)} style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding: collapsed ? '10px 20px' : '9px 16px', background: active ? 'rgba(59,130,246,.12)' : 'transparent', color: active ? '#93c5fd' : 'rgba(148,163,184,.6)', border:'none', borderLeft: active ? '2px solid #3b82f6' : '2px solid transparent', cursor:'pointer', fontSize:13, fontWeight: active ? 600 : 400, transition:'all .15s', whiteSpace:'nowrap' }}>
                <span style={{ flexShrink:0, opacity: active ? 1 : 0.55 }}>{n.icon}</span>
                {!collapsed && n.label}
              </button>
            )
          })}
        </nav>

        <div style={{ padding: collapsed ? '12px 10px' : '12px 16px', borderTop:'1px solid rgba(59,130,246,.1)' }}>
          {!collapsed ? (
            <>
              <div style={{ fontSize:12, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'#e2e8f0' }}>{activeUser.full_name || activeUser.email}</div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:6 }}>
                <span className={`badge ${ROLE_BADGE[activeUser.role]}`} style={{ fontSize:10 }}>{ROLE_PT[activeUser.role]}</span>
                <button onClick={onLogout} title="Sair" style={{ background:'none', border:'none', color:'rgba(148,163,184,.4)', cursor:'pointer' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                </button>
              </div>
            </>
          ) : (
            <button onClick={onLogout} style={{ background:'none', border:'none', color:'rgba(148,163,184,.4)', cursor:'pointer', width:'100%', display:'flex', justifyContent:'center' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          )}
        </div>
      </aside>

      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <header style={{ height:56, background:'linear-gradient(90deg,#0d1f3c 0%,#060e1e 100%)', borderBottom:'1px solid rgba(59,130,246,.1)', display:'flex', alignItems:'center', padding:'0 20px', gap:12, flexShrink:0 }}>
          <button onClick={() => setCollapsed(c=>!c)} style={{ background:'none', border:'none', color:'rgba(148,163,184,.4)', cursor:'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div style={{ flex:1 }}/>

          {user.role === 'admin' && (
            <div style={{ position:'relative' }}>
              <button onClick={() => setShowSwitcher(s=>!s)} style={{ display:'flex', alignItems:'center', gap:8, background: simulating ? 'rgba(245,158,11,.1)' : 'rgba(59,130,246,.08)', border: simulating ? '1px solid rgba(245,158,11,.25)' : '1px solid rgba(59,130,246,.18)', borderRadius:8, padding:'6px 12px', cursor:'pointer', color: simulating ? '#fbbf24' : '#93c5fd', fontSize:13, fontWeight:500 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <span>{simulating ? simulating.full_name?.split(' ')[0] : 'Simular conta'}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>

              {showSwitcher && (
                <div style={{ position:'absolute', top:'110%', right:0, width:270, background:'#0d1f3c', border:'1px solid rgba(59,130,246,.2)', borderRadius:10, boxShadow:'0 8px 32px rgba(0,0,0,.7)', zIndex:200 }}>
                  <div style={{ padding:'10px 14px', borderBottom:'1px solid rgba(59,130,246,.1)', fontSize:10, fontWeight:700, color:'rgba(148,163,184,.5)', textTransform:'uppercase', letterSpacing:'.08em' }}>Simular perspetiva</div>
                  {simulating && (
                    <button onClick={stopSim} style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'rgba(245,158,11,.07)', border:'none', borderBottom:'1px solid rgba(59,130,246,.08)', cursor:'pointer', color:'#fbbf24', fontSize:13 }}>✕ Voltar a Admin</button>
                  )}
                  <div style={{ maxHeight:260, overflowY:'auto' }}>
                    {others.map(u => (
                      <button key={u.id} onClick={() => startSim(u)} style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background: simulating?.id===u.id ? 'rgba(59,130,246,.1)' : 'transparent', border:'none', borderBottom:'1px solid rgba(59,130,246,.06)', cursor:'pointer', color:'#e2e8f0', fontSize:13, textAlign:'left' }}>
                        <div style={{ width:30, height:30, borderRadius:'50%', background:'rgba(59,130,246,.12)', border:'1px solid rgba(59,130,246,.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:13, fontWeight:700, color:'#60a5fa' }}>
                          {(u.full_name||u.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight:500, fontSize:12 }}>{u.full_name||u.email}</div>
                          <div style={{ fontSize:11, color:'rgba(148,163,184,.5)' }}>{ROLE_PT[u.role]||u.role}</div>
                        </div>
                        {simulating?.id===u.id && <span style={{ marginLeft:'auto', color:'#60a5fa' }}>✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <span style={{ fontSize:12, color:'rgba(148,163,184,.35)', whiteSpace:'nowrap' }}>
            {new Date().toLocaleDateString('pt-PT',{weekday:'long',day:'numeric',month:'long'})}
          </span>
        </header>

        <main style={{ flex:1, overflowY:'auto', padding:24, background:'var(--bg)' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
