// ─── STAT CARD ────────────────────────────────────────────────────────────────
export function StatCard({ icon, value, label, delta, deltaDir, color, bg }) {
  return (
    <div className="stat-card" style={{ "--stat-color": color, "--stat-bg": bg }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {delta && (
        <div className={`stat-delta ${deltaDir === "up" ? "up" : "down"}`}>
          {delta}
        </div>
      )}
    </div>
  );
}

// ─── BADGE ────────────────────────────────────────────────────────────────────
export function Badge({ children, variant = "green", dot = false }) {
  return (
    <span className={`badge badge-${variant}`}>
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  );
}

// ─── FLOW ROW ─────────────────────────────────────────────────────────────────
export function FlowRow({ label, value, type }) {
  return (
    <div className={`flow-row${type === "deduction" ? " deduction" : ""}${type === "net" ? " net" : ""}`}>
      <span className="flow-label">{label}</span>
      <span className="flow-val">{value}</span>
    </div>
  );
}

// ─── METRIC LINE ──────────────────────────────────────────────────────────────
export function MetricLine({ label, value, valueColor }) {
  return (
    <div className="metric-line">
      <span className="metric-key">{label}</span>
      <span className={`metric-val${valueColor ? " " + valueColor : ""}`}>{value}</span>
    </div>
  );
}

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────
export function ProgressBar({ pct, color = "green", width }) {
  return (
    <div className="progress-bar" style={width ? { width } : undefined}>
      <div className={`progress-fill ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── AVATAR ───────────────────────────────────────────────────────────────────
export function Avatar({ initials, size = 32 }) {
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.35 }}>
      {initials}
    </div>
  );
}

// ─── RANK BADGE ───────────────────────────────────────────────────────────────
export function RankBadge({ rank, size = 28 }) {
  const cls = rank === 1 ? "rank-1" : rank === 2 ? "rank-2" : rank === 3 ? "rank-3" : "rank-n";
  return (
    <div className={`rank-badge ${cls}`} style={{ width: size, height: size, fontSize: size * 0.42 }}>
      {rank}
    </div>
  );
}

// ─── DRIVER INFO CELL ─────────────────────────────────────────────────────────
export function DriverInfo({ initials, name, sub, avatarSize = 32 }) {
  return (
    <div className="driver-info">
      <Avatar initials={initials} size={avatarSize} />
      <div>
        <div className="driver-name">{name}</div>
        {sub && <div className="driver-plate">{sub}</div>}
      </div>
    </div>
  );
}

// ─── CHART BARS ───────────────────────────────────────────────────────────────
export function ChartBars({ data, labels }) {
  const max = Math.max(...data);
  return (
    <div className="chart-placeholder">
      <div className="chart-bars">
        {data.map((v, i) => {
          const h = Math.round((v / max) * 100);
          const active = i === data.length - 1;
          return (
            <div
              key={i}
              className={`chart-bar${active ? " active" : ""}`}
              style={{ height: `${h}%` }}
              title={`€${v.toLocaleString()}`}
            />
          );
        })}
      </div>
      {labels && (
        <div className="chart-labels">
          {labels.map((l, i) => <span key={i}>{l}</span>)}
        </div>
      )}
    </div>
  );
}

// ─── TOGGLE ───────────────────────────────────────────────────────────────────
export function Toggle({ checked, onChange, label, disabled }) {
  return (
    <div className="toggle-wrap">
      <div
        className={`toggle${checked ? " on" : ""}`}
        style={disabled ? { opacity: 0.4, pointerEvents: "none" } : undefined}
        onClick={() => !disabled && onChange && onChange(!checked)}
      />
      <span className={`toggle-label${disabled ? " disabled" : ""}`}>{label}</span>
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
export function Modal({ id, open, onClose, title, subtitle, children, actions }) {
  if (!open) return null;
  return (
    <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        {title && <div className="modal-title">{title}</div>}
        {subtitle && <div className="modal-subtitle">{subtitle}</div>}
        {children}
        {actions && <div className="modal-actions">{actions}</div>}
      </div>
    </div>
  );
}

// ─── CARD ─────────────────────────────────────────────────────────────────────
export function Card({ title, children, style, headerRight }) {
  return (
    <div className="card" style={style}>
      {(title || headerRight) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: title ? 12 : 0 }}>
          {title && <div className="card-title" style={{ marginBottom: 0 }}>{title}</div>}
          {headerRight}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── PAGE HEADER ──────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, right }) {
  return (
    <div className="page-header" style={right ? { display: "flex", justifyContent: "space-between", alignItems: "flex-start" } : undefined}>
      <div>
        <div className="page-title">{title}</div>
        {subtitle && <div className="page-subtitle">{subtitle}</div>}
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

// ─── TABS ──────────────────────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs">
      {tabs.map((tab) => (
        <div key={tab} className={`tab${active === tab ? " active" : ""}`} onClick={() => onChange(tab)}>
          {tab}
        </div>
      ))}
    </div>
  );
}

// ─── LOAN BREAKDOWN ───────────────────────────────────────────────────────────
export function LoanBreakdown({ amount, weeks, interestRate = 0.01 }) {
  const interest = amount * interestRate * weeks;
  const total = amount + interest;
  const weekly = total / weeks;
  return (
    <div className="loan-breakdown">
      <div className="loan-row"><span>Valor</span><span>€{amount.toFixed(2)}</span></div>
      <div className="loan-row"><span>Semanas</span><span>{weeks} semanas</span></div>
      <div className="loan-row"><span>Total juros (1%/sem)</span><span style={{ color: "var(--amber)" }}>€{interest.toFixed(2)}</span></div>
      <div className="loan-row total"><span>Total a reembolsar</span><strong>€{total.toFixed(2)}</strong></div>
    </div>
  );
}

// ─── MONTH DOTS (purchase progress) ──────────────────────────────────────────
export function MonthDots({ total = 24, paid = 15, current = 15 }) {
  return (
    <div className="purchase-months">
      {Array.from({ length: total }).map((_, i) => {
        const cls = i < paid ? "paid" : i === current ? "current" : "";
        return <div key={i} className={`month-dot${cls ? " " + cls : ""}`} />;
      })}
    </div>
  );
}
