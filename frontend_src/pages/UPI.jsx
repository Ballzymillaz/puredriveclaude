import { StatCard, Card, PageHeader, DriverInfo, ProgressBar } from "../components/ui";

const UPI_DRIVERS = [
  { initials: "CM", name: "Carlos Mendes", total: "312 ◈", vesting: "218 ◈", vested: "94 ◈", pct: 70, monthly: "+49 ◈" },
  { initials: "MP", name: "Miguel Pinto", total: "280 ◈", vesting: "196 ◈", vested: "84 ◈", pct: 65, monthly: "+45 ◈" },
  { initials: "SR", name: "Sofia Rodrigues", total: "264 ◈", vesting: "185 ◈", vested: "79 ◈", pct: 60, monthly: "+42 ◈" },
  { initials: "RL", name: "Rui Lima", total: "98 ◈", vesting: "73 ◈", vested: "25 ◈", pct: 25, monthly: "+16 ◈" },
];

export default function UPI() {
  return (
    <div className="page active">
      <PageHeader
        title="Sistema UPI"
        subtitle="Unidade de Participação Interna · 4% dos rendimentos · Vesting anual 25%"
      />

      <div className="stats-grid">
        <StatCard icon="◈" value="8,940" label="UPI em circulação" color="var(--purple)" bg="var(--purple-dim)" />
        <StatCard icon="🔒" value="6,240" label="Em vesting" color="var(--blue)" bg="var(--blue-dim)" />
        <StatCard icon="✅" value="2,700" label="Vestidos" color="var(--accent)" bg="var(--accent-dim)" />
        <StatCard icon="📅" value="Jan 2026" label="Próximo vesting" color="var(--amber)" bg="var(--amber-dim)" />
      </div>

      <Card title="UPI POR MOTORISTA">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Motorista</th>
                <th>UPI Total</th>
                <th>Em Vesting</th>
                <th>Vestidos</th>
                <th>Prog. Vesting</th>
                <th>Geração mensal</th>
              </tr>
            </thead>
            <tbody>
              {UPI_DRIVERS.map((d) => (
                <tr key={d.name}>
                  <td><DriverInfo initials={d.initials} name={d.name} avatarSize={26} /></td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "var(--purple)" }}>{d.total}</td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{d.vesting}</td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>{d.vested}</td>
                  <td>
                    <ProgressBar pct={d.pct} color="purple" width="80px" />
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{d.monthly}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SaaS exclusion notice */}
        <div style={{
          marginTop: 14,
          padding: 12,
          background: "var(--amber-dim)",
          border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: "var(--radius)",
          fontSize: 12,
          color: "var(--amber)",
        }}>
          ⚠️ Frotas SaaS não têm acesso ao sistema UPI. Apenas motoristas PureDrive participam.
        </div>
      </Card>
    </div>
  );
}
