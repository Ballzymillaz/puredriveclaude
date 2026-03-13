import { StatCard, Card, PageHeader, FlowRow, ProgressBar, MonthDots } from "../components/ui";
import LoanRequestModal from "../components/modals/LoanRequestModal";
import { useState } from "react";

export default function MotoristaDashboard({ navigate }) {
  const [loanModalOpen, setLoanModalOpen] = useState(false);

  return (
    <div className="page active">
      <PageHeader
        title="Olá, Carlos 👋"
        subtitle="Semana 12 · Toyota Camry · 44-XB-92"
      />

      {/* ── KPI STATS ── */}
      <div className="stats-grid">
        <StatCard icon="💶" value="€870" label="Pagamento Semana 12" delta="↑ Sexta-feira" deltaDir="up" color="var(--accent)" bg="var(--accent-dim)" />
        <StatCard icon="📊" value="92" label="Pontuação" delta="↑ +3 pontos" deltaDir="up" color="var(--blue)" bg="var(--blue-dim)" />
        <StatCard icon="🏆" value="#1" label="Ranking Mensal" delta="+€50 bónus" deltaDir="up" color="var(--amber)" bg="var(--amber-dim)" />
        <StatCard icon="◈" value="312" label="UPI Totais" delta="+49 esta semana" deltaDir="up" color="var(--purple)" bg="var(--purple-dim)" />
      </div>

      <div className="grid-6-4">
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Weekly payment breakdown */}
          <Card title="DETALHE DO PAGAMENTO — SEMANA 12">
            <FlowRow label="🟢 Uber" value="€820" />
            <FlowRow label="🟢 Bolt" value="€420" />
            <FlowRow label="⚡ Energia" value="-€62" type="deduction" />
            <FlowRow label="🛣️ Portagens" value="-€18" type="deduction" />
            <FlowRow label="🚗 Opção de Compra" value="-€290" type="deduction" />
            <FlowRow label="✅ A Receber" value="€870" type="net" />
          </Card>

          {/* Vehicle purchase progress */}
          <Card title="OPÇÃO DE COMPRA — TOYOTA CAMRY">
            <div className="purchase-progress">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800 }}>€4,350</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>Pago até agora</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--amber)" }}>€18,775</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>Restante</div>
                </div>
              </div>

              <ProgressBar pct={18.8} color="green" />
              <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-mono)", marginTop: 6 }}>
                19% concluído · 24 meses · €290/mês atual
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 6, fontFamily: "var(--font-mono)" }}>
                  MESES DE PAGAMENTO
                </div>
                <MonthDots total={24} paid={15} current={15} />
              </div>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* UPI balance */}
          <div className="upi-card">
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--purple)", marginBottom: 8, letterSpacing: 1 }}>
              SALDO UPI
            </div>
            <div className="upi-value">312 ◈</div>
            <div className="upi-label">94 ◈ vestidos · 218 ◈ em vesting</div>
            <div style={{ marginTop: 12, height: 4, background: "rgba(168,85,247,0.2)", borderRadius: 2 }}>
              <div style={{ width: "30%", height: "100%", background: "var(--purple)", borderRadius: 2 }} />
            </div>
            <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 4, fontFamily: "var(--font-mono)" }}>
              Próximo vesting: Jan 2026
            </div>
          </div>

          {/* Quick actions */}
          <Card title="AÇÕES RÁPIDAS">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                className="btn btn-ghost"
                style={{ justifyContent: "flex-start" }}
                onClick={() => setLoanModalOpen(true)}
              >
                💳 Pedir Empréstimo
              </button>
              <button
                className="btn btn-ghost"
                style={{ justifyContent: "flex-start" }}
                onClick={() => navigate("messages")}
              >
                ✉️ Contactar Fleet Manager
              </button>
              <button
                className="btn btn-ghost"
                style={{ justifyContent: "flex-start" }}
                onClick={() => navigate("reports")}
              >
                📊 Ver Histórico Pagamentos
              </button>
            </div>
          </Card>

          {/* Ranking position */}
          <Card title="RANKING — POSIÇÃO ATUAL">
            <div style={{ textAlign: "center", padding: 16 }}>
              <div style={{ fontSize: 48 }}>🥇</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: "var(--amber)" }}>
                #1
              </div>
              <div style={{ fontSize: 12, color: "var(--text3)" }}>de 134 motoristas</div>
              <div style={{ marginTop: 10 }}>
                <span className="badge badge-amber">+€50 bónus este mês</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <LoanRequestModal open={loanModalOpen} onClose={() => setLoanModalOpen(false)} />
    </div>
  );
}
