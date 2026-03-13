import { useState } from 'react'

const NAV = [
  { key: 'dashboard',     icon: '⬡',  label: 'Dashboard',       roles: ['admin','fleet_manager','driver'] },
  { key: 'drivers',       icon: '👤',  label: 'Motoristas',      roles: ['admin','fleet_manager'] },
  { key: 'vehicles',      icon: '🚗',  label: 'Viaturas',        roles: ['admin','fleet_manager'] },
  { key: 'payments',      icon: '💶',  label: 'Pagamentos',      roles: ['admin','fleet_manager','driver'] },
  { key: 'loans',         icon: '🏦',  label: 'Empréstimos',     roles: ['admin','fleet_manager','driver'] },
  { key: 'purchases',     icon: '🔑',  label: 'Compra Viatura',  roles: ['admin','fleet_manager'] },
  { key: 'upi',           icon: '💎',  label: 'UPI',             roles: ['admin','fleet_manager','driver'] },
  { key: 'maintenance',   icon: '🔧',  label: 'Manutenção',      roles: ['admin','fleet_manager'] },
  { key: 'messages',      icon: '💬',  label: 'Mensagens',       roles: ['admin','fleet_manager','driver'] },
  { key: 'reports',       icon: '📊',  label: 'Relatórios',      roles: ['admin','fleet_manager'] },
  { key: 'fleet_managers',icon: '🏢',  label: 'Fleet Managers',  roles: ['admin'] },
  { key: 'users',         icon: '⚙️',  label: 'Utilizadores',    roles: ['admin'] },
]

const ROLE_LABEL = { admin: 'Admin', fleet_manager: 'Fleet Manager', driver: 'Motorista' }
const ROLE_COLOR = { admin: 'badge-indigo', fleet_manager: 'badge-blue', driver: 'badge-green' }

export default function Layout({ user, page, navigate, onLogout, children }) {
  const [collapsed, setCollapsed] = useState(false)
  const links = NAV.filter(n => n.roles.includes(user.role))

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 60 : 220,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width .2s',
        flexShrink: 0,
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: '18px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🚗</span>
          {!collapsed && <span style={{ fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap' }}>PureDrivePT</span>}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {links.map(n => (
            <button key={n.key} onClick={() => navigate(n.key)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: collapsed ? '10px 18px' : '10px 16px',
                background: page === n.key ? 'rgba(99,102,241,.15)' : 'transparent',
                color: page === n.key ? 'var(--indigo)' : 'var(--muted)',
                border: 'none', borderLeft: page === n.key ? '2px solid var(--indigo)' : '2px solid transparent',
                cursor: 'pointer', fontSize: 13, fontWeight: page === n.key ? 600 : 400,
                transition: 'all .15s', whiteSpace: 'nowrap',
              }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{n.icon}</span>
              {!collapsed && n.label}
            </button>
          ))}
        </nav>

        {/* User info */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          {!collapsed && (
            <>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.full_name || user.email}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className={`badge ${ROLE_COLOR[user.role]}`} style={{ fontSize: 10, padding: '2px 8px' }}>
                  {ROLE_LABEL[user.role]}
                </span>
                <button onClick={onLogout} style={{ background: 'none', border: 'none', color: 'var(--faint)', fontSize: 16, cursor: 'pointer' }} title="Sair">⏏</button>
              </div>
            </>
          )}
          {collapsed && (
            <button onClick={onLogout} style={{ background: 'none', border: 'none', color: 'var(--faint)', fontSize: 16, cursor: 'pointer', width: '100%' }}>⏏</button>
          )}
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{
          height: 56, background: 'var(--surface)', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, flexShrink: 0,
        }}>
          <button onClick={() => setCollapsed(c => !c)}
            style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 18, cursor: 'pointer' }}>
            ☰
          </button>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 12, color: 'var(--faint)' }}>
            {new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {children}
        </main>
      </div>
    </div>
  )
}
