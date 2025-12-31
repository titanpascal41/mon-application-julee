import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import logoj from "../image/LOGO J.webp";

const Sidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Déterminer la page active depuis l'URL
  const getActivePage = () => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") {
      return "dashboard";
    }
    return path.substring(1); // Enlever le "/" initial
  };

  const activePage = getActivePage();
  const [expandedMenus, setExpandedMenus] = useState({
    administration: false,
    parametrage: false,
    demandes: false,
    "plan-charge": false,
    planning: false,
    "recette-livraison": false,
    bugs: false,
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
        "parametrage-collaborateurs",
      ],
      demandes: ["demandes-gestion"],
      planning: [
        "planning-cadre-temporel",
        "planning-sprints",
        "planning-roadmap",
        "planning-jalon",
      ],
      "recette-livraison": [
        "recette-livraison-suivi-recette",
        "recette-livraison-recette-utilisateur",
        "recette-livraison-livraison",
      ],
      bugs: ["bugs-declaration-qualification", "bugs-suivi-resolution-cloture"],
      analyse: ["analyse-kpi"],
      kanban: [
        "kanban-config",
        "kanban-cartes",
        "kanban-indicateurs",
        "kanban-reporting",
      ],
    };

    const currentPath = location.pathname.substring(1); // Enlever le "/" initial
    
    Object.keys(menuKeys).forEach((menuKey) => {
      if (menuKeys[menuKey].includes(currentPath)) {
        setExpandedMenus((prev) => ({
          ...prev,
          [menuKey]: true,
        }));
      }
    });
  }, [location.pathname]);

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
        {
          key: "gestion-collaborateurs",
          label: "Gestion des Collaborateurs",
          path: "parametrage-collaborateurs",
        },
      ],
    },
    {
      key: "demandes",
      label: "Demandes",
      icon: "📋",
      submenus: [
        {
          key: "gestion-demandes",
          label: "Gestion des Demandes",
          path: "demandes-gestion",
        },
      ],
    },
    {
      key: "plan-charge",
      label: "Plan de Charge Équipes",
      icon: "👥",
      submenus: [
        {
          key: "saisie-ressources",
          label: "Saisie des Ressources",
          path: "plan-charge-saisie-ressources",
        },
        {
          key: "delai-plan-charge",
          label: "Délai Plan de Charge",
          path: "plan-charge-delai-plan-charge",
        },
        {
          key: "cout-produit",
          label: "Coût du Produit",
          path: "plan-charge-cout-produit",
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
        {
          key: "roadmap",
          label: "Roadmap (Vision à long terme)",
          path: "planning-roadmap",
        },
        { key: "jalon", label: "Jalon", path: "planning-jalon" },
      ],
    },
    {
      key: "recette-livraison",
      label: "Recette et Livraison",
      icon: "🚀",
      submenus: [
        {
          key: "suivi-recette",
          label: "Suivi Recette",
          path: "recette-livraison-suivi-recette",
        },
        {
          key: "recette-utilisateur",
          label: "Recette Utilisateur (UAT)",
          path: "recette-livraison-recette-utilisateur",
        },
        {
          key: "livraison",
          label: "Livraison et Mise en Production",
          path: "recette-livraison-livraison",
        },
      ],
    },
    {
      key: "bugs",
      label: "Bugs",
      icon: "🐛",
      submenus: [
        {
          key: "declaration-qualification",
          label: "Déclaration et Qualification des Bugs",
          path: "bugs-declaration-qualification",
        },
        {
          key: "suivi-resolution-cloture",
          label: "Suivi Résolution Clôture",
          path: "bugs-suivi-resolution-cloture",
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
                      <Link
                        key={submenu.key}
                        to={`/${submenu.path}`}
                        className={`submenu-item ${
                          activePage === submenu.path &&
                          clickedMainMenu !== item.key
                            ? "active"
                            : ""
                        }`}
                        onClick={() => {
                          // Réinitialiser clickedMainMenu pour permettre le contraste sur ce sous-module
                          setClickedMainMenu(null);
                        }}
                      >
                        {submenu.label}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                to={`/${item.path}`}
                className={`nav-item ${
                  activePage === item.path ? "active" : ""
                }`}
              >
                <span className="nav-icon">{item.icon}</span>
                {!collapsed && <span className="nav-label">{item.label}</span>}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
