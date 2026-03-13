import { useState } from "react";
import { SIM_ROLES } from "../App";

// ─── SIDEBAR DEFINITIONS PER ROLE ────────────────────────────────────────────

const ADMIN_NAV = [
  {
    section: "Principal",
    items: [
      { id: "admin-dash", label: "Dashboard", icon: "grid" },
      { id: "drivers", label: "Motoristas", icon: "users" },
      { id: "vehicles", label: "Veículos", icon: "car" },
      { id: "payments", label: "Pagamentos", icon: "credit-card" },
    ],
  },
  {
    section: "Gestão",
    items: [
      { id: "companies", label: "Companies", icon: "building" },
      { id: "fleets", label: "Frotas", icon: "layers" },
      { id: "loans", label: "Empréstimos", icon: "zap", badge: 3 },
      { id: "purchase", label: "Opção de Compra", icon: "star" },
    ],
  },
  {
    section: "Análise",
    items: [
      { id: "ranking", label: "Ranking", icon: "bar-chart" },
      { id: "reports", label: "Relatórios", icon: "file-text" },
      { id: "maintenance", label: "Manutenção", icon: "tool" },
      { id: "upi", label: "UPI", icon: "clock" },
    ],
  },
  {
    section: "Comunicação",
    items: [{ id: "messages", label: "Mensagens", icon: "message", badge: 5 }],
  },
];

const MOTORISTA_NAV = [
  {
    section: "Motorista",
    items: [
      { id: "motorista-dash", label: "Dashboard", icon: "grid" },
      { id: "payments", label: "Pagamentos", icon: "credit-card" },
      { id: "ranking", label: "Ranking", icon: "bar-chart" },
      { id: "purchase", label: "Opção de Compra", icon: "star" },
      { id: "upi", label: "UPI", icon: "clock" },
    ],
  },
  {
    section: null,
    items: [{ id: "messages", label: "Mensagens", icon: "message" }],
  },
];

const FLEET_MANAGER_NAV = [
  {
    section: "Fleet Manager",
    items: [
      { id: "admin-dash", label: "Dashboard", icon: "grid" },
      { id: "drivers", label: "Motoristas", icon: "users" },
      { id: "vehicles", label: "Veículos", icon: "car" },
      { id: "payments", label: "Pagamentos", icon: "credit-card" },
      { id: "loans", label: "Empréstimos", icon: "zap" },
      { id: "ranking", label: "Ranking", icon: "bar-chart" },
      { id: "reports", label: "Relatórios", icon: "file-text" },
      { id: "messages", label: "Mensagens", icon: "message" },
    ],
  },
];

const FLEET_SAAS_NAV = [
  {
    section: "Fleet SaaS",
    sectionColor: "blue",
    items: [
      { id: "admin-dash", label: "Dashboard", icon: "grid" },
      { id: "drivers", label: "Motoristas", icon: "users" },
      { id: "vehicles", label: "Veículos", icon: "car" },
      { id: "payments", label: "Pagamentos", icon: "credit-card" },
      { id: "loans", label: "Empréstimos", icon: "zap" },
      { id: "ranking", label: "Ranking", icon: "bar-chart" },
      { id: "reports", label: "Relatórios", icon: "file-text" },
      { id: "messages", label: "Mensagens", icon: "message" },
    ],
  },
];

const NAV_BY_ROLE = {
  admin: ADMIN_NAV,
  motorista: MOTORISTA_NAV,
  "fleet-manager": FLEET_MANAGER_NAV,
  "fleet-saas": FLEET_SAAS_NAV,
};

// ─── LAYOUT ───────────────────────────────────────────────────────────────────

export default function Layout({
  children,
  currentPage,
  navigate,
  currentRole,
  isSimulating,
  simulate,
  stopSimulation,
}) {
  const [simMenuOpen, setSimMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const role = SIM_ROLES[currentRole];
  const navSections = NAV_BY_ROLE[currentRole] || ADMIN_NAV;

  const closeMenus = () => {
    setSimMenuOpen(false);
    setUserMenuOpen(false);
  };

  return (
    <div className="app-shell" onClick={closeMenus}>
      {/* ── TOPBAR ── */}
      <header className="topbar">
        <div className="topbar-logo">
          <span className="topbar-logo-dot" />
          PureDrive
        </div>

        {isSimulating && (
          <div className="topbar-sim-badge">
            <span className="sim-dot" />
            <span>A simular: {role.label}</span>
            <button className="sim-close" onClick={stopSimulation}>✕</button>
          </div>
        )}

        <div className="topbar-right">
          {/* Simulate dropdown */}
          <div className="dropdown" onClick={(e) => e.stopPropagation()}>
            <button
              className="btn-sim"
              onClick={() => { setSimMenuOpen(!simMenuOpen); setUserMenuOpen(false); }}
            >
              ⚡ Simular
            </button>
            {simMenuOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-title">Simular Utilizador</div>
                <div className="dropdown-item" onClick={() => { simulate("motorista"); closeMenus(); }}>
                  🧑‍💼
                  <div>
                    <div className="dropdown-item-title">Motorista</div>
                    <div className="dropdown-item-sub">Carlos Mendes</div>
                  </div>
                </div>
                <div className="dropdown-item" onClick={() => { simulate("fleet-manager"); closeMenus(); }}>
                  🏢
                  <div>
                    <div className="dropdown-item-title">Fleet Manager Interno</div>
                    <div className="dropdown-item-sub">Ana Ferreira</div>
                  </div>
                </div>
                <div className="dropdown-item" onClick={() => { simulate("fleet-saas"); closeMenus(); }}>
                  ☁️
                  <div>
                    <div className="dropdown-item-title">Fleet Manager SaaS</div>
                    <div className="dropdown-item-sub">João Silva · FleetPro</div>
                  </div>
                </div>
                <div className="dropdown-divider" />
                <div className="dropdown-item warn" onClick={() => { stopSimulation(); closeMenus(); }}>
                  🔑 Voltar ao Admin
                </div>
              </div>
            )}
          </div>

          {/* Messages shortcut */}
          <div className="notif" onClick={() => navigate("messages")}>
            <button className="btn btn-ghost btn-icon btn-sm">✉️</button>
            <div className="notif-dot" />
          </div>

          {/* User menu */}
          <div className="dropdown" onClick={(e) => e.stopPropagation()}>
            <div
              className="topbar-avatar"
              onClick={() => { setUserMenuOpen(!userMenuOpen); setSimMenuOpen(false); }}
            >
              {role.avatar}
            </div>
            {userMenuOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-item">⚙️ Definições</div>
                <div className="dropdown-item">👤 Perfil</div>
                <div className="dropdown-divider" />
                <div className="dropdown-item warn">🚪 Sair</div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="layout">
        {/* ── SIDEBAR ── */}
        <nav className="sidebar">
          {navSections.map((section, si) => (
            <div key={si}>
              {si > 0 && <div className="sidebar-divider" />}
              <div className="sidebar-section">
                {section.section && (
                  <div
                    className="sidebar-label"
                    style={section.sectionColor === "blue" ? { color: "var(--blue)" } : undefined}
                  >
                    {section.section}
                  </div>
                )}
                {section.items.map((item) => (
                  <div
                    key={item.id}
                    className={`nav-item ${currentPage === item.id ? "active" : ""}`}
                    onClick={() => navigate(item.id)}
                  >
                    <NavIcon name={item.icon} />
                    {item.label}
                    {item.badge && <span className="nav-badge">{item.badge}</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* SaaS notice */}
          {currentRole === "fleet-saas" && (
            <>
              <div className="sidebar-divider" />
              <div className="sidebar-section">
                <div className="saas-notice">
                  ☁️ <strong>Modo SaaS</strong>
                  <br />
                  <span className="saas-notice-sub">UPI e Opção de Compra não disponíveis</span>
                </div>
              </div>
            </>
          )}
        </nav>

        {/* ── MAIN ── */}
        <main className="main">{children}</main>
      </div>
    </div>
  );
}

function NavIcon({ name }) {
  const icons = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="2"/></>,
    users: <><circle cx="12" cy="8" r="4" strokeWidth="2"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeWidth="2" strokeLinecap="round"/></>,
    car: <><path d="M3 17v-2a4 4 0 014-4h10a4 4 0 014 4v2" strokeWidth="2"/><circle cx="7.5" cy="17.5" r="1.5" strokeWidth="2"/><circle cx="16.5" cy="17.5" r="1.5" strokeWidth="2"/><path d="M5 11l2-5h10l2 5" strokeWidth="2"/></>,
    "credit-card": <><rect x="2" y="6" width="20" height="14" rx="2" strokeWidth="2"/><path d="M2 10h20" strokeWidth="2"/></>,
    building: <><path d="M3 21V7l9-4 9 4v14" strokeWidth="2"/><path d="M9 21V13h6v8" strokeWidth="2"/></>,
    layers: <><circle cx="12" cy="12" r="10" strokeWidth="2"/><path d="M8 12h8M12 8v8" strokeWidth="2"/></>,
    zap: <><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeWidth="2"/></>,
    star: <><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" strokeWidth="2"/></>,
    "bar-chart": <><path d="M18 20V10M12 20V4M6 20v-6" strokeWidth="2" strokeLinecap="round"/></>,
    "file-text": <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeWidth="2"/><polyline points="14 2 14 8 20 8" strokeWidth="2"/><line x1="16" y1="13" x2="8" y2="13" strokeWidth="2"/></>,
    tool: <><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" strokeWidth="2"/></>,
    clock: <><circle cx="12" cy="12" r="10" strokeWidth="2"/><path d="M12 6v6l4 2" strokeWidth="2"/></>,
    message: <><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeWidth="2"/></>,
  };
  return (
    <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {icons[name] || null}
    </svg>
  );
}
