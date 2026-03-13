import { useState } from "react";
import { Badge, Card, PageHeader, DriverInfo, ProgressBar } from "../components/ui";
import AddVehicleModal from "../components/modals/AddVehicleModal";

const VEHICLES = [
  {
    plate: "44-XB-92", plateVariant: "blue",
    brand: "Toyota Camry", variant: "Hybrid 2.5",
    firstReg: "2021-03", tvdeExp: "2028-03", tvdeColor: "var(--amber)",
    market: "€18,500",
    driver: { initials: "CM", name: "Carlos Mendes" },
    status: "Ativo", statusVariant: "green",
    profitPct: 74, profit: "+€4,820",
    id: "vehicle-detail",
  },
  {
    plate: "33-ZK-11", plateVariant: "blue",
    brand: "Kia EV6", variant: "Electric RWD",
    firstReg: "2022-07", tvdeExp: "2029-07", tvdeColor: "var(--accent)",
    market: "€24,000",
    driver: { initials: "MP", name: "Miguel Pinto" },
    status: "Ativo", statusVariant: "green",
    profitPct: 58, profit: "+€3,100",
  },
  {
    plate: "77-RK-34", plateVariant: "amber",
    brand: "Skoda Octavia", variant: "1.5 TSI",
    firstReg: "2020-01", tvdeExp: "2027-01", tvdeColor: "var(--red)",
    market: "€12,800",
    driver: null,
    status: "Manutenção", statusVariant: "amber",
    profitPct: 42, profit: "+€1,240",
  },
];

export default function Vehicles({ navigate }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="page active">
      <PageHeader
        title="Veículos"
        subtitle="147 veículos · 128 ativos · 12 manutenção · 7 disponíveis"
        right={
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            + Novo Veículo
          </button>
        }
      />

      <Card>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Matrícula</th>
                <th>Marca / Modelo</th>
                <th>1ª Matrícula</th>
                <th>Exp. TVDE</th>
                <th>Mercado</th>
                <th>Motorista</th>
                <th>Estado</th>
                <th>Rentabilidade</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {VEHICLES.map((v) => (
                <tr key={v.plate}>
                  <td>
                    <Badge variant={v.plateVariant} style={{ fontSize: 12 }}>{v.plate}</Badge>
                  </td>
                  <td>
                    <strong>{v.brand}</strong>
                    <div style={{ fontSize: 11, color: "var(--text3)" }}>{v.variant}</div>
                  </td>
                  <td><span style={{ fontFamily: "var(--font-mono)" }}>{v.firstReg}</span></td>
                  <td><span style={{ fontFamily: "var(--font-mono)", color: v.tvdeColor }}>{v.tvdeExp}</span></td>
                  <td><span style={{ fontFamily: "var(--font-mono)" }}>{v.market}</span></td>
                  <td>
                    {v.driver
                      ? <DriverInfo initials={v.driver.initials} name={v.driver.name} avatarSize={24} />
                      : <span style={{ color: "var(--text3)" }}>—</span>}
                  </td>
                  <td><Badge variant={v.statusVariant}>{v.status}</Badge></td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <ProgressBar pct={v.profitPct} color={v.statusVariant === "amber" ? "amber" : "green"} width="70px" />
                      <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: v.statusVariant !== "amber" ? "var(--accent)" : undefined }}>
                        {v.profit}
                      </span>
                    </div>
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => v.id && navigate(v.id)}
                    >
                      Ver →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AddVehicleModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
