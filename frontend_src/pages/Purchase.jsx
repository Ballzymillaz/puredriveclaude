import { useState } from "react";
import { Card, PageHeader, Badge, MetricLine, ProgressBar, MonthDots, DriverInfo } from "../components/ui";

// ─── VEHICLES AVAILABLE FOR PURCHASE ─────────────────────────────────────────
const VEHICLES = [
  { label: "Toyota Camry (44-XB-92) — Matric. 2021-03", market: 18500, firstReg: "Março 2021", tvdeLimit: "Março 2028", maxMonths: 36 },
  { label: "Kia EV6 (33-ZK-11) — Matric. 2022-07", market: 24000, firstReg: "Julho 2022", tvdeLimit: "Julho 2029", maxMonths: 48 },
];

// ─── PURCHASE CALCULATOR LOGIC ────────────────────────────────────────────────
// Company margin: +25% on market price
// Degressive quarterly plan:
//   T1 (m1-3):   base/dur * 1.03
//   T2 (m4-6):   * 0.99
//   T3 (m7-9):   * 0.97
//   T4 (m10-12): * 0.96
//   T5+ (m13+):  * 0.94

function calcPurchasePlan(market, months) {
  const total = Math.round(market * 1.25);
  const base = total / months;

  const quarters = [
    { label: "T1 (meses 1-3)", factor: 1.03 },
    { label: "T2 (meses 4-6)", factor: 0.99 },
    { label: "T3 (meses 7-9)", factor: 0.97 },
    { label: "T4 (meses 10-12)", factor: 0.96 },
    { label: "T5-T8 (meses 13+)", factor: 0.94, prefix: "~" },
  ];

  const plan = quarters
    .filter((_, i) => {
      if (months <= 12 && i >= 4) return false;
      if (months <= 24 && i >= 4) return false; // show T5 for 24+ months
      return true;
    })
    .map((q) => ({
      label: q.label,
      monthly: `${q.prefix || ""}€${Math.round(base * q.factor).toLocaleString()}/mês`,
    }));

  return { total, plan };
}

// ─── ACTIVE PURCHASE OPTIONS ──────────────────────────────────────────────────
const ACTIVE_OPTIONS = [
  {
    initials: "CM", name: "Carlos Mendes",
    plate: "44-XB-92", total: "€23,125", paid: "€4,350",
    remaining: "€18,775", pct: 18.8, monthly: "€290",
    paidMonths: 15, currentMonth: 15, totalMonths: 24,
  },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function Purchase() {
  const [vehicleIdx, setVehicleIdx] = useState(0);
  const [duration, setDuration] = useState(24);

  const vehicle = VEHICLES[vehicleIdx];
  const { total, plan } = calcPurchasePlan(vehicle.market, duration);
  const margin = Math.round(vehicle.market * 0.25);

  return (
    <div className="page active">
      <PageHeader
        title="Opção de Compra de Veículos"
        subtitle="Exclusivo frotas PureDrive · 14 motoristas com opção ativa"
      />

      {/* ── SIMULATOR ── */}
      <Card title="SIMULADOR DE OPÇÃO DE COMPRA" style={{ marginBottom: 16 }}>
        <div className="grid-2" style={{ gap: 20 }}>
          {/* Left: inputs + TVDE constraints */}
          <div>
            <div className="form-group">
              <label className="form-label">Veículo</label>
              <select
                className="form-input form-select"
                value={vehicleIdx}
                onChange={(e) => setVehicleIdx(Number(e.target.value))}
              >
                {VEHICLES.map((v, i) => (
                  <option key={i} value={i}>{v.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Duração (meses)</label>
              <select
                className="form-input form-select"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              >
                {[12, 24, 36, 48].map((d) => (
                  <option key={d} value={d} disabled={d > vehicle.maxMonths}>
                    {d} meses{d > vehicle.maxMonths ? " (excede limite TVDE)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* TVDE restrictions */}
            <div style={{ background: "var(--surface2)", borderRadius: "var(--radius)", padding: 14 }}>
              <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 8, fontFamily: "var(--font-mono)" }}>
                RESTRIÇÕES TVDE
              </div>
              <div style={{ fontSize: 12, color: "var(--text2)" }}>
                1ª matrícula: <strong>{vehicle.firstReg}</strong>
              </div>
              <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 4 }}>
                Limite TVDE: <strong style={{ color: "var(--amber)" }}>{vehicle.tvdeLimit}</strong>
              </div>
              <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 4 }}>
                Máx. duração permitida: <strong style={{ color: "var(--accent)" }}>{vehicle.maxMonths} meses</strong>
              </div>
            </div>
          </div>

          {/* Right: purchase plan summary */}
          <div style={{ background: "var(--surface2)", borderRadius: "var(--radius-lg)", padding: 20 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text3)", marginBottom: 14, letterSpacing: 1 }}>
              RESUMO DO PLANO
            </div>
            <MetricLine label="Preço de mercado" value={`€${vehicle.market.toLocaleString()}`} />
            <MetricLine label="Margem empresa (+25%)" value={`+€${margin.toLocaleString()}`} valueColor="amber" />
            <MetricLine label="Preço final" value={`€${total.toLocaleString()}`} />
            <MetricLine label="Duração selecionada" value={`${duration} meses`} />

            <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text3)", marginBottom: 10 }}>
              PLANO TRIMESTRAL DEGRESSIVO
            </div>
            {plan.map((p, i) => (
              <MetricLine key={i} label={p.label} value={p.monthly} valueColor="green" />
            ))}
            <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />
            <MetricLine
              label="Total"
              value={`€${total.toLocaleString()} ✓`}
              valueColor="green"
            />
          </div>
        </div>
      </Card>

      {/* ── ACTIVE OPTIONS TABLE ── */}
      <Card title="OPÇÕES ATIVAS — MOTORISTAS">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Motorista</th>
                <th>Veículo</th>
                <th>Total</th>
                <th>Pago</th>
                <th>Restante</th>
                <th>Progresso</th>
                <th>Mens. Atual</th>
              </tr>
            </thead>
            <tbody>
              {ACTIVE_OPTIONS.map((o) => (
                <tr key={o.name}>
                  <td><DriverInfo initials={o.initials} name={o.name} avatarSize={26} /></td>
                  <td><Badge variant="blue">{o.plate}</Badge></td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{o.total}</td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>{o.paid}</td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "var(--amber)" }}>{o.remaining}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <ProgressBar pct={o.pct} color="green" width="80px" />
                      <span style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}>{Math.round(o.pct)}%</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>{o.monthly}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── MONTH DOTS PROGRESS ── */}
      <Card title="PROGRESSO MENSAL — CARLOS MENDES" style={{ marginTop: 16 }}>
        <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 8, fontFamily: "var(--font-mono)" }}>
          MESES DE PAGAMENTO (24 meses total)
        </div>
        <MonthDots total={24} paid={15} current={15} />
        <div style={{ marginTop: 8, fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-mono)" }}>
          🟢 Pago · 🟡 Mês atual · ⚪ Futuro
        </div>
      </Card>
    </div>
  );
}
