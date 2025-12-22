import { useState, useEffect } from "react";
import "./PageStyles.css";

const Kanban = ({ activeSubPage: activeSubPageProp }) => {
  const [activeSubPage, setActiveSubPage] = useState("config");

  useEffect(() => {
    if (activeSubPageProp) {
      if (activeSubPageProp.includes("config")) setActiveSubPage("config");
      else if (activeSubPageProp.includes("cartes")) setActiveSubPage("cartes");
      else if (activeSubPageProp.includes("indicateurs")) setActiveSubPage("indicateurs");
      else if (activeSubPageProp.includes("reporting")) setActiveSubPage("reporting");
    }
  }, [activeSubPageProp]);

  const subPages = {
    config: {
      title: "Configuration Kanban",
      content: (
        <div>
          <div className="kanban-actions">
            <button className="btn-primary">Configurer le Kanban</button>
          </div>
          <p>Configurez la structure et les colonnes du tableau Kanban</p>
        </div>
      ),
    },
    cartes: {
      title: "Gestion des Cartes",
      content: (
        <div>
          <div className="kanban-actions">
            <button className="btn-primary">Nouvelle carte</button>
          </div>
          
          <div className="kanban-board">
            <div className="kanban-column">
              <h3>À faire</h3>
              <div className="kanban-card">
                <h4>Tâche 1</h4>
                <p>Description de la tâche</p>
              </div>
              <div className="kanban-card">
                <h4>Tâche 2</h4>
                <p>Description de la tâche</p>
              </div>
            </div>
            
            <div className="kanban-column">
              <h3>En cours</h3>
              <div className="kanban-card">
                <h4>Tâche 3</h4>
                <p>Description de la tâche</p>
              </div>
            </div>
            
            <div className="kanban-column">
              <h3>En revue</h3>
              <div className="kanban-card">
                <h4>Tâche 4</h4>
                <p>Description de la tâche</p>
              </div>
            </div>
            
            <div className="kanban-column">
              <h3>Terminé</h3>
              <div className="kanban-card">
                <h4>Tâche 5</h4>
                <p>Description de la tâche</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    indicateurs: {
      title: "Indicateurs Kanban",
      content: (
        <div>
          <div className="kpi-grid">
            <div className="kpi-card">
              <h3>Cartes en cours</h3>
              <p className="kpi-value">15</p>
            </div>
            <div className="kpi-card">
              <h3>Vélocité</h3>
              <p className="kpi-value">42 points</p>
            </div>
          </div>
        </div>
      ),
    },
    reporting: {
      title: "Reporting Kanban",
      content: (
        <div>
          <div className="kanban-actions">
            <button className="btn-primary">Exporter</button>
            <button className="btn-secondary">Générer rapport</button>
          </div>
          <p>Générez et exportez des rapports sur le tableau Kanban</p>
        </div>
      ),
    },
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{subPages[activeSubPage].title}</h1>
        <p>Gérez vos tâches avec le tableau Kanban</p>
      </div>

      <div className="page-content">
        {subPages[activeSubPage].content}
      </div>
    </div>
  );
};

export default Kanban;
