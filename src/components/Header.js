import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDelaisEnRetard,
  marquerNotificationVue,
} from "../data/gestionDelaisPlanCharge";
import "./Header.css";

const Header = ({ utilisateur, deconnecter, onNotificationClick }) => {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [delaisEnRetard, setDelaisEnRetard] = useState([]);

  // Charger les délais en retard au montage et mettre à jour périodiquement
  useEffect(() => {
    const chargerDelaisEnRetard = () => {
      const delais = getDelaisEnRetard();
      setDelaisEnRetard(delais);
    };

    // Charger immédiatement
    chargerDelaisEnRetard();

    // Mettre à jour toutes les 30 secondes
    const interval = setInterval(chargerDelaisEnRetard, 30000);

    return () => clearInterval(interval);
  }, []);

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
          <div className="notification-wrapper">
            <button
              className="header-icon-btn notification-btn"
              title="Notifications"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              🔔
              {delaisEnRetard.length > 0 && (
                <span className="notification-badge">
                  {delaisEnRetard.length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h4>Notifications</h4>
                  {delaisEnRetard.length > 0 && (
                    <span className="notification-count">
                      {delaisEnRetard.length}
                    </span>
                  )}
                </div>
                <div className="notification-content">
                  {delaisEnRetard.length === 0 ? (
                    <div className="notification-item empty">
                      <p>✅ Aucun délai en retard</p>
                    </div>
                  ) : (
                    delaisEnRetard.map((delai) => (
                      <div
                        key={delai.id}
                        className="notification-item urgent clickable"
                        onClick={() => {
                          // Marquer la notification comme vue
                          marquerNotificationVue(delai.id);
                          // Fermer le dropdown
                          setShowNotifications(false);
                          // Naviguer vers la page des délais
                          if (onNotificationClick) {
                            onNotificationClick(
                              "plan-charge-delai-plan-charge",
                              delai.id
                            );
                          }
                        }}
                      >
                        <div className="notification-icon">⚠️</div>
                        <div className="notification-text">
                          <p className="notification-title">
                            Délai dépassé - ID: {delai.id}
                          </p>
                          <p className="notification-details">
                            Validation SI:{" "}
                            {new Date(
                              delai.dateValidationSI
                            ).toLocaleDateString()}
                          </p>
                          <p className="notification-details">
                            Retard pour:{" "}
                            {!delai.dateReponseDEV && !delai.dateReponseTIV
                              ? "DEV et TIV"
                              : !delai.dateReponseDEV
                              ? "DEV"
                              : !delai.dateReponseTIV
                              ? "TIV"
                              : "DEV et TIV"}
                          </p>
                        </div>
                        <div className="notification-arrow">→</div>
                      </div>
                    ))
                  )}
                </div>
                {delaisEnRetard.length > 0 && (
                  <div className="notification-footer">
                    <button
                      className="btn-link"
                      onClick={() => {
                        setShowNotifications(false);
                        navigate("/plan-charge-delai-plan-charge");
                      }}
                    >
                      Voir tous les délais →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="user-menu-wrapper">
          <div
            className="user-profile"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">
              {utilisateur.prenom.charAt(0)}
              {utilisateur.nom.charAt(0)}
            </div>
            <div className="user-info">
              <span className="user-name">
                {utilisateur.prenom} {utilisateur.nom}
              </span>
              <span className="user-email">{utilisateur.email}</span>
            </div>
            <span className="user-arrow">▼</span>
          </div>
          {showUserMenu && (
            <div className="user-dropdown">
              <div
                className="dropdown-item"
                onClick={() => setShowUserMenu(false)}
              >
                👤 Profil
              </div>
              <div
                className="dropdown-item"
                onClick={() => setShowUserMenu(false)}
              >
                📧 Boîte de réception
              </div>
              <div
                className="dropdown-item"
                onClick={() => setShowUserMenu(false)}
              >
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
