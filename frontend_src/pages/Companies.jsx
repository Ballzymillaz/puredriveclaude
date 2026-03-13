import { useState } from "react";
import { Badge, Card, PageHeader, Toggle } from "../components/ui";
import AddCompanyModal from "../components/modals/AddCompanyModal";

export default function Companies() {
  const [modalOpen, setModalOpen] = useState(false);
  const [pdToggles, setPdToggles] = useState({ upi: true, loans: true, purchase: true, ranking: true });
  const [saasToggles, setSaasToggles] = useState({ loans: true, ranking: true });

  return (
    <div className="page active">
      <PageHeader
        title="Companies"
        subtitle="Gestão de empresas operadoras"
        right={<button className="btn btn-primary" onClick={() => setModalOpen(true)}>+ Nova Company</button>}
      />

      <div className="grid-2">
        {/* PureDrive internal company */}
        <Card style={{ borderColor: "var(--accent)", background: "linear-gradient(135deg,rgba(0,229,160,0.04),var(--surface))" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800 }}>PureDrive Lda.</div>
              <div style={{ color: "var(--text2)", fontSize: 12, marginTop: 2 }}>puredrive@admin.pt · NIF 512345678</div>
            </div>
            <Badge variant="green">PureDrive</Badge>
          </div>

          <div className="grid-2" style={{ gap: 10, marginBottom: 16 }}>
            <div className="metric-mini-box">
              <div className="metric-mini-value accent">2</div>
              <div className="metric-mini-label">Frotas</div>
            </div>
            <div className="metric-mini-box">
              <div className="metric-mini-value">80</div>
              <div className="metric-mini-label">Veículos</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Toggle label="UPI Ativado" checked={pdToggles.upi} onChange={(v) => setPdToggles({ ...pdToggles, upi: v })} />
            <Toggle label="Prêtos Ativados" checked={pdToggles.loans} onChange={(v) => setPdToggles({ ...pdToggles, loans: v })} />
            <Toggle label="Opção de Compra" checked={pdToggles.purchase} onChange={(v) => setPdToggles({ ...pdToggles, purchase: v })} />
            <Toggle label="Ranking Ativado" checked={pdToggles.ranking} onChange={(v) => setPdToggles({ ...pdToggles, ranking: v })} />
          </div>
        </Card>

        {/* FleetPro SaaS external company */}
        <Card style={{ borderColor: "var(--blue)", background: "linear-gradient(135deg,rgba(59,130,246,0.04),var(--surface))" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800 }}>FleetPro SaaS</div>
              <div style={{ color: "var(--text2)", fontSize: 12, marginTop: 2 }}>joao@fleetpro.pt · NIF 598765432</div>
            </div>
            <Badge variant="blue">SaaS · 199€/mês</Badge>
          </div>

          <div className="grid-2" style={{ gap: 10, marginBottom: 16 }}>
            <div className="metric-mini-box">
              <div className="metric-mini-value blue">1</div>
              <div className="metric-mini-label">Frota</div>
            </div>
            <div className="metric-mini-box">
              <div className="metric-mini-value">18</div>
              <div className="metric-mini-label">Veículos</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {/* UPI disabled for SaaS */}
            <Toggle label="UPI — Não disponível (SaaS)" checked={false} disabled />
            <Toggle label="Prêtos Ativados" checked={saasToggles.loans} onChange={(v) => setSaasToggles({ ...saasToggles, loans: v })} />
            {/* Purchase disabled for SaaS */}
            <Toggle label="Opção de Compra — N/A (SaaS)" checked={false} disabled />
            <Toggle label="Ranking Ativado" checked={saasToggles.ranking} onChange={(v) => setSaasToggles({ ...saasToggles, ranking: v })} />
          </div>
        </Card>
      </div>

      <AddCompanyModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
