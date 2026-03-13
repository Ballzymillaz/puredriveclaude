import { useState } from "react";
import { StatCard, Badge, Card, PageHeader, DriverInfo, RankBadge, ProgressBar } from "../components/ui";
import AddDriverModal from "../components/modals/AddDriverModal";

const DRIVERS = [
  { rank: 1, initials: "CM", name: "Carlos Mendes", email: "carlos@puredrive.pt", fleet: "Frota Lisboa", plate: "44-XB-92", revenue: "€1,842", score: 92, upi: "312 ◈", status: "Ativo", statusVariant: "green" },
  { rank: 2, initials: "MP", name: "Miguel Pinto", email: "miguel@puredrive.pt", fleet: "Frota Lisboa", plate: "33-ZK-11", revenue: "€1,730", score: 88, upi: "280 ◈", status: "Ativo", statusVariant: "green" },
  { rank: 3, initials: "SR", name: "Sofia Rodrigues", email: "sofia@puredrive.pt", fleet: "Frota Porto", plate: "55-LR-78", revenue: "€1,690", score: 85, upi: "264 ◈", status: "Ativo", statusVariant: "green" },
  { rank: 4, initials: "JO", name: "João Oliveira", email: "joao@fleetpro.pt", fleet: "FleetPro SaaS", plate: "22-TN-45", revenue: "€1,580", score: 79, upi: "N/A", status: "Ativo", statusVariant: "green", isSaas: true },
  { rank: 5, initials: "RL", name: "Rui Lima", email: "rui@puredrive.pt", fleet: "Frota Lisboa", plate: null, revenue: "€820", score: 66, upi: "98 ◈", status: "Empréstimo", statusVariant: "amber", maintenance: true },
];

export default function Drivers({ navigate }) {
  const [search, setSearch] = useState("");
  const [fleetFilter, setFleetFilter] = useState("Todas as frotas");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = DRIVERS.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchFleet = fleetFilter === "Todas as frotas" || d.fleet === fleetFilter;
    const matchStatus = statusFilter === "Todos" || d.status === statusFilter;
    return matchSearch && matchFleet && matchStatus;
  });

  return (
    <div className="page active">
      <PageHeader
        title="Motoristas"
        subtitle="134 motoristas registados · 127 ativos"
        right={
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-ghost">⬇ Exportar CSV</button>
            <button className="btn btn-primary" onClick={() => setModalOpen(true)}>+ Novo Motorista</button>
          </div>
        }
      />

      <div className="stats-grid">
        <StatCard icon="✅" value="127" label="Ativos" color="var(--accent)" bg="var(--accent-dim)" />
        <StatCard icon="⚠️" value="4" label="Suspensão" color="var(--amber)" bg="var(--amber-dim)" />
        <StatCard icon="🏆" value="18" label="Com bónus" color="var(--blue)" bg="var(--blue-dim)" />
        <StatCard icon="💰" value="31" label="Crédito ativo" color="var(--purple)" bg="var(--purple-dim)" />
      </div>

      <Card>
        {/* Search & filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            className="form-input"
            placeholder="🔍  Pesquisar motorista..."
            style={{ maxWidth: 260 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="form-input form-select"
            style={{ maxWidth: 160 }}
            value={fleetFilter}
            onChange={(e) => setFleetFilter(e.target.value)}
          >
            <option>Todas as frotas</option>
            <option>Frota Lisboa</option>
            <option>Frota Porto</option>
            <option>FleetPro SaaS</option>
          </select>
          <select
            className="form-input form-select"
            style={{ maxWidth: 130 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>Todos</option>
            <option>Ativo</option>
            <option>Suspenso</option>
          </select>
        </div>

        {/* Table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Motorista</th>
                <th>Frota</th>
                <th>Veículo</th>
                <th>Receita Mês</th>
                <th>Score</th>
                <th>UPI</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.name}>
                  <td><RankBadge rank={d.rank} size={24} /></td>
                  <td><DriverInfo initials={d.initials} name={d.name} sub={d.email} /></td>
                  <td>
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      {d.fleet}
                      {d.isSaas && <span className="saas-tag">SaaS</span>}
                    </div>
                  </td>
                  <td>
                    {d.plate
                      ? <Badge variant="blue">{d.plate}</Badge>
                      : <Badge variant="amber">Em manutenção</Badge>}
                  </td>
                  <td><span style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>{d.revenue}</span></td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <ProgressBar pct={d.score} color="green" width="60px" />
                      <span style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}>{d.score}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontFamily: "var(--font-mono)", color: d.upi === "N/A" ? "var(--text3)" : "var(--purple)" }}>
                      {d.upi}
                    </span>
                  </td>
                  <td><Badge variant={d.statusVariant} dot>{d.status}</Badge></td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate("motorista-dash")}>Ver →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AddDriverModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
