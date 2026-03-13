import { Card, PageHeader, Badge, MetricLine, ProgressBar } from "../components/ui";

const FLEETS = [
  {
    name: "Frota Lisboa",
    badge: { label: "PureDrive", variant: "green" },
    vehicles: 48, drivers: 42,
    manager: "Ana Ferreira",
    revenue: "€78,400", revenueColor: "green",
    occupancy: 87.5,
    borderColor: "var(--accent)",
    valueColor: "var(--accent)",
    barColor: "green",
  },
  {
    name: "Frota Porto",
    badge: { label: "PureDrive", variant: "green" },
    vehicles: 32, drivers: 28,
    manager: "Pedro Costa",
    revenue: "€48,200", revenueColor: "green",
    occupancy: 75,
    borderColor: undefined,
    valueColor: "var(--accent)",
    barColor: "green",
  },
  {
    name: "FleetPro",
    badge: { label: "199€/mês", variant: "blue" },
    vehicles: 18, drivers: 15,
    manager: "João Silva",
    managerLabel: "Gestor SaaS",
    revenue: "€16,200", revenueColor: "var(--blue)",
    occupancy: 61,
    borderColor: "var(--blue)",
    valueColor: "var(--blue)",
    barColor: "blue",
    isSaas: true,
  },
];

export default function Fleets() {
  return (
    <div className="page active">
      <PageHeader
        title="Frotas"
        subtitle="3 frotas ativas · 147 veículos totais"
        right={<button className="btn btn-primary">+ Nova Frota</button>}
      />

      <div className="grid-3">
        {FLEETS.map((f) => (
          <Card key={f.name} style={f.borderColor ? { borderColor: f.borderColor } : undefined}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 800 }}>{f.name}</div>
                {f.isSaas && <span className="saas-tag">SaaS</span>}
              </div>
              <Badge variant={f.badge.variant}>{f.badge.label}</Badge>
            </div>

            <div className="grid-2" style={{ gap: 8, marginBottom: 14 }}>
              <div className="metric-mini-box">
                <div className="metric-mini-value" style={{ color: f.valueColor }}>{f.vehicles}</div>
                <div className="metric-mini-label">Veículos</div>
              </div>
              <div className="metric-mini-box">
                <div className="metric-mini-value">{f.drivers}</div>
                <div className="metric-mini-label">Motoristas</div>
              </div>
            </div>

            <MetricLine label={f.managerLabel || "Fleet Manager"} value={f.manager} />
            <MetricLine
              label="Receita mensal"
              value={f.revenue}
              valueColor={f.revenueColor === "green" ? "green" : undefined}
            />

            <div style={{ marginTop: 12 }}>
              <ProgressBar pct={f.occupancy} color={f.barColor} />
              <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 4, fontFamily: "var(--font-mono)" }}>
                {f.occupancy}% ocupação
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
