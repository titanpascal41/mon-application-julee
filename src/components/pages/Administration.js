import { useState, useEffect, useCallback } from "react";
import "./PageStyles.css";
import {
  chargerProfils,
  creerProfil,
  mettreAJourProfil,
  supprimerProfil,
} from "../../data/gestionProfils";
import {
  chargerUtilisateurs,
  creerUtilisateur,
  mettreAJourUtilisateur,
  supprimerUtilisateur,
} from "../../data/baseDeDonnees";

const Administration = ({ activeSubPage: activeSubPageProp }) => {
  const [activeSubPage, setActiveSubPage] = useState("profils");

  // États pour la gestion des profils
  const [profils, setProfils] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProfil, setEditingProfil] = useState(null);
  const [formData, setFormData] = useState({
    nom: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [profilToDelete, setProfilToDelete] = useState(null);

  // États pour la gestion des utilisateurs
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    profilId: "",
  });
  const [userMessage, setUserMessage] = useState({ type: "", text: "" });
  const [showUserDeleteConfirm, setShowUserDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    if (activeSubPageProp) {
      // Extraire le type de sous-page depuis le path
      if (activeSubPageProp.includes("profils")) setActiveSubPage("profils");
      else if (activeSubPageProp.includes("utilisateurs"))
        setActiveSubPage("utilisateurs");
    }
  }, [activeSubPageProp]);

  const chargerLesProfils = useCallback(() => {
    const profilsCharges = chargerProfils();
    setProfils(profilsCharges);
  }, []);

  const chargerLesUtilisateurs = useCallback(() => {
    const utilisateursCharges = chargerUtilisateurs();
    setUtilisateurs(utilisateursCharges);
  }, []);

  // Charger les profils / utilisateurs au montage et quand on change de sous-page
  useEffect(() => {
    if (activeSubPage === "profils") {
      chargerLesProfils();
      // Charger aussi les utilisateurs pour afficher le nombre d'utilisateurs par profil
      chargerLesUtilisateurs();
    } else if (activeSubPage === "utilisateurs") {
      // Charger les profils pour le dropdown et les utilisateurs
      chargerLesProfils();
      chargerLesUtilisateurs();
    }
  }, [activeSubPage, chargerLesProfils, chargerLesUtilisateurs]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Effacer les messages d'erreur lors de la saisie
    if (message.text) {
      setMessage({ type: "", text: "" });
    }
  };

  const handleCreate = () => {
    setEditingProfil(null);
    setFormData({ nom: "" });
    setShowForm(true);
    setMessage({ type: "", text: "" });
  };

  const handleEdit = (profil) => {
    setEditingProfil(profil);
    setFormData({
      nom: profil.nom,
    });
    setShowForm(true);
    setMessage({ type: "", text: "" });
  };

  const handleDelete = (profil) => {
    setProfilToDelete(profil);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (profilToDelete) {
      const resultat = supprimerProfil(profilToDelete.id);
      if (resultat.succes) {
        setMessage({ type: "success", text: resultat.message });
        chargerLesProfils();
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: resultat.message });
        setTimeout(() => setMessage({ type: "", text: "" }), 5000);
      }
    }
    setShowDeleteConfirm(false);
    setProfilToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setProfilToDelete(null);
  };

  // Fonctions pour la gestion des utilisateurs
  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setUserFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (userMessage.text) {
      setUserMessage({ type: "", text: "" });
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setUserFormData({
      nom: "",
      prenom: "",
      email: "",
      motDePasse: "",
      profilId: "",
    });
    setShowUserForm(true);
    setUserMessage({ type: "", text: "" });
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserFormData({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      motDePasse: "", // Ne pas afficher le mot de passe
      profilId: user.profilId || "",
    });
    setShowUserForm(true);
    setUserMessage({ type: "", text: "" });
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowUserDeleteConfirm(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      const resultat = supprimerUtilisateur(userToDelete.id);
      if (resultat.succes) {
        setUserMessage({ type: "success", text: resultat.message });
        chargerLesUtilisateurs();
        setTimeout(() => setUserMessage({ type: "", text: "" }), 3000);
      } else {
        setUserMessage({ type: "error", text: resultat.message });
        setTimeout(() => setUserMessage({ type: "", text: "" }), 5000);
      }
    }
    setShowUserDeleteConfirm(false);
    setUserToDelete(null);
  };

  const cancelDeleteUser = () => {
    setShowUserDeleteConfirm(false);
    setUserToDelete(null);
  };

  const validateUserForm = () => {
    if (!userFormData.nom.trim()) {
      setUserMessage({
        type: "error",
        text: "Le nom est obligatoire.",
      });
      return false;
    }

    if (!userFormData.prenom.trim()) {
      setUserMessage({
        type: "error",
        text: "Le prénom est obligatoire.",
      });
      return false;
    }

    if (!userFormData.email.trim()) {
      setUserMessage({
        type: "error",
        text: "L'email est obligatoire.",
      });
      return false;
    }

    if (!editingUser && !userFormData.motDePasse.trim()) {
      setUserMessage({
        type: "error",
        text: "Le mot de passe est obligatoire.",
      });
      return false;
    }

    if (!userFormData.profilId) {
      setUserMessage({
        type: "error",
        text: "Le profil est obligatoire.",
      });
      return false;
    }

    return true;
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();
    setUserMessage({ type: "", text: "" });

    // Validation personnalisée
    if (!validateUserForm()) {
      return;
    }

    let resultat;
    if (editingUser) {
      // Mise à jour
      resultat = mettreAJourUtilisateur(
        editingUser.id,
        userFormData.prenom,
        userFormData.nom,
        userFormData.email,
        userFormData.motDePasse,
        parseInt(userFormData.profilId),
        ""
      );
    } else {
      // Création
      resultat = creerUtilisateur(
        userFormData.prenom,
        userFormData.nom,
        userFormData.email,
        userFormData.motDePasse,
        parseInt(userFormData.profilId),
        ""
      );
    }

    if (resultat.succes) {
      setUserMessage({ type: "success", text: resultat.message });
      chargerLesUtilisateurs();
      setShowUserForm(false);
      setUserFormData({
        nom: "",
        prenom: "",
        email: "",
        motDePasse: "",
        profilId: "",
      });
      setEditingUser(null);
      setTimeout(() => setUserMessage({ type: "", text: "" }), 3000);
    } else {
      setUserMessage({ type: "error", text: resultat.message });
    }
  };

  const handleCancelUser = () => {
    setShowUserForm(false);
    setUserFormData({
      nom: "",
      prenom: "",
      email: "",
      motDePasse: "",
      profilId: "",
    });
    setEditingUser(null);
    setUserMessage({ type: "", text: "" });
  };

  // Fonction pour obtenir le nom du profil à partir de l'ID
  const getProfilName = (profilId) => {
    if (!profilId) return "Aucun profil";
    const profil = profils.find((p) => p.id === profilId);
    return profil ? profil.nom : "Profil introuvable";
  };

  // Fonction pour compter le nombre d'utilisateurs par profil
  const getNombreUtilisateursParProfil = (profilId) => {
    return utilisateurs.filter((user) => user.profilId === profilId).length;
  };

  const validateProfilForm = () => {
    if (!formData.nom.trim()) {
      setMessage({
        type: "error",
        text: "Le nom est obligatoire.",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    // Validation personnalisée
    if (!validateProfilForm()) {
      return;
    }

    let resultat;
    if (editingProfil) {
      // Mise à jour
      resultat = mettreAJourProfil(
        editingProfil.id,
        formData.nom
      );
    } else {
      // Création
      resultat = creerProfil(formData.nom);
    }

    if (resultat.succes) {
      setMessage({ type: "success", text: resultat.message });
      chargerLesProfils();
      setShowForm(false);
      setFormData({ nom: "" });
      setEditingProfil(null);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } else {
      setMessage({ type: "error", text: resultat.message });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({ nom: "" });
    setEditingProfil(null);
    setMessage({ type: "", text: "" });
  };

  const subPages = {
    profils: {
      title: "Gestion des Profils",
      content: (
        <div>
          <div className="action-buttons">
            <button className="btn-primary" onClick={handleCreate}>
              Créer un profil
            </button>
          </div>

          {showForm && (
            <div className="modal-overlay" onClick={handleCancel}>
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h3>
                    {editingProfil
                      ? "Modifier le profil"
                      : "Créer un nouveau profil"}
                  </h3>
                  <button className="modal-close" onClick={handleCancel}>
                    &times;
                  </button>
                </div>
                {message.text && (
                  <div
                    className={`info-box ${
                      message.type === "error" ? "error-box" : "success-box"
                    }`}
                    style={{
                      margin: "16px 24px 0 24px",
                      padding: "12px",
                      borderRadius: "6px",
                      backgroundColor:
                        message.type === "error" ? "#fee2e2" : "#d1fae5",
                      border: `1px solid ${
                        message.type === "error" ? "#fecaca" : "#a7f3d0"
                      }`,
                      color: message.type === "error" ? "#991b1b" : "#065f46",
                    }}
                  >
                    <p style={{ margin: 0 }}>{message.text}</p>
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="idProfil">Identifiant du profil</label>
                    <input
                      type="text"
                      id="idProfil"
                      value={
                        editingProfil
                          ? editingProfil.id
                          : "Généré automatiquement"
                      }
                      disabled
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
                      value={formData.nom}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="modal-actions">
                    <button type="submit" className="btn-primary">
                      {editingProfil ? "Mettre à jour" : "Créer"}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleCancel}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="table-container" style={{ marginTop: "24px" }}>
            <h3>Liste des profils</h3>
            {profils.length === 0 ? (
              <p style={{ color: "#6b7280", marginTop: "16px" }}>
                Aucun profil créé pour le moment.
              </p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Identifiant</th>
                    <th>Nom</th>
                    <th>Nombre d'utilisateurs</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {profils.map((profil) => (
                    <tr key={profil.id}>
                      <td>{profil.id}</td>
                      <td>{profil.nom}</td>
                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 12px",
                            borderRadius: "12px",
                            backgroundColor: "#dbeafe",
                            color: "#1e40af",
                            fontWeight: "500",
                            fontSize: "14px",
                          }}
                        >
                          {getNombreUtilisateursParProfil(profil.id)} utilisateur
                          {getNombreUtilisateursParProfil(profil.id) !== 1
                            ? "s"
                            : ""}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-secondary"
                          onClick={() => handleEdit(profil)}
                          style={{ marginRight: "5px" }}
                        >
                          Modifier
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => handleDelete(profil)}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ),
    },
    utilisateurs: {
      title: "Gestion des Utilisateurs",
      content: (
        <div>
          {profils.length === 0 ? (
            <div
              className="info-box error-box"
              style={{
                marginBottom: "24px",
                padding: "16px",
                borderRadius: "8px",
                backgroundColor: "#fef3c7",
                border: "1px solid #fde68a",
                color: "#92400e",
              }}
            >
              <p style={{ margin: 0, fontWeight: "500" }}>
                ⚠️ Aucun profil disponible. Vous devez d'abord créer un profil
                avant de pouvoir créer un utilisateur.
              </p>
              <p style={{ margin: "8px 0 0 0", fontSize: "14px" }}>
                Veuillez aller dans la section "Gestion des Profils" pour créer
                un profil.
              </p>
            </div>
          ) : null}
          <div className="action-buttons">
            <button
              className="btn-primary"
              onClick={handleCreateUser}
              disabled={profils.length === 0}
              style={{
                opacity: profils.length === 0 ? 0.5 : 1,
                cursor: profils.length === 0 ? "not-allowed" : "pointer",
              }}
            >
              Ajouter un utilisateur
            </button>
          </div>

          {showUserForm && (
            <div className="modal-overlay" onClick={handleCancelUser}>
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h3>
                    {editingUser
                      ? "Modifier l'utilisateur"
                      : "Créer un nouvel utilisateur"}
                  </h3>
                  <button className="modal-close" onClick={handleCancelUser}>
                    &times;
                  </button>
                </div>
                {userMessage.text && (
                  <div
                    className={`info-box ${
                      userMessage.type === "error" ? "error-box" : "success-box"
                    }`}
                    style={{
                      margin: "16px 24px 0 24px",
                      padding: "12px",
                      borderRadius: "6px",
                      backgroundColor:
                        userMessage.type === "error" ? "#fee2e2" : "#d1fae5",
                      border: `1px solid ${
                        userMessage.type === "error" ? "#fecaca" : "#a7f3d0"
                      }`,
                      color:
                        userMessage.type === "error" ? "#991b1b" : "#065f46",
                    }}
                  >
                    <p style={{ margin: 0 }}>{userMessage.text}</p>
                  </div>
                )}
                <form onSubmit={handleUserSubmit}>
                  <div className="form-group">
                    <label htmlFor="userId">Identifiant de l'utilisateur</label>
                    <input
                      type="text"
                      id="userId"
                      value={
                        editingUser ? editingUser.id : "Généré automatiquement"
                      }
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="userProfilId">
                      Profil <span className="required">*</span>
                    </label>
                    <select
                      id="userProfilId"
                      name="profilId"
                      value={userFormData.profilId}
                      onChange={handleUserInputChange}
                      required
                    >
                      {profils.map((profil) => (
                        <option key={profil.id} value={profil.id}>
                          {profil.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="userNom">
                      Nom <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="userNom"
                      name="nom"
                      value={userFormData.nom}
                      onChange={handleUserInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="userPrenom">
                      Prénom <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="userPrenom"
                      name="prenom"
                      value={userFormData.prenom}
                      onChange={handleUserInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="userEmail">
                      Email <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      id="userEmail"
                      name="email"
                      value={userFormData.email}
                      onChange={handleUserInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="userMotDePasse">
                      Mot de passe <span className="required">*</span>
                      <span className="hint">
                        (minimum 8 caractères différents)
                      </span>
                    </label>
                    <input
                      type="password"
                      id="userMotDePasse"
                      name="motDePasse"
                      value={userFormData.motDePasse}
                      onChange={handleUserInputChange}
                      placeholder={
                        editingUser ? "Laisser vide pour ne pas modifier" : ""
                      }
                    />
                  </div>
                  <div className="modal-actions">
                    <button type="submit" className="btn-primary">
                      {editingUser ? "Mettre à jour" : "Créer"}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleCancelUser}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      ),
    },
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{subPages[activeSubPage].title}</h1>
        <p>Gérez les paramètres administratifs du système</p>
      </div>

      <div className="page-content">{subPages[activeSubPage].content}</div>

      {/* Popup de confirmation de suppression de profil */}
      {showDeleteConfirm && profilToDelete && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <h3>Confirmer la suppression</h3>
            </div>
            <div className="confirm-modal-body">
              <p>
                Êtes-vous sûr de vouloir supprimer le profil{" "}
                <strong>
                  "{profilToDelete.nom}"
                </strong>{" "}
                ?
              </p>
              <p className="confirm-warning">Cette action est irréversible.</p>
            </div>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="btn-danger"
                onClick={confirmDelete}
              >
                Supprimer
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={cancelDelete}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup de confirmation de suppression d'utilisateur */}
      {showUserDeleteConfirm && userToDelete && (
        <div className="modal-overlay" onClick={cancelDeleteUser}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <h3>Confirmer la suppression</h3>
            </div>
            <div className="confirm-modal-body">
              <p>
                Êtes-vous sûr de vouloir supprimer l'utilisateur{" "}
                <strong>
                  "{userToDelete.nom} {userToDelete.prenom}"
                </strong>{" "}
                ?
              </p>
              <p className="confirm-warning">
                Cette action est irréversible. L'utilisateur devra se
                reconnecter.
              </p>
            </div>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="btn-danger"
                onClick={confirmDeleteUser}
              >
                Supprimer
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={cancelDeleteUser}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Administration;
