import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Administration from "./pages/Administration";
import Parametrage from "./pages/Parametrage";
import Demandes from "./pages/Demandes";
import Pilotage from "./pages/Pilotage";
import PlanningProjet from "./pages/PlanningProjet";
import SuiviFinancier from "./pages/SuiviFinancier";
import RecetteLivraison from "./pages/RecetteLivraison";
import PlanChargeEquipes from "./pages/PlanChargeEquipes";
import Profil from "./pages/Profil";
import "./Dashboard.css";

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Récupérer l'utilisateur depuis localStorage
  const utilisateurStocke = localStorage.getItem("utilisateurConnecte");
  const utilisateur = utilisateurStocke ? JSON.parse(utilisateurStocke) : null;

  // Fonction de déconnexion
  const deconnecter = () => {
    localStorage.removeItem("utilisateurConnecte");
    navigate("/login");
  };

  // Déterminer la page active depuis l'URL
  const getActivePage = () => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") {
      return "dashboard";
    }
    return path.substring(1); // Enlever le "/" initial
  };

  const activePage = getActivePage();
  const selectedDelaiId = searchParams.get("delaiId");

  // Gestionnaire pour les clics sur les notifications
  const handleNotificationClick = (page, delaiId) => {
    if (delaiId) {
      navigate(`/${page}?delaiId=${delaiId}`);
    } else {
      navigate(`/${page}`);
    }
  };

  const renderContent = () => {
    // Gestion des pages principales et sous-pages
    if (activePage === "dashboard") {
      return (
        <div className="dashboard-content">
          <h1>Tableau de bord</h1>
          <p>
            Bienvenue {utilisateur.prenom} {utilisateur.nom} !
          </p>
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Projets actifs</h3>
              <p className="stat-value">12</p>
            </div>
            <div className="stat-card">
              <h3>Demandes en cours</h3>
              <p className="stat-value">8</p>
            </div>
            <div className="stat-card">
              <h3>Tâches à faire</h3>
              <p className="stat-value">24</p>
            </div>
          </div>
        </div>
      );
    }

    // Pages Administration
    if (activePage.startsWith("administration")) {
      return <Administration activeSubPage={activePage} />;
    }

    // Pages Paramétrage
    if (activePage.startsWith("parametrage")) {
      return <Parametrage activeSubPage={activePage} />;
    }

    // Pages Demandes
    if (activePage.startsWith("demandes")) {
      return <Demandes activeSubPage={activePage} />;
    }

    // Pages Plan de Charge des Équipes
    if (activePage.startsWith("plan-charge")) {
      return (
        <PlanChargeEquipes
          activeSubPage={activePage}
          selectedDelaiId={selectedDelaiId}
        />
      );
    }

    // Pages Pilotage
    if (activePage.startsWith("pilotage")) {
      return <Pilotage activeSubPage={activePage} />;
    }

    // Pages Planning Projet
    if (activePage.startsWith("planning")) {
      return <PlanningProjet activeSubPage={activePage} />;
    }

    // Pages Recette et Livraison
    if (activePage.startsWith("recette-livraison")) {
      return <RecetteLivraison activeSubPage={activePage} />;
    }

    // Pages Suivi Financier
    if (activePage === "suivi-financier") {
      return <SuiviFinancier />;
    }

    // Page Profil
    if (activePage === "profile") {
      return <Profil />;
    }

    return <div className="page-container">Page non trouvée</div>;
  };

  return (
    <div className="dashboard-container">
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <div
        className={`main-content ${
          sidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        <Header
          utilisateur={utilisateur}
          deconnecter={deconnecter}
          onNotificationClick={handleNotificationClick}
        />
        <div className="content-wrapper">{renderContent()}</div>
      </div>
    </div>
  );
};

export default Dashboard;
