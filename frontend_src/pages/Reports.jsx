import { StatCard, ChartBars, Card, PageHeader, MetricLine } from "../components/ui";

const MONTHLY_REVENUE = [118000, 124000, 128000, 132000, 136000, 142000];
const MONTHLY_LABELS = ["Out", "Nov", "Dez", "Jan", "Fev", "Mar"];

export default function Reports() {
  return (
    <div className="page active">
      <PageHeader
        title="Relatório de Frota"
        subtitle="Março 2025 · Todas as frotas"
        right={
          <div style={{ display: "flex", gap: 8 }}>
            <select className="form-input form-select" style={{ maxWidth: 160 }}>
              <option>Todas as frotas</option>
              <option>Frota Lisboa</option>
              <option>Frota Porto</option>
            </select>
            <button className="btn btn-ghost">⬇ Exportar CSV</button>
          </div>
        }
      />

      <div className="stats-grid">
        <StatCard icon="👥" value="127" label="Motoristas Ativos" color="var(--accent)" bg="var(--accent-dim)" />
        <StatCard icon="💶" value="€142k" label="Receita Bruta" color="var(--blue)" bg="var(--blue-dim)" />
        <StatCard icon="📉" value="€98k" label="Pago a Motoristas" color="var(--amber)" bg="var(--amber-dim)" />
        <StatCard icon="📈" value="€44k" label="Margem Empresa" color="var(--accent)" bg="var(--accent-dim)" />
      </div>

      <div className="grid-2">
        {/* Revenue chart */}
        <Card title="EVOLUÇÃO MENSAL — RECEITAS">
          <ChartBars data={MONTHLY_REVENUE} labels={MONTHLY_LABELS} />
        </Card>

        {/* Deductions breakdown */}
        <Card title="DEDUÇÕES DO MÊS">
          <MetricLine label="⚡ Energia (Miio/Prio)" value="-€8,420" valueColor="red" />
          <MetricLine label="🛣️ Portagens (Via Verde)" value="-€2,180" valueColor="red" />
          <MetricLine label="🚗 Opções de Compra" value="-€14,700" valueColor="red" />
          <MetricLine label="💳 Reemb. Empréstimos" value="-€4,320" valueColor="red" />
          <MetricLine label="💠 UPI Gerados" value="8,940 ◈" />

          <div style={{
            marginTop: 14,
            background: "var(--accent-dim)",
            border: "1px solid rgba(0,229,160,0.15)",
            borderRadius: "var(--radius)",
            padding: 12,
            display: "flex",
            justifyContent: "space-between",
          }}>
            <span style={{ fontWeight: 700 }}>Total Pago a Motoristas</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>
              €98,380
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
