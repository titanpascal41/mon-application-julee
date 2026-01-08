import { useState, useEffect } from "react";
import "./PageStyles.css";

// Import des images d'avatars depuis le dossier local
// Assurez-vous que les fichiers avatar1.png à avatar8.png existent dans src/image/avatars/
import avatar1 from "../../image/avatars/fille1.png";
import avatar2 from "../../image/avatars/fille2.png";
import avatar3 from "../../image/avatars/garcon.png";
import avatar4 from "../../image/avatars/fille3.png";
import avatar5 from "../../image/avatars/fille.png";
import avatar6 from "../../image/avatars/garcon1.png";
import avatar7 from "../../image/avatars/garcon2.png";
import avatar8 from "../../image/avatars/garcon3.png";

// Liste d'icônes de personnage (images locales)
const avatarOptions = [
  {
    id: 1,
    name: "Personne aux cheveux orange",
    url: avatar1,
  },
  {
    id: 2,
    name: "Personne aux cheveux jaunes",
    url: avatar2,
  },
  {
    id: 3,
    name: "Personne aux cheveux orange et chemise bleue",
    url: avatar3,
  },
  {
    id: 4,
    name: "Personne aux cheveux bruns longs",
    url: avatar4,
  },
  {
    id: 5,
    name: "Personne aux cheveux bruns courts",
    url: avatar5,
  },
  {
    id: 6,
    name: "Personne aux cheveux bruns et lunettes",
    url: avatar6,
  },
  {
    id: 7,
    name: "Homme en costume",
    url: avatar7,
  },
  {
    id: 8,
    name: "Femme professionnelle",
    url: avatar8,
  },
];

const Profil = () => {
  // Récupérer l'utilisateur depuis localStorage
  const utilisateurStocke = localStorage.getItem("utilisateurConnecte");
  const utilisateurInitial = utilisateurStocke
    ? JSON.parse(utilisateurStocke)
    : null;

  const [utilisateur, setUtilisateur] = useState({
    prenom: utilisateurInitial?.prenom || "",
    nom: utilisateurInitial?.nom || "",
    email: utilisateurInitial?.email || "",
    avatar: utilisateurInitial?.avatar || null,
  });

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Charger l'avatar depuis localStorage si disponible
  useEffect(() => {
    const avatarStocke = localStorage.getItem("userAvatar");
    if (avatarStocke) {
      setUtilisateur((prev) => ({ ...prev, avatar: avatarStocke }));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUtilisateur((prev) => ({ ...prev, [name]: value }));
    setMessage({ type: "", text: "" });
  };

  const handleSelectAvatar = (avatarUrl) => {
    setUtilisateur((prev) => ({ ...prev, avatar: avatarUrl }));
    setShowAvatarModal(false);
    // Ne pas sauvegarder immédiatement - attendre le clic sur "Enregistrer les modifications"
  };

  const handleSaveProfile = () => {
    // Valider les champs
    if (
      !utilisateur.prenom.trim() ||
      !utilisateur.nom.trim() ||
      !utilisateur.email.trim()
    ) {
      setMessage({
        type: "error",
        text: "Veuillez remplir tous les champs obligatoires.",
      });
      return;
    }

    // Valider l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(utilisateur.email)) {
      setMessage({
        type: "error",
        text: "Veuillez entrer une adresse email valide.",
      });
      return;
    }

    // Mettre à jour l'utilisateur dans localStorage
    const utilisateurMisAJour = {
      ...utilisateurInitial,
      prenom: utilisateur.prenom.trim(),
      nom: utilisateur.nom.trim(),
      email: utilisateur.email.trim(),
      avatar: utilisateur.avatar,
    };

    localStorage.setItem(
      "utilisateurConnecte",
      JSON.stringify(utilisateurMisAJour)
    );

    // Sauvegarder aussi l'avatar séparément pour faciliter la récupération dans le Header
    if (utilisateur.avatar) {
      localStorage.setItem("userAvatar", utilisateur.avatar);
    }

    setMessage({ type: "success", text: "Profil mis à jour avec succès" });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Mon Profil</h1>
        <p>Gérez vos informations personnelles</p>
      </div>

      {message.text && (
        <div
          className={`info-box ${
            message.type === "error" ? "error-box" : "success-box"
          }`}
          style={{
            marginBottom: "24px",
            padding: "12px",
            borderRadius: "6px",
            backgroundColor: message.type === "error" ? "#fee2e2" : "#d1fae5",
            border: `1px solid ${
              message.type === "error" ? "#fecaca" : "#a7f3d0"
            }`,
            color: message.type === "error" ? "#991b1b" : "#065f46",
          }}
        >
          <p style={{ margin: 0 }}>{message.text}</p>
        </div>
      )}

      <div className="page-content">
        {/* Section Photo de profil */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginBottom: "48px",
            paddingBottom: "32px",
            borderBottom: "2px solid #e5e7eb",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "120px",
              height: "120px",
              flexShrink: 0,
            }}
          >
            {utilisateur.avatar ? (
              <img
                src={utilisateur.avatar}
                alt="Photo de profil"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "4px solid #4A90E2",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "48px",
                  fontWeight: 600,
                  border: "4px solid #4A90E2",
                }}
              >
                {utilisateur.prenom.charAt(0)}
                {utilisateur.nom.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <button
              className="btn-primary"
              onClick={() => setShowAvatarModal(true)}
              style={{ marginTop: "8px" }}
            >
              Modifier
            </button>
          </div>
        </div>

        {/* Formulaire d'informations */}
        <div style={{ maxWidth: "600px" }}>
          <h2 style={{ marginBottom: "24px", color: "#1a1a1a" }}>
            Informations personnelles
          </h2>

          <div className="form-group">
            <label htmlFor="prenom">
              Prénom <span className="required">*</span>
            </label>
            <input
              type="text"
              id="prenom"
              name="prenom"
              value={utilisateur.prenom}
              onChange={handleInputChange}
              placeholder="Votre prénom"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="nom">
              Nom <span className="required">*</span>
            </label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={utilisateur.nom}
              onChange={handleInputChange}
              placeholder="Votre nom"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={utilisateur.email}
              onChange={handleInputChange}
              placeholder="votre.email@exemple.com"
              required
            />
          </div>

          <div className="action-buttons" style={{ marginTop: "32px" }}>
            <button className="btn-primary" onClick={handleSaveProfile}>
              Enregistrer les modifications
            </button>
          </div>
        </div>
      </div>

      {/* Modal de sélection d'avatar */}
      {showAvatarModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAvatarModal(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "600px" }}
          >
            <div className="modal-header">
              <h3>Choisir une photo de profil</h3>
              <button
                className="modal-close"
                onClick={() => setShowAvatarModal(false)}
              >
                &times;
              </button>
            </div>
            <div
              style={{
                padding: "24px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                gap: "16px",
              }}
            >
              {avatarOptions.map((avatar) => (
                <div
                  key={avatar.id}
                  onClick={() => handleSelectAvatar(avatar.url)}
                  style={{
                    cursor: "pointer",
                    padding: "8px",
                    borderRadius: "12px",
                    border:
                      utilisateur.avatar === avatar.url
                        ? "3px solid #4A90E2"
                        : "2px solid #e5e7eb",
                    transition: "all 0.2s ease",
                    textAlign: "center",
                  }}
                  onMouseEnter={(e) => {
                    if (utilisateur.avatar !== avatar.url) {
                      e.currentTarget.style.borderColor = "#4A90E2";
                      e.currentTarget.style.backgroundColor = "#f0f9ff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (utilisateur.avatar !== avatar.url) {
                      e.currentTarget.style.borderColor = "#e5e7eb";
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <img
                    src={avatar.url}
                    alt={avatar.name}
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: "50%",
                    }}
                  />
                  <p
                    style={{
                      margin: "8px 0 0 0",
                      fontSize: "12px",
                      color: "#6b7280",
                    }}
                  >
                    {avatar.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profil;
