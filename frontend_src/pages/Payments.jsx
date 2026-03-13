import { Card, PageHeader, FlowRow, DriverInfo } from "../components/ui";

const PAYMENT_ROWS = [
  { initials: "CM", name: "Carlos Mendes", uber: "€820", bolt: "€420", gross: "€1,240", energy: "-€62", tolls: "-€18", loan: "—", purchase: "-€290", net: "€870", netColor: "var(--accent)" },
  { initials: "MP", name: "Miguel Pinto", uber: "€740", bolt: "€380", gross: "€1,120", energy: "-€48", tolls: "-€14", loan: "-€180", purchase: "—", net: "€878", netColor: "var(--accent)" },
  { initials: "RL", name: "Rui Lima", uber: "€380", bolt: "€210", gross: "€590", energy: "-€30", tolls: "-€9", loan: "-€200", purchase: "—", net: "€351", netColor: "var(--amber)" },
];

export default function Payments() {
  return (
    <div className="page active">
      <PageHeader
        title="Gestão de Pagamentos"
        subtitle="Semana 12, 2025 · Processamento de receitas TVDE"
      />

      <div className="grid-6-4">
        {/* Main payments table */}
        <Card title="SEMANA 12 — DETALHE POR MOTORISTA">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Motorista</th>
                  <th>Uber</th>
                  <th>Bolt</th>
                  <th>Bruto</th>
                  <th>Energia</th>
                  <th>Portagens</th>
                  <th>Empréstimo</th>
                  <th>Compra</th>
                  <th>Líquido</th>
                </tr>
              </thead>
              <tbody>
                {PAYMENT_ROWS.map((r) => (
                  <tr key={r.name}>
                    <td><DriverInfo initials={r.initials} name={r.name} avatarSize={24} /></td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{r.uber}</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{r.bolt}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{r.gross}</td>
                    <td style={{ fontFamily: "var(--font-mono)", color: "var(--red)" }}>{r.energy}</td>
                    <td style={{ fontFamily: "var(--font-mono)", color: "var(--red)" }}>{r.tolls}</td>
                    <td style={{ fontFamily: "var(--font-mono)", color: r.loan === "—" ? "var(--text3)" : "var(--red)" }}>{r.loan}</td>
                    <td style={{ fontFamily: "var(--font-mono)", color: r.purchase === "—" ? "var(--text3)" : "var(--red)" }}>{r.purchase}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: r.netColor }}>{r.net}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Financial flow for selected driver */}
        <Card title="FLUXO FINANCEIRO — CARLOS MENDES">
          <FlowRow label="🟢 Uber" value="€820" />
          <FlowRow label="🟢 Bolt" value="€420" />
          <FlowRow label="⚡ Energia (Miio)" value="-€62" type="deduction" />
          <FlowRow label="🛣️ Portagens (Via Verde)" value="-€18" type="deduction" />
          <FlowRow label="🚗 Opção de Compra" value="-€290" type="deduction" />
          <FlowRow label="💠 UPI Gerados (4%)" value="+49 ◈" />
          <FlowRow label="✅ Pagamento Líquido" value="€870" type="net" />
        </Card>
      </div>
    </div>
  );
}
