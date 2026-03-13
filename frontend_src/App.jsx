import { useState } from "react";
import Layout from "./components/Layout";
import AdminDashboard from "./pages/AdminDashboard";
import Drivers from "./pages/Drivers";
import Vehicles from "./pages/Vehicles";
import VehicleDetail from "./pages/VehicleDetail";
import Payments from "./pages/Payments";
import Companies from "./pages/Companies";
import Fleets from "./pages/Fleets";
import Loans from "./pages/Loans";
import Purchase from "./pages/Purchase";
import Ranking from "./pages/Ranking";
import Reports from "./pages/Reports";
import Maintenance from "./pages/Maintenance";
import UPI from "./pages/UPI";
import Messages from "./pages/Messages";
import MotoristaDashboard from "./pages/MotoristaDashboard";

// ─── ROLE SIMULATION CONFIG ──────────────────────────────────────────────────
export const SIM_ROLES = {
  admin: {
    label: "Admin",
    avatar: "AD",
    defaultPage: "admin-dash",
    sidebarType: "admin",
  },
  motorista: {
    label: "Motorista — Carlos Mendes",
    avatar: "CM",
    defaultPage: "motorista-dash",
    sidebarType: "motorista",
  },
  "fleet-manager": {
    label: "Fleet Manager — Ana Ferreira",
    avatar: "AF",
    defaultPage: "admin-dash",
    sidebarType: "fleet-manager",
  },
  "fleet-saas": {
    label: "Fleet Manager SaaS — João Silva",
    avatar: "JS",
    defaultPage: "admin-dash",
    sidebarType: "fleet-saas",
  },
};

// ─── PAGE REGISTRY ────────────────────────────────────────────────────────────
const PAGES = {
  "admin-dash": AdminDashboard,
  drivers: Drivers,
  vehicles: Vehicles,
  "vehicle-detail": VehicleDetail,
  payments: Payments,
  companies: Companies,
  fleets: Fleets,
  loans: Loans,
  purchase: Purchase,
  ranking: Ranking,
  reports: Reports,
  maintenance: Maintenance,
  upi: UPI,
  messages: Messages,
  "motorista-dash": MotoristaDashboard,
};

export default function App() {
  const [currentPage, setCurrentPage] = useState("admin-dash");
  const [currentRole, setCurrentRole] = useState("admin");
  const [isSimulating, setIsSimulating] = useState(false);

  const navigate = (page) => setCurrentPage(page);

  const simulate = (role) => {
    setCurrentRole(role);
    setIsSimulating(role !== "admin");
    setCurrentPage(SIM_ROLES[role].defaultPage);
  };

  const stopSimulation = () => {
    setCurrentRole("admin");
    setIsSimulating(false);
    setCurrentPage("admin-dash");
  };

  const PageComponent = PAGES[currentPage] || AdminDashboard;

  return (
    <Layout
      currentPage={currentPage}
      navigate={navigate}
      currentRole={currentRole}
      isSimulating={isSimulating}
      simulate={simulate}
      stopSimulation={stopSimulation}
    >
      <PageComponent navigate={navigate} currentRole={currentRole} />
    </Layout>
  );
}
