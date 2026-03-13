import { StatCard, Card, PageHeader, Badge, FlowRow, MetricLine } from "../components/ui";

const MAINTENANCE_HISTORY = [
  { icon: "🔧", title: "Revisão periódica", date: "15 Mar 2025", cost: "€180", shop: "Oficina Lisboa Centro", notes: "Óleo, filtros, pastilhas travão dianteiro" },
  { icon: "🛞", title: "Substituição de pneus", date: "02 Feb 2025", cost: "€320", shop: "Pneu Express", notes: "4 pneus Michelin Energy Saver 205/55 R16" },
  { icon: "⚡", title: "Reparação sistema elétrico", date: "10 Jan 2025", cost: "€95", shop: "Oficina Lisboa Norte", notes: "Sensor temperatura motor" },
];

export default function VehicleDetail({ navigate }) {
  return (
    <div className="page active">
      <PageHeader
        title="Toyota Camry · 44-XB-92"
        subtitle="Hybrid 2.5 · 1ª Matrícula: Março 2021 · Expiração TVDE: Março 2028"
        right={<Badge variant="green" style={{ fontSize: 13, padding: "6px 14px" }}>Ativo</Badge>}
      />

      <div className="grid-3" style={{ marginBottom: 24 }}>
        <StatCard icon="💶" value="€26,400" label="Receita Total Gerada" color="var(--accent)" bg="var(--accent-dim)" />
        <StatCard icon="🔧" value="€595" label="Custo Manutenção" color="var(--red)" bg="var(--red-dim)" />
        <StatCard icon="📈" value="€4,820" label="Margem Empresa" color="var(--amber)" bg="var(--amber-dim)" />
      </div>

      <div className="grid-2">
        {/* Vehicle info */}
        <Card title="INFORMAÇÃO DO VEÍCULO">
          <MetricLine label="Marca / Modelo" value="Toyota Camry Hybrid" />
          <MetricLine label="Matrícula" value={<Badge variant="blue">44-XB-92</Badge>} />
          <MetricLine label="1ª Matrícula" value="Março 2021" />
          <MetricLine label="Exp. TVDE (7 anos)" value="Março 2028" valueColor="amber" />
          <MetricLine label="Preço de mercado" value="€18,500" />
          <MetricLine label="Preço opção compra (+25%)" value="€23,125" valueColor="green" />
          <MetricLine label="Motorista atual" value="Carlos Mendes" />
          <MetricLine label="Frota" value="Lisboa" />
        </Card>

        {/* Profitability flow */}
        <Card title="RENTABILIDADE DO VEÍCULO">
          <FlowRow label="💶 Receita total gerada" value="€26,400" />
          <FlowRow label="⚡ Custo energia (Miio)" value="-€1,840" type="deduction" />
          <FlowRow label="🔧 Manutenção" value="-€595" type="deduction" />
          <FlowRow label="🛣️ Portagens" value="-€420" type="deduction" />
          <FlowRow label="💰 Pago a motorista" value="-€18,725" type="deduction" />
          <FlowRow label="💹 Margem empresa" value="€4,820" type="net" />
        </Card>
      </div>

      <div className="grid-6-4" style={{ marginTop: 16 }}>
        {/* Maintenance history */}
        <Card
          title="HISTÓRICO — Toyota Camry (44-XB-92)"
          headerRight={<button className="btn btn-primary btn-sm">+ Registar</button>}
        >
          <div className="maint-timeline">
            {MAINTENANCE_HISTORY.map((m, i) => (
              <div key={i} className="maint-item">
                <div className="maint-dot">{m.icon}</div>
                <div className="maint-content">
                  <div className="maint-title">{m.title}</div>
                  <div className="maint-meta">
                    {m.date} · <span style={{ color: "var(--red)" }}>{m.cost}</span> · {m.shop}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 4 }}>{m.notes}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Rentability dashboard */}
        <Card title="DASHBOARD RENTABILIDADE">
          <div className="upi-card" style={{ marginBottom: 14, background: "linear-gradient(135deg,rgba(0,229,160,0.08),transparent)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text3)", marginBottom: 8 }}>MARGEM TOTAL — 44-XB-92</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: "var(--accent)" }}>€4,820</div>
          </div>
          <MetricLine label="💶 Receita total gerada" value="+€26,400" valueColor="green" />
          <MetricLine label="⚡ Custo energia" value="-€1,840" valueColor="red" />
          <MetricLine label="🔧 Custo manutenção" value="-€595" valueColor="red" />
          <MetricLine label="🛣️ Portagens" value="-€420" valueColor="red" />
          <MetricLine label="💰 Pagas a motorista" value="-€18,725" valueColor="red" />
        </Card>
      </div>
    </div>
  );
}
