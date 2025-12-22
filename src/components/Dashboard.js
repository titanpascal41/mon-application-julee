import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Administration from "./pages/Administration";
import Parametrage from "./pages/Parametrage";
import Demandes from "./pages/Demandes";
import Pilotage from "./pages/Pilotage";
import PlanningProjet from "./pages/PlanningProjet";
import SuiviFinancier from "./pages/SuiviFinancier";
import SuiviUtilisation from "./pages/SuiviUtilisation";
import Livraison from "./pages/Livraison";
import AnalysePerformance from "./pages/AnalysePerformance";
import Kanban from "./pages/Kanban";
import "./Dashboard.css";

const Dashboard = ({ utilisateur, deconnecter }) => {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderContent = () => {
    // Gestion des pages principales et sous-pages
    if (activePage === "dashboard") {
      return (
        <div className="dashboard-content">
          <h1>Tableau de bord</h1>
          <p>Bienvenue {utilisateur.prenom} {utilisateur.nom} !</p>
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
    
    // Pages Pilotage
    if (activePage.startsWith("pilotage")) {
      return <Pilotage activeSubPage={activePage} />;
    }
    
    // Pages Planning Projet
    if (activePage.startsWith("planning")) {
      return <PlanningProjet activeSubPage={activePage} />;
    }
    
    // Pages Suivi Utilisation (doit être vérifié avant suivi-financier)
    if (activePage.startsWith("suivi-recette") || activePage.startsWith("suivi-uat")) {
      return <SuiviUtilisation activeSubPage={activePage} />;
    }
    
    // Pages Suivi Financier
    if (activePage === "suivi-financier") {
      return <SuiviFinancier />;
    }
    
    // Pages Livraison
    if (activePage.startsWith("livraison")) {
      return <Livraison />;
    }
    
    // Pages Analyse Performance
    if (activePage.startsWith("analyse")) {
      return <AnalysePerformance />;
    }
    
    // Pages Kanban
    if (activePage.startsWith("kanban")) {
      return <Kanban activeSubPage={activePage} />;
    }
    
    return <div className="page-container">Page non trouvée</div>;
  };

  return (
    <div className="dashboard-container">
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header utilisateur={utilisateur} deconnecter={deconnecter} />
        <div className="content-wrapper">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

