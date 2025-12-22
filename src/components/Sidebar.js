import { useState, useEffect } from "react";
import "./Sidebar.css";
import logoj from "../image/LOGO J.webp";

const Sidebar = ({ activePage, setActivePage, collapsed, setCollapsed }) => {
  const [expandedMenus, setExpandedMenus] = useState({
    administration: false,
    parametrage: false,
    demandes: false,
    pilotage: false,
    planning: false,
    suivi: false,
    livraison: false,
    analyse: false,
    kanban: false,
  });
  const [clickedMainMenu, setClickedMainMenu] = useState(null);

  // Ouvrir automatiquement le menu parent si une sous-page est active
  useEffect(() => {
    const menuKeys = {
      administration: ["administration-profils", "administration-utilisateurs"],
      parametrage: [
        "parametrage-societes",
        "parametrage-uo",
        "parametrage-statuts",
      ],
      demandes: ["demandes-liste", "demandes-nouvelle", "demandes-validation", "demandes-soumission-validation"],
      pilotage: ["pilotage-dashboard", "pilotage-indicateurs"],
      planning: [
        "planning-cadre-temporel",
        "planning-sprints",
        "planning-roadmap",
      ],
      suivi: ["suivi-recette", "suivi-uat"],
      livraison: ["livraison-deploiement"],
      analyse: ["analyse-kpi"],
      kanban: [
        "kanban-config",
        "kanban-cartes",
        "kanban-indicateurs",
        "kanban-reporting",
      ],
    };

    Object.keys(menuKeys).forEach((menuKey) => {
      if (menuKeys[menuKey].includes(activePage)) {
        setExpandedMenus((prev) => ({
          ...prev,
          [menuKey]: true,
        }));
      }
    });
  }, [activePage]);

  const toggleMenu = (menuKey) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
    // Marquer ce menu comme cliqué pour enlever le contraste des sous-modules
    // Le contraste ne reviendra que si on clique directement sur un sous-module
    setClickedMainMenu(menuKey);
  };

  const menuItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: "📊",
      path: "dashboard",
    },
    {
      key: "administration",
      label: "Administration",
      icon: "⚙️",
      submenus: [
        {
          key: "gestion-profils",
          label: "Gestion des Profils",
          path: "administration-profils",
        },
        {
          key: "gestion-utilisateurs",
          label: "Gestion des Utilisateurs",
          path: "administration-utilisateurs",
        },
      ],
    },
    {
      key: "parametrage",
      label: "Paramétrage",
      icon: "🔧",
      submenus: [
        {
          key: "gestion-societes",
          label: "Gestion des Sociétés",
          path: "parametrage-societes",
        },
        {
          key: "gestion-uo",
          label: "Gestion des Unités Organisationnelles",
          path: "parametrage-uo",
        },
        {
          key: "gestion-statuts",
          label: "Gestion des Statuts",
          path: "parametrage-statuts",
        },
      ],
    },
    {
      key: "demandes",
      label: "Demandes",
      icon: "📋",
      submenus: [
        {
          key: "liste-demandes",
          label: "Liste des Demandes",
          path: "demandes-liste",
        },
        {
          key: "nouvelle-demande",
          label: "Nouvelle Demande",
          path: "demandes-nouvelle",
        },
        {
          key: "validation-demandes",
          label: "Validation des Demandes",
          path: "demandes-validation",
        },
        {
          key: "soumission-validation",
          label: "Soumission et Validation",
          path: "demandes-soumission-validation",
        },
      ],
    },
    {
      key: "pilotage",
      label: "Pilotage",
      icon: "🎯",
      submenus: [
        {
          key: "tableau-bord-pilotage",
          label: "Tableau de Bord",
          path: "pilotage-dashboard",
        },
        {
          key: "indicateurs",
          label: "Indicateurs",
          path: "pilotage-indicateurs",
        },
      ],
    },
    {
      key: "planning",
      label: "Planning Projet",
      icon: "📅",
      submenus: [
        {
          key: "cadre-temporel",
          label: "Cadre Temporel du Projet",
          path: "planning-cadre-temporel",
        },
        { key: "sprints", label: "Sprints", path: "planning-sprints" },
        { key: "roadmap", label: "Roadmap", path: "planning-roadmap" },
      ],
    },
    {
      key: "suivi",
      label: "Suivi Utilisation (UAT)",
      icon: "✅",
      submenus: [
        { key: "suivi-recette", label: "Suivi Recette", path: "suivi-recette" },
        {
          key: "recette-utilisateur",
          label: "Recette Utilisateur (UAT)",
          path: "suivi-uat",
        },
      ],
    },
    {
      key: "suivi-financier",
      label: "Suivi Financier",
      icon: "💰",
      path: "suivi-financier",
    },
    {
      key: "livraison",
      label: "Livraison et Mise en Production",
      icon: "🚀",
      submenus: [
        {
          key: "livraison-deploiement",
          label: "Livraison et Déploiement",
          path: "livraison-deploiement",
        },
      ],
    },
    {
      key: "analyse",
      label: "Analyse et Calcul de Performance",
      icon: "📈",
      submenus: [
        {
          key: "indicateurs-kpi",
          label: "Indicateurs Clés (KPIs)",
          path: "analyse-kpi",
        },
      ],
    },
    {
      key: "kanban",
      label: "Kanban",
      icon: "📌",
      submenus: [
        {
          key: "configuration-kanban",
          label: "Configuration et Structure",
          path: "kanban-config",
        },
        {
          key: "gestion-cartes",
          label: "Gestion des Cartes",
          path: "kanban-cartes",
        },
        {
          key: "indicateurs-kanban",
          label: "Indicateurs et Performance",
          path: "kanban-indicateurs",
        },
        {
          key: "reporting-kanban",
          label: "Reporting et Exportation",
          path: "kanban-reporting",
        },
      ],
    },
  ];

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="logo">
          <img src={logoj} alt="Logo Julee" className="logo-icon" />
          {!collapsed && <span className="logo-text">JULEE</span>}
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div key={item.key} className="nav-item-wrapper">
            {item.submenus ? (
              <>
                <div
                  className={`nav-item ${
                    expandedMenus[item.key] ? "expanded" : ""
                  }`}
                  onClick={() => toggleMenu(item.key)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!collapsed && (
                    <>
                      <span className="nav-label">{item.label}</span>
                      <span className="nav-arrow">
                        {expandedMenus[item.key] ? "▼" : "▶"}
                      </span>
                    </>
                  )}
                </div>
                {!collapsed && expandedMenus[item.key] && (
                  <div className="submenu">
                    {item.submenus.map((submenu) => (
                      <div
                        key={submenu.key}
                        className={`submenu-item ${
                          activePage === submenu.path && clickedMainMenu !== item.key ? "active" : ""
                        }`}
                        onClick={() => {
                          setActivePage(submenu.path);
                          // Réinitialiser clickedMainMenu pour permettre le contraste sur ce sous-module
                          setClickedMainMenu(null);
                        }}
                      >
                        {submenu.label}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div
                className={`nav-item ${activePage === item.path ? "active" : ""}`}
                onClick={() => setActivePage(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                {!collapsed && <span className="nav-label">{item.label}</span>}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
