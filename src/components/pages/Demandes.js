import { useState, useEffect, useCallback } from "react";
import "./PageStyles.css";
import {
  chargerDemandes,
  creerDemande,
  mettreAJourDemande,
  supprimerDemande,
} from "../../data/gestionDemandes";
import { chargerSocietes } from "../../data/societes";

const Demandes = ({ activeSubPage: activeSubPageProp }) => {
  const [activeSubPage, setActiveSubPage] = useState("liste");
  
  // États pour la gestion des demandes
  const [demandes, setDemandes] = useState([]);
  const [societes, setSocietes] = useState([]);
  const [showDemandeForm, setShowDemandeForm] = useState(false);
  const [editingDemande, setEditingDemande] = useState(null);
  const [demandeFormData, setDemandeFormData] = useState({
    dateReception: "",
    societesDemandeurs: [],
    interlocuteur: "",
  });
  const [demandeMessage, setDemandeMessage] = useState({ type: "", text: "" });
  const [showDemandeDeleteConfirm, setShowDemandeDeleteConfirm] = useState(false);
  const [demandeToDelete, setDemandeToDelete] = useState(null);

  useEffect(() => {
    if (activeSubPageProp) {
      if (activeSubPageProp.includes("liste")) setActiveSubPage("liste");
      else if (activeSubPageProp.includes("nouvelle")) setActiveSubPage("nouvelle");
      else if (activeSubPageProp.includes("validation")) setActiveSubPage("validation");
    }
  }, [activeSubPageProp]);

  const chargerLesDemandes = useCallback(() => {
    const demandesChargees = chargerDemandes();
    setDemandes(demandesChargees);
  }, []);

  const chargerLesSocietes = useCallback(() => {
    const societesChargees = chargerSocietes();
    setSocietes(societesChargees);
  }, []);

  // Charger les données au montage et quand on change de sous-page
  useEffect(() => {
    if (activeSubPage === "liste") {
      chargerLesDemandes();
      chargerLesSocietes();
    }
  }, [activeSubPage, chargerLesDemandes, chargerLesSocietes]);

  // Fonctions pour la gestion des demandes
  const handleDemandeInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "societesDemandeurs") {
      // Gérer la sélection multiple
      const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
      setDemandeFormData((prev) => ({
        ...prev,
        [name]: selectedOptions,
      }));
    } else {
      setDemandeFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    if (demandeMessage.text) {
      setDemandeMessage({ type: "", text: "" });
    }
  };

  const handleCreateDemande = () => {
    setEditingDemande(null);
    setDemandeFormData({
      dateReception: "",
      societesDemandeurs: [],
      interlocuteur: "",
    });
    setShowDemandeForm(true);
    setDemandeMessage({ type: "", text: "" });
  };

  const handleEditDemande = (demande) => {
    setEditingDemande(demande);
    setDemandeFormData({
      dateReception: demande.dateReception,
      societesDemandeurs: demande.societesDemandeurs.map((id) => id.toString()),
      interlocuteur: demande.interlocuteur,
    });
    setShowDemandeForm(true);
    setDemandeMessage({ type: "", text: "" });
  };

  const handleDeleteDemande = (demande) => {
    setDemandeToDelete(demande);
    setShowDemandeDeleteConfirm(true);
  };

  const confirmDeleteDemande = () => {
    if (demandeToDelete) {
      const resultat = supprimerDemande(demandeToDelete.id);
      if (resultat.succes) {
        setDemandeMessage({ type: "success", text: resultat.message });
        chargerLesDemandes();
        setTimeout(() => setDemandeMessage({ type: "", text: "" }), 3000);
      } else {
        setDemandeMessage({ type: "error", text: resultat.message });
        setTimeout(() => setDemandeMessage({ type: "", text: "" }), 5000);
      }
    }
    setShowDemandeDeleteConfirm(false);
    setDemandeToDelete(null);
  };

  const cancelDeleteDemande = () => {
    setShowDemandeDeleteConfirm(false);
    setDemandeToDelete(null);
  };

  const handleDemandeSubmit = (e) => {
    e.preventDefault();
    setDemandeMessage({ type: "", text: "" });

    let resultat;
    if (editingDemande) {
      resultat = mettreAJourDemande(editingDemande.id, demandeFormData);
    } else {
      resultat = creerDemande(demandeFormData);
    }

    if (resultat.succes) {
      setDemandeMessage({ type: "success", text: resultat.message });
      chargerLesDemandes();
      setShowDemandeForm(false);
      setDemandeFormData({
        dateReception: "",
        societesDemandeurs: [],
        interlocuteur: "",
      });
      setEditingDemande(null);
      setTimeout(() => setDemandeMessage({ type: "", text: "" }), 3000);
    } else {
      setDemandeMessage({ type: "error", text: resultat.message });
    }
  };

  const handleCancelDemande = () => {
    setShowDemandeForm(false);
    setDemandeFormData({
      dateReception: "",
      societesDemandeurs: [],
      interlocuteur: "",
    });
    setEditingDemande(null);
    setDemandeMessage({ type: "", text: "" });
  };

  // Fonction pour obtenir les noms des sociétés
  const getSocietesNames = (societesIds) => {
    return societesIds.map((id) => {
      const societe = societes.find((s) => s.id === id);
      return societe ? societe.nom : "Société introuvable";
    }).join(", ");
  };

  const subPages = {
    liste: {
      title: "Liste des Demandes",
      content: (
        <div>
          <div className="action-buttons">
            <button className="btn-primary" onClick={handleCreateDemande}>
              Nouvelle demande
            </button>
          </div>

          {demandeMessage.text && (
            <div
              className={`info-box ${
                demandeMessage.type === "error" ? "error-box" : "success-box"
              }`}
              style={{
                marginTop: "16px",
                backgroundColor: demandeMessage.type === "error" ? "#fee2e2" : "#d1fae5",
                borderColor: demandeMessage.type === "error" ? "#fecaca" : "#a7f3d0",
                color: demandeMessage.type === "error" ? "#991b1b" : "#065f46",
              }}
            >
              <p>{demandeMessage.text}</p>
            </div>
          )}

          {showDemandeForm && (
            <div className="modal-overlay" onClick={handleCancelDemande}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
                <div className="modal-header">
                  <h3>{editingDemande ? "Modifier la demande" : "Créer une nouvelle demande"}</h3>
                  <button className="modal-close" onClick={handleCancelDemande}>&times;</button>
                </div>
                <form onSubmit={handleDemandeSubmit}>
                  <div className="form-group">
                    <label htmlFor="demandeId">
                      Identifiant de la demande
                    </label>
                    <input
                      type="text"
                      id="demandeId"
                      value={editingDemande ? editingDemande.id : "Généré automatiquement"}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="demandeDateEnregistrement">
                      Date d'enregistrement
                    </label>
                    <input
                      type="text"
                      id="demandeDateEnregistrement"
                      value={editingDemande ? editingDemande.dateEnregistrement : new Date().toISOString().split('T')[0]}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="demandeDateReception">
                      Date de réception <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      id="demandeDateReception"
                      name="dateReception"
                      value={demandeFormData.dateReception}
                      onChange={handleDemandeInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="demandeSocietesDemandeurs">
                      Sociétés demandeurs <span className="required">*</span>
                      <span className="hint">(Maintenir Ctrl/Cmd pour sélectionner plusieurs)</span>
                    </label>
                    <select
                      id="demandeSocietesDemandeurs"
                      name="societesDemandeurs"
                      value={demandeFormData.societesDemandeurs}
                      onChange={handleDemandeInputChange}
                      multiple
                      required
                      size={Math.min(societes.length, 5)}
                      style={{ minHeight: "120px" }}
                    >
                      {societes.map((societe) => (
                        <option key={societe.id} value={societe.id.toString()}>
                          {societe.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="demandeInterlocuteur">
                      Interlocuteur (Nom interlocuteur) <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="demandeInterlocuteur"
                      name="interlocuteur"
                      value={demandeFormData.interlocuteur}
                      onChange={handleDemandeInputChange}
                      required
                    />
                  </div>
                  <div className="modal-actions">
                    <button type="submit" className="btn-primary">
                      {editingDemande ? "Mettre à jour" : "Créer"}
                    </button>
                    <button type="button" className="btn-secondary" onClick={handleCancelDemande}>
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="table-container" style={{ marginTop: "24px" }}>
            <h3>Liste des demandes</h3>
            {demandes.length === 0 ? (
              <p style={{ color: "#6b7280", marginTop: "16px" }}>
                Aucune demande créée pour le moment.
              </p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date d'enregistrement</th>
                    <th>Date de réception</th>
                    <th>Sociétés demandeurs</th>
                    <th>Interlocuteur</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {demandes.map((demande) => (
                    <tr key={demande.id}>
                      <td>{demande.id}</td>
                      <td>{demande.dateEnregistrement}</td>
                      <td>{demande.dateReception}</td>
                      <td>{getSocietesNames(demande.societesDemandeurs)}</td>
                      <td>{demande.interlocuteur}</td>
                      <td>
                        <button
                          className="btn-link"
                          onClick={() => handleEditDemande(demande)}
                          style={{ color: "#667eea" }}
                        >
                          Modifier
                        </button>
                        <button
                          className="btn-link"
                          onClick={() => handleDeleteDemande(demande)}
                          style={{ color: "#ef4444" }}
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
    nouvelle: {
      title: "Nouvelle Demande",
      content: (
        <div>
          <p>Formulaire pour créer une nouvelle demande</p>
          <div className="action-buttons">
            <button className="btn-primary">Créer la demande</button>
          </div>
        </div>
      ),
    },
    validation: {
      title: "Validation des Demandes",
      content: (
        <div>
          <p>Liste des demandes en attente de validation</p>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Titre</th>
                  <th>Demandeur</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>#003</td>
                  <td>Demande à valider</td>
                  <td>John Doe</td>
                  <td>2024-01-16</td>
                  <td>
                    <button className="btn-link">Valider</button>
                    <button className="btn-link">Rejeter</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{subPages[activeSubPage].title}</h1>
        <p>Gérez les demandes de projet</p>
      </div>

      <div className="page-content">
        {subPages[activeSubPage].content}
      </div>

      {/* Popup de confirmation de suppression de demande */}
      {showDemandeDeleteConfirm && demandeToDelete && (
        <div className="modal-overlay" onClick={cancelDeleteDemande}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <h3>Confirmer la suppression</h3>
            </div>
            <div className="confirm-modal-body">
              <p>
                Êtes-vous sûr de vouloir supprimer la demande{" "}
                <strong>#{demandeToDelete.id}</strong> ?
              </p>
              <p className="confirm-warning">
                Cette action est irréversible.
              </p>
            </div>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="btn-danger"
                onClick={confirmDeleteDemande}
              >
                Supprimer
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={cancelDeleteDemande}
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

export default Demandes;
