import { useState } from "react";
import { Card, PageHeader, MetricLine } from "../components/ui";
import AddMaintenanceModal from "../components/modals/AddMaintenanceModal";

const HISTORY = [
  { icon: "🔧", title: "Revisão periódica", date: "15 Mar 2025", cost: "€180", shop: "Oficina Lisboa Centro", notes: "Óleo, filtros, pastilhas travão dianteiro" },
  { icon: "🛞", title: "Substituição de pneus", date: "02 Feb 2025", cost: "€320", shop: "Pneu Express", notes: "4 pneus Michelin Energy Saver 205/55 R16" },
  { icon: "⚡", title: "Reparação sistema elétrico", date: "10 Jan 2025", cost: "€95", shop: "Oficina Lisboa Norte", notes: "Sensor temperatura motor" },
];

export default function Maintenance() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="page active">
      <PageHeader
        title="Manutenção de Veículos"
        subtitle="Histórico e custos de manutenção"
      />

      <div className="grid-6-4">
        {/* Timeline */}
        <Card
          title="HISTÓRICO — Toyota Camry (44-XB-92)"
          headerRight={
            <button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>
              + Registar
            </button>
          }
        >
          <div className="maint-timeline">
            {HISTORY.map((item, i) => (
              <div key={i} className="maint-item">
                <div className="maint-dot">{item.icon}</div>
                <div className="maint-content">
                  <div className="maint-title">{item.title}</div>
                  <div className="maint-meta">
                    {item.date} · <span style={{ color: "var(--red)" }}>{item.cost}</span> · {item.shop}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 4 }}>{item.notes}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Rentability dashboard */}
        <Card title="DASHBOARD RENTABILIDADE">
          <div
            className="upi-card"
            style={{ marginBottom: 14, background: "linear-gradient(135deg,rgba(0,229,160,0.08),transparent)" }}
          >
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text3)", marginBottom: 8 }}>
              MARGEM TOTAL — 44-XB-92
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: "var(--accent)" }}>
              €4,820
            </div>
          </div>
          <MetricLine label="💶 Receita total gerada" value="+€26,400" valueColor="green" />
          <MetricLine label="⚡ Custo energia" value="-€1,840" valueColor="red" />
          <MetricLine label="🔧 Custo manutenção" value="-€595" valueColor="red" />
          <MetricLine label="🛣️ Portagens" value="-€420" valueColor="red" />
          <MetricLine label="💰 Pagas a motorista" value="-€18,725" valueColor="red" />
        </Card>
      </div>

      <AddMaintenanceModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
