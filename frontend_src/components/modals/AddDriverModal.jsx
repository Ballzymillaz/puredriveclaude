import { useState } from "react";
import { Modal } from "../ui";

// ─── ADD DRIVER ───────────────────────────────────────────────────────────────
export function AddDriverModal({ open, onClose }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Novo Motorista"
      actions={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={onClose}>Criar Motorista</button>
        </>
      }
    >
      <div className="form-group">
        <label className="form-label">Nome Completo</label>
        <input className="form-input" placeholder="Nome do motorista" />
      </div>
      <div className="form-group">
        <label className="form-label">Email</label>
        <input className="form-input" type="email" placeholder="email@puredrive.pt" />
      </div>
      <div className="form-group">
        <label className="form-label">Frota</label>
        <select className="form-input form-select">
          <option>Frota Lisboa</option>
          <option>Frota Porto</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Telefone</label>
        <input className="form-input" placeholder="+351 9XX XXX XXX" />
      </div>
      <div className="form-group">
        <label className="form-label">Veículo</label>
        <select className="form-input form-select">
          <option>Selecionar veículo disponível...</option>
          <option>Toyota Camry (44-XB-92)</option>
        </select>
      </div>
    </Modal>
  );
}
export default AddDriverModal;

// ─── ADD VEHICLE ──────────────────────────────────────────────────────────────
export function AddVehicleModal({ open, onClose }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Novo Veículo"
      actions={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={onClose}>Adicionar Veículo</button>
        </>
      }
    >
      <div className="grid-2" style={{ gap: 12 }}>
        <div className="form-group">
          <label className="form-label">Marca</label>
          <input className="form-input" placeholder="ex: Toyota" />
        </div>
        <div className="form-group">
          <label className="form-label">Modelo</label>
          <input className="form-input" placeholder="ex: Camry" />
        </div>
        <div className="form-group">
          <label className="form-label">Matrícula</label>
          <input className="form-input" placeholder="00-AA-00" />
        </div>
        <div className="form-group">
          <label className="form-label">1ª Matrícula</label>
          <input className="form-input" type="month" />
        </div>
        <div className="form-group">
          <label className="form-label">Preço Mercado (€)</label>
          <input className="form-input" type="number" placeholder="18500" />
        </div>
        <div className="form-group">
          <label className="form-label">Frota</label>
          <select className="form-input form-select">
            <option>Frota Lisboa</option>
            <option>Frota Porto</option>
          </select>
        </div>
      </div>
      {/* TVDE warning */}
      <div style={{
        background: "var(--amber-dim)",
        border: "1px solid rgba(245,158,11,0.2)",
        borderRadius: "var(--radius)",
        padding: 10,
        fontSize: 12,
        color: "var(--amber)",
        marginBottom: 4,
      }}>
        ⚠️ Limite TVDE: 7 anos a partir da 1ª matrícula. Durações de financiamento serão calculadas automaticamente.
      </div>
    </Modal>
  );
}

// ─── ADD COMPANY ──────────────────────────────────────────────────────────────
// Business rule: "saas" type shows SaaS pricing plans, "puredrive" hides them
// SaaS plans: ≤10 veh €119/m, ≤20 €199/m, ≤30 €299/m, ≤50 €499/m, +50 €699/m
export function AddCompanyModal({ open, onClose }) {
  const [type, setType] = useState("puredrive");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nova Company"
      actions={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={onClose}>Criar Company</button>
        </>
      }
    >
      <div className="form-group">
        <label className="form-label">Nome</label>
        <input className="form-input" placeholder="Nome da empresa" />
      </div>
      <div className="form-group">
        <label className="form-label">NIF</label>
        <input className="form-input" placeholder="NIF" />
      </div>
      <div className="form-group">
        <label className="form-label">Email</label>
        <input className="form-input" type="email" placeholder="email@empresa.pt" />
      </div>
      <div className="form-group">
        <label className="form-label">Tipo</label>
        <select
          className="form-input form-select"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="puredrive">PureDrive (interna)</option>
          <option value="saas">SaaS (externa)</option>
        </select>
      </div>

      {/* SaaS pricing plans — only shown when type === "saas" */}
      {type === "saas" && (
        <div className="form-group">
          <label className="form-label">Plano SaaS</label>
          <select className="form-input form-select">
            <option>Até 10 veículos — €119/mês</option>
            <option>Até 20 veículos — €199/mês</option>
            <option>Até 30 veículos — €299/mês</option>
            <option>Até 50 veículos — €499/mês</option>
            <option>+50 veículos — €699/mês</option>
          </select>
        </div>
      )}
    </Modal>
  );
}

// ─── ADD MAINTENANCE ──────────────────────────────────────────────────────────
export function AddMaintenanceModal({ open, onClose }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registar Manutenção"
      subtitle="Toyota Camry · 44-XB-92"
      actions={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={onClose}>Guardar</button>
        </>
      }
    >
      <div className="form-group">
        <label className="form-label">Tipo</label>
        <input className="form-input" placeholder="ex: Revisão periódica" />
      </div>
      <div className="form-group">
        <label className="form-label">Data</label>
        <input className="form-input" type="date" />
      </div>
      <div className="form-group">
        <label className="form-label">Custo (€)</label>
        <input className="form-input" type="number" placeholder="150" />
      </div>
      <div className="form-group">
        <label className="form-label">Fornecedor / Oficina</label>
        <input className="form-input" placeholder="Nome da oficina" />
      </div>
      <div className="form-group">
        <label className="form-label">Notas</label>
        <textarea className="form-input" rows={3} placeholder="Detalhes da manutenção..." />
      </div>
    </Modal>
  );
}
