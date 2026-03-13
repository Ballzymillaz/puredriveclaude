import { Card, PageHeader, Badge, Avatar, ProgressBar } from "../components/ui";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const TOP3 = [
  { rank: 1, medal: "🥇", cls: "rank-1", initials: "CM", name: "Carlos Mendes", fleet: "Frota Lisboa", revenue: "€7,240", bonus: "+€50 bónus", bonusVariant: "amber", gold: true },
  { rank: 2, medal: "🥈", cls: "rank-2", initials: "MP", name: "Miguel Pinto", fleet: "Frota Lisboa", revenue: "€6,890", bonus: "+€25 bónus", bonusStyle: { background: "rgba(148,163,184,0.15)", color: "#94a3b8", border: "1px solid rgba(148,163,184,0.3)" } },
  { rank: 3, medal: "🥉", cls: "rank-3", initials: "SR", name: "Sofia Rodrigues", fleet: "Frota Porto", revenue: "€6,580", bonus: "+€10 bónus", bonusStyle: { background: "rgba(180,120,80,0.15)", color: "#b47850", border: "1px solid rgba(180,120,80,0.3)" } },
];

const FULL_RANKING = [
  { rank: 4, initials: "JO", name: "João Oliveira", fleet: "FleetPro SaaS", revenue: "€6,240", trips: 312, score: 79, bonus: "—", isSaas: true },
  { rank: 5, initials: "AF", name: "Ana Faria", fleet: "FleetPro SaaS", revenue: "€5,900", trips: 287, score: 76, bonus: "—", isSaas: true },
  { rank: 6, initials: "RL", name: "Rui Lima", fleet: "Frota Lisboa", revenue: "€3,280", trips: 198, score: 66, bonus: "—" },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function Ranking() {
  return (
    <div className="page active">
      <PageHeader
        title="Ranking de Motoristas"
        subtitle="Março 2025 · Baseado na receita bruta mensal"
      />

      {/* ── PODIUM TOP 3 ── */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        {TOP3.map((d) => (
          <div
            key={d.rank}
            className={`top-driver${d.gold ? " gold" : ""}`}
            style={{ flexDirection: "column", textAlign: "center", padding: 24 }}
          >
            <div className={`rank-badge ${d.cls}`} style={{ width: 48, height: 48, fontSize: 20, margin: "0 auto 12px" }}>
              {d.medal}
            </div>
            <Avatar initials={d.initials} size={48} style={{ margin: "0 auto 10px" }} />
            <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800 }}>{d.name}</div>
            <div style={{ fontSize: 11, color: "var(--text3)", margin: "2px 0 10px" }}>{d.fleet}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: d.gold ? "var(--amber)" : undefined }}>
              {d.revenue}
            </div>
            <div style={{ fontSize: 11, color: "var(--text3)" }}>Receita bruta mensal</div>
            <div style={{ marginTop: 10 }}>
              {d.bonusVariant
                ? <Badge variant={d.bonusVariant}>{d.bonus}</Badge>
                : <span className="badge" style={d.bonusStyle}>{d.bonus}</span>
              }
            </div>
          </div>
        ))}
      </div>

      {/* ── FULL TABLE (positions 4+) ── */}
      <Card>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Pos.</th>
                <th>Motorista</th>
                <th>Frota</th>
                <th>Receita Mês</th>
                <th>Viagens</th>
                <th>Score</th>
                <th>Bónus</th>
              </tr>
            </thead>
            <tbody>
              {FULL_RANKING.map((d) => (
                <tr key={d.rank}>
                  <td>
                    <div className="rank-badge rank-n" style={{ width: 24, height: 24, fontSize: 10 }}>{d.rank}</div>
                  </td>
                  <td>
                    <div className="driver-info">
                      <Avatar initials={d.initials} size={24} />
                      {d.name}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      {d.fleet}
                      {d.isSaas && <span className="saas-tag">SaaS</span>}
                    </div>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{d.revenue}</td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{d.trips}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <ProgressBar pct={d.score} color={d.score >= 80 ? "green" : "amber"} width="60px" />
                      <span style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}>{d.score}</span>
                    </div>
                  </td>
                  <td style={{ color: "var(--text3)" }}>{d.bonus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
