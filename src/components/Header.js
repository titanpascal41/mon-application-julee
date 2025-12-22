import { useState } from "react";
import "./Header.css";

const Header = ({ utilisateur, deconnecter }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <h2>Tableau de bord</h2>
      </div>
      <div className="header-right">
        <div className="header-actions">
          <button className="header-icon-btn" title="Messages">
            💬
          </button>
          <button className="header-icon-btn" title="Notifications">
            🔔
          </button>
        </div>
        <div className="user-menu-wrapper">
          <div 
            className="user-profile"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">
              {utilisateur.prenom.charAt(0)}{utilisateur.nom.charAt(0)}
            </div>
            <div className="user-info">
              <span className="user-name">{utilisateur.prenom} {utilisateur.nom}</span>
              <span className="user-email">{utilisateur.email}</span>
            </div>
            <span className="user-arrow">▼</span>
          </div>
          {showUserMenu && (
            <div className="user-dropdown">
              <div className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                👤 Profil
              </div>
              <div className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                📧 Boîte de réception
              </div>
              <div className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                🔒 Verrouiller l'écran
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item logout" onClick={deconnecter}>
                🚪 Se déconnecter
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

