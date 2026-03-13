import { useState } from "react";
import { StatCard, Badge, Card, PageHeader, DriverInfo } from "../components/ui";
import LoanApprovalModal from "../components/modals/LoanApprovalModal";

const PENDING_LOANS = [
  { initials: "JO", name: "João Oliveira", fleet: "FleetPro SaaS", amount: 800, weeks: 4, totalWithInterest: "€832", weeklyDeduction: "€208" },
  { initials: "RL", name: "Rui Lima", fleet: "Frota Lisboa", amount: 1200, weeks: 6, totalWithInterest: "€1,272", weeklyDeduction: "€212" },
  { initials: "AF", name: "Ana Faria", fleet: "FleetPro", amount: 500, weeks: 4, totalWithInterest: "€520", weeklyDeduction: "€130" },
];

export default function Loans() {
  const [selectedLoan, setSelectedLoan] = useState(null);

  return (
    <div className="page active">
      <PageHeader
        title="Gestão de Empréstimos"
        subtitle="3 pedidos pendentes · 12 ativos · Taxa 1%/semana · Máx. 6 meses"
      />

      <div className="stats-grid">
        <StatCard icon="⏳" value="3" label="Pendentes" color="var(--amber)" bg="var(--amber-dim)" />
        <StatCard icon="✅" value="12" label="Ativos" color="var(--blue)" bg="var(--blue-dim)" />
        <StatCard icon="💶" value="€14,200" label="Total em dívida" color="var(--accent)" bg="var(--accent-dim)" />
        <StatCard icon="📈" value="€820" label="Juro acumulado" color="var(--purple)" bg="var(--purple-dim)" />
      </div>

      <Card title="PEDIDOS PENDENTES">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Motorista</th>
                <th>Frota</th>
                <th>Valor</th>
                <th>Duração</th>
                <th>Total c/ juros</th>
                <th>Dedução/sem</th>
                <th>Estado</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {PENDING_LOANS.map((l) => (
                <tr key={l.name}>
                  <td><DriverInfo initials={l.initials} name={l.name} avatarSize={26} /></td>
                  <td>{l.fleet}</td>
                  <td><span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>€{l.amount.toLocaleString()}</span></td>
                  <td><span style={{ fontFamily: "var(--font-mono)" }}>{l.weeks} sem.</span></td>
                  <td><span style={{ fontFamily: "var(--font-mono)", color: "var(--amber)" }}>{l.totalWithInterest}</span></td>
                  <td><span style={{ fontFamily: "var(--font-mono)" }}>{l.weeklyDeduction}</span></td>
                  <td><Badge variant="amber">Pendente</Badge></td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-primary btn-sm" onClick={() => setSelectedLoan(l)}>✓ Aprovar</button>
                      <button className="btn btn-danger btn-sm">✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedLoan && (
        <LoanApprovalModal
          loan={selectedLoan}
          open={!!selectedLoan}
          onClose={() => setSelectedLoan(null)}
        />
      )}
    </div>
  );
}
