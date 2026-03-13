import { useState } from "react";
import { Modal } from "../ui";

// ─── LOAN CALCULATOR ──────────────────────────────────────────────────────────
// Rules: rate = 1% per week, max 24 weeks (6 months)
// interest = amount * 0.01 * weeks
// total = amount + interest
// weekly_payment = total / weeks

function useLoanCalc() {
  const [amount, setAmount] = useState("");
  const [weeks, setWeeks] = useState(4);

  const amt = parseFloat(amount) || 0;
  const interest = amt * 0.01 * weeks;
  const total = amt + interest;
  const weekly = weeks > 0 ? total / weeks : 0;

  return { amount, setAmount, weeks, setWeeks, amt, interest, total, weekly };
}

export default function LoanRequestModal({ open, onClose }) {
  const { amount, setAmount, weeks, setWeeks, amt, interest, total } = useLoanCalc();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Pedido de Empréstimo"
      subtitle="O pedido será aprovado pelo administrador"
      actions={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={onClose}>Enviar Pedido</button>
        </>
      }
    >
      <div className="form-group">
        <label className="form-label">Valor (€)</label>
        <input
          className="form-input"
          type="number"
          placeholder="ex: 500"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Duração (semanas)</label>
        <select
          className="form-input form-select"
          value={weeks}
          onChange={(e) => setWeeks(Number(e.target.value))}
        >
          <option value={2}>2 semanas</option>
          <option value={4}>4 semanas</option>
          <option value={8}>8 semanas</option>
          <option value={12}>12 semanas</option>
          <option value={24}>24 semanas (máx. 6 meses)</option>
        </select>
      </div>

      {/* Live breakdown */}
      <div className="loan-breakdown">
        <div className="loan-row">
          <span>Valor</span>
          <span>{amt ? `€${amt.toFixed(2)}` : "—"}</span>
        </div>
        <div className="loan-row">
          <span>Semanas</span>
          <span>{weeks} semanas</span>
        </div>
        <div className="loan-row">
          <span>Total juros (1%/sem)</span>
          <span style={{ color: "var(--amber)" }}>{amt ? `€${interest.toFixed(2)}` : "—"}</span>
        </div>
        <div className="loan-row total">
          <span>Total a reembolsar</span>
          <span>{amt ? `€${total.toFixed(2)}` : "—"}</span>
        </div>
      </div>
    </Modal>
  );
}
