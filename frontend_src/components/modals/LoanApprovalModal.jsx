// ─── LOAN APPROVAL MODAL ──────────────────────────────────────────────────────
import { Modal, LoanBreakdown } from "../ui";

export function LoanApprovalModal({ open, onClose, loan }) {
  if (!loan) return null;
  const interest = loan.amount * 0.01 * loan.weeks;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Aprovar Empréstimo"
      subtitle={`${loan.name} · ${loan.fleet}`}
      actions={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-danger btn-sm" onClick={onClose}>✕ Recusar</button>
          <button className="btn btn-primary" onClick={onClose}>✓ Aprovar</button>
        </>
      }
    >
      <div className="loan-breakdown">
        <div className="loan-row"><span>Valor solicitado</span><strong>€{loan.amount.toLocaleString()}</strong></div>
        <div className="loan-row"><span>Duração</span><span>{loan.weeks} semanas</span></div>
        <div className="loan-row"><span>Taxa de juro</span><span>1% / semana</span></div>
        <div className="loan-row"><span>Total de juros</span><span style={{ color: "var(--amber)" }}>€{interest.toFixed(2)}</span></div>
        <div className="loan-row total"><span>Total a reembolsar</span><strong>€{(loan.amount + interest).toFixed(2)}</strong></div>
      </div>
      <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 12 }}>
        Calendário: €{(loan.amount + interest) / loan.weeks}/semana durante {loan.weeks} semanas, deduzido automaticamente.
      </div>
    </Modal>
  );
}
export default LoanApprovalModal;
