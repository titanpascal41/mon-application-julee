import { useState, useEffect } from "react";
import "./PageStyles.css";

const PlanningProjet = ({ activeSubPage: activeSubPageProp }) => {
  const [activeSubPage, setActiveSubPage] = useState("cadre-temporel");

  useEffect(() => {
    if (activeSubPageProp) {
      if (activeSubPageProp.includes("cadre-temporel")) setActiveSubPage("cadre-temporel");
      else if (activeSubPageProp.includes("sprints")) setActiveSubPage("sprints");
      else if (activeSubPageProp.includes("roadmap")) setActiveSubPage("roadmap");
    }
  }, [activeSubPageProp]);

  const subPages = {
    "cadre-temporel": {
      title: "Cadre Temporel du Projet",
      content: (
        <div>
          <div className="planning-sections">
            <div className="section-card">
              <h3>Cadre Temporel du Projet</h3>
              <p>Définissez les dates de début et de fin du projet</p>
              <button className="btn-primary">Configurer</button>
            </div>
          </div>
        </div>
      ),
    },
    sprints: {
      title: "Sprints",
      content: (
        <div>
          <div className="planning-sections">
            <div className="section-card">
              <h3>Sprints</h3>
              <p>Créez et gérez les sprints de l'équipe</p>
              <button className="btn-primary">Gérer les sprints</button>
            </div>
          </div>
        </div>
      ),
    },
    roadmap: {
      title: "Roadmap",
      content: (
        <div>
          <div className="planning-sections">
            <div className="section-card">
              <h3>Roadmap</h3>
              <p>Visualisez la vision à long terme du projet</p>
              <button className="btn-primary">Voir la roadmap</button>
            </div>
          </div>
        </div>
      ),
    },
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{subPages[activeSubPage].title}</h1>
        <p>Gérez le planning et les sprints de vos projets</p>
      </div>

      <div className="page-content">
        {subPages[activeSubPage].content}
      </div>
    </div>
  );
};

export default PlanningProjet;
