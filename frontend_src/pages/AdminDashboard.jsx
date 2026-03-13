import { StatCard, ChartBars, Card, PageHeader, Badge, ProgressBar, RankBadge, Avatar, DriverInfo } from "../components/ui";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const WEEKLY_REVENUE = [28400, 31200, 29800, 33100, 30200, 32500, 34820];
const WEEKLY_LABELS = ["Sem 6", "Sem 7", "Sem 8", "Sem 9", "Sem 10", "Sem 11", "Sem 12"];

const FLEETS = [
  { name: "Frota Lisboa", type: "PureDrive", vehicles: 48, occupancy: 82, badge: "green" },
  { name: "Frota Porto", type: "PureDrive · 32 veículos", vehicles: 32, occupancy: 75, badge: "green" },
  { name: "FleetPro SaaS", type: "Externo · 18 veículos", vehicles: 18, occupancy: 61, badge: "blue", isSaas: true },
];

const TOP_DRIVERS = [
  { rank: 1, initials: "CM", name: "Carlos Mendes", fleet: "Frota Lisboa", revenue: "€1,842", bonus: "+€50 bónus", gold: true },
  { rank: 2, initials: "MP", name: "Miguel Pinto", fleet: "Frota Lisboa", revenue: "€1,730", bonus: "+€25 bónus" },
  { rank: 3, initials: "SR", name: "Sofia Rodrigues", fleet: "Frota Porto", revenue: "€1,690", bonus: "+€10 bónus" },
];

const PENDING_LOANS = [
  { initials: "JO", name: "João Oliveira", fleet: "Frota Porto", amount: "€800" },
  { initials: "RL", name: "Rui Lima", fleet: "Frota Lisboa", amount: "€1,200" },
  { initials: "AF", name: "Ana Faria", fleet: "FleetPro", amount: "€500" },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function AdminDashboard({ navigate }) {
  return (
    <div className="page active">
      <PageHeader
        title="Dashboard Global"
        subtitle="Visão consolidada — Todas as frotas · Semana 12, 2025"
      />

      {/* ── KPI STATS ── */}
      <div className="stats-grid">
        <StatCard icon="🚗" value="147" label="Veículos Ativos" delta="↑ +8 vs. mês anterior" deltaDir="up" color="var(--accent)" bg="var(--accent-dim)" />
        <StatCard icon="👥" value="134" label="Motoristas" delta="↑ +5 este mês" deltaDir="up" color="var(--blue)" bg="var(--blue-dim)" />
        <StatCard icon="💶" value="€142k" label="Receita Mensal" delta="↑ +12.4% vs. anterior" deltaDir="up" color="var(--amber)" bg="var(--amber-dim)" />
        <StatCard icon="💠" value="8,940" label="UPI Gerados" delta="↑ +340 esta semana" deltaDir="up" color="var(--purple)" bg="var(--purple-dim)" />
      </div>

      {/* ── REVENUE CHART + FLEETS ── */}
      <div className="grid-7-3">
        <Card title="RECEITAS SEMANAIS — TODAS AS FROTAS">
          <ChartBars data={WEEKLY_REVENUE} labels={WEEKLY_LABELS} />
          <div style={{ display: "flex", gap: 20, marginTop: 14 }}>
            <div>
              <div className="big-number accent">€34,820</div>
              <div className="big-number-label">Receita bruta sem. 12</div>
            </div>
            <div>
              <div className="big-number blue">€22,150</div>
              <div className="big-number-label">Pago a motoristas</div>
            </div>
            <div>
              <div className="big-number amber">€12,670</div>
              <div className="big-number-label">Margem empresa</div>
            </div>
          </div>
        </Card>

        <Card title="FROTAS ATIVAS">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {FLEETS.map((f) => (
              <div key={f.name} className="fleet-mini-card">
                <div className="fleet-mini-header">
                  <div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <strong style={{ fontSize: 13 }}>{f.name}</strong>
                      {f.isSaas && <span className="saas-tag">SaaS</span>}
                    </div>
                    <div className="fleet-mini-sub">{f.isSaas ? `Externo · ${f.vehicles} veículos` : `PureDrive · ${f.vehicles} veículos`}</div>
                  </div>
                  <Badge variant={f.badge} dot>{f.isSaas ? "SaaS" : "Ativa"}</Badge>
                </div>
                <ProgressBar pct={f.occupancy} color={f.isSaas ? "blue" : "green"} />
                <div className="fleet-mini-occ">{f.occupancy}% ocupação</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── TOP DRIVERS + PENDING LOANS ── */}
      <div className="grid-2">
        <Card title="RANKING SEMANAL — TOP MOTORISTAS">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {TOP_DRIVERS.map((d) => (
              <div key={d.name} className={`top-driver${d.gold ? " gold" : ""}`}>
                <RankBadge rank={d.rank} />
                <Avatar initials={d.initials} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{d.name}</div>
                  <div className="driver-plate">{d.fleet}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: d.gold ? "var(--amber)" : undefined }}>{d.revenue}</div>
                  <div className="driver-plate">{d.bonus}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="EMPRÉSTIMOS PENDENTES">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Motorista</th>
                  <th>Valor</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {PENDING_LOANS.map((l) => (
                  <tr key={l.name}>
                    <td>
                      <DriverInfo initials={l.initials} name={l.name} sub={l.fleet} avatarSize={26} />
                    </td>
                    <td><span style={{ fontFamily: "var(--font-mono)" }}>{l.amount}</span></td>
                    <td><Badge variant="amber">Pendente</Badge></td>
                    <td><button className="btn btn-primary btn-sm">✓ Aprovar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
