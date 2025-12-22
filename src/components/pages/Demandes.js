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
  
  // États pour la soumission et validation
  const [soumissionFormData, setSoumissionFormData] = useState({
    demandeId: "",
    dateSoumissionBacklog: "",
    lienCompteRendu: "",
    redacteurBacklog: "",
    dateElaborationDATFL: "",
    dateValidationDATFL: "",
    dateElaborationPlanningDEV: "",
    dateValidationPlanningDEV: "",
    statutSoumission: "attente reception mail de validation",
  });
  const [showSoumissionForm, setShowSoumissionForm] = useState(false);
  const [editingSoumission, setEditingSoumission] = useState(null);
  const [soumissionMessage, setSoumissionMessage] = useState({ type: "", text: "" });
  const [demandeMessage, setDemandeMessage] = useState({ type: "", text: "" });
  const [showDemandeDeleteConfirm, setShowDemandeDeleteConfirm] = useState(false);
  const [demandeToDelete, setDemandeToDelete] = useState(null);

  useEffect(() => {
    if (activeSubPageProp) {
      if (activeSubPageProp.includes("liste")) setActiveSubPage("liste");
      else if (activeSubPageProp.includes("nouvelle")) setActiveSubPage("nouvelle");
      else if (activeSubPageProp.includes("validation")) setActiveSubPage("validation");
      else if (activeSubPageProp.includes("soumission-validation")) setActiveSubPage("soumission-validation");
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
    if (activeSubPage === "liste" || activeSubPage === "soumission-validation") {
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

  // Fonctions pour la soumission et validation
  const handleSoumissionInputChange = (e) => {
    const { name, value } = e.target;
    setSoumissionFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (soumissionMessage.text) {
      setSoumissionMessage({ type: "", text: "" });
    }
  };

  const handleCreateSoumission = () => {
    setEditingSoumission(null);
    setSoumissionFormData({
      demandeId: "",
      dateSoumissionBacklog: "",
      lienCompteRendu: "",
      redacteurBacklog: "",
      dateElaborationDATFL: "",
      dateValidationDATFL: "",
      dateElaborationPlanningDEV: "",
      dateValidationPlanningDEV: "",
      statutSoumission: "attente reception mail de validation",
    });
    setShowSoumissionForm(true);
    setSoumissionMessage({ type: "", text: "" });
  };

  const handleEditSoumission = (demande) => {
    setEditingSoumission(demande);
    setSoumissionFormData({
      demandeId: demande.id.toString(),
      dateSoumissionBacklog: demande.dateSoumissionBacklog || "",
      lienCompteRendu: demande.lienCompteRendu || "",
      redacteurBacklog: demande.redacteurBacklog || "",
      dateElaborationDATFL: demande.dateElaborationDATFL || "",
      dateValidationDATFL: demande.dateValidationDATFL || "",
      dateElaborationPlanningDEV: demande.dateElaborationPlanningDEV || "",
      dateValidationPlanningDEV: demande.dateValidationPlanningDEV || "",
      statutSoumission: demande.statutSoumission || "attente reception mail de validation",
    });
    setShowSoumissionForm(true);
    setSoumissionMessage({ type: "", text: "" });
  };

  const handleSoumissionSubmit = (e) => {
    e.preventDefault();
    setSoumissionMessage({ type: "", text: "" });

    // Mettre à jour la demande avec les informations de soumission
    const demande = demandes.find(d => d.id === parseInt(soumissionFormData.demandeId));
    if (!demande) {
      setSoumissionMessage({ type: "error", text: "Demande introuvable" });
      return;
    }

    const resultat = mettreAJourDemande(demande.id, {
      dateReception: demande.dateReception,
      societesDemandeurs: demande.societesDemandeurs,
      interlocuteur: demande.interlocuteur,
      dateSoumissionBacklog: soumissionFormData.dateSoumissionBacklog,
      lienCompteRendu: soumissionFormData.lienCompteRendu,
      redacteurBacklog: soumissionFormData.redacteurBacklog,
      dateElaborationDATFL: soumissionFormData.dateElaborationDATFL,
      dateValidationDATFL: soumissionFormData.dateValidationDATFL,
      dateElaborationPlanningDEV: soumissionFormData.dateElaborationPlanningDEV,
      dateValidationPlanningDEV: soumissionFormData.dateValidationPlanningDEV,
      statutSoumission: soumissionFormData.statutSoumission,
    });

    if (resultat.succes) {
      setSoumissionMessage({ type: "success", text: "Informations de soumission et validation enregistrées avec succès" });
      chargerLesDemandes();
      setShowSoumissionForm(false);
      setSoumissionFormData({
        demandeId: "",
        dateSoumissionBacklog: "",
        lienCompteRendu: "",
        redacteurBacklog: "",
        dateElaborationDATFL: "",
        dateValidationDATFL: "",
        dateElaborationPlanningDEV: "",
        dateValidationPlanningDEV: "",
        statutSoumission: "attente reception mail de validation",
      });
      setEditingSoumission(null);
      setTimeout(() => setSoumissionMessage({ type: "", text: "" }), 3000);
    } else {
      setSoumissionMessage({ type: "error", text: resultat.message });
    }
  };

  const handleCancelSoumission = () => {
    setShowSoumissionForm(false);
    setSoumissionFormData({
      demandeId: "",
      dateSoumissionBacklog: "",
      lienCompteRendu: "",
      redacteurBacklog: "",
      dateElaborationDATFL: "",
      dateValidationDATFL: "",
      dateElaborationPlanningDEV: "",
      dateValidationPlanningDEV: "",
      statutSoumission: "attente reception mail de validation",
    });
    setEditingSoumission(null);
    setSoumissionMessage({ type: "", text: "" });
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
                          style={{ color: "#4A90E2" }}
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
    "soumission-validation": {
      title: "Soumission et Validation",
      content: (
        <div>
          <div className="action-buttons">
            <button className="btn-primary" onClick={handleCreateSoumission}>
              Ajouter / Modifier Soumission
            </button>
          </div>

          {soumissionMessage.text && (
            <div
              className={`info-box ${
                soumissionMessage.type === "error" ? "error-box" : "success-box"
              }`}
              style={{
                marginTop: "16px",
                backgroundColor: soumissionMessage.type === "error" ? "#fee2e2" : "#d1fae5",
                borderColor: soumissionMessage.type === "error" ? "#fecaca" : "#a7f3d0",
                color: soumissionMessage.type === "error" ? "#991b1b" : "#065f46",
              }}
            >
              <p>{soumissionMessage.text}</p>
            </div>
          )}

          {showSoumissionForm && (
            <div className="modal-overlay" onClick={handleCancelSoumission}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "700px" }}>
                <div className="modal-header">
                  <h3>{editingSoumission ? "Modifier la soumission" : "Ajouter une soumission"}</h3>
                  <button className="modal-close" onClick={handleCancelSoumission}>&times;</button>
                </div>
                <form onSubmit={handleSoumissionSubmit}>
                  <div className="form-group">
                    <label htmlFor="soumissionDemandeId">
                      ID Demande <span className="required">*</span>
                    </label>
                    <select
                      id="soumissionDemandeId"
                      name="demandeId"
                      value={soumissionFormData.demandeId}
                      onChange={handleSoumissionInputChange}
                      required
                    >
                      {demandes.map((demande) => (
                        <option key={demande.id} value={demande.id}>
                          #{demande.id} - {demande.interlocuteur}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="dateSoumissionBacklog">
                      Date soumission du backlog pour validation
                    </label>
                    <input
                      type="date"
                      id="dateSoumissionBacklog"
                      name="dateSoumissionBacklog"
                      value={soumissionFormData.dateSoumissionBacklog}
                      onChange={handleSoumissionInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lienCompteRendu">
                      Lien du compte rendu de comité
                    </label>
                    <input
                      type="url"
                      id="lienCompteRendu"
                      name="lienCompteRendu"
                      value={soumissionFormData.lienCompteRendu}
                      onChange={handleSoumissionInputChange}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="redacteurBacklog">
                      Nom du rédacteur du backlog produit
                    </label>
                    <input
                      type="text"
                      id="redacteurBacklog"
                      name="redacteurBacklog"
                      value={soumissionFormData.redacteurBacklog}
                      onChange={handleSoumissionInputChange}
                      placeholder="Nom du rédacteur"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="dateElaborationDATFL">
                      Date d'élaboration du DATFL
                    </label>
                    <input
                      type="date"
                      id="dateElaborationDATFL"
                      name="dateElaborationDATFL"
                      value={soumissionFormData.dateElaborationDATFL}
                      onChange={handleSoumissionInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="dateValidationDATFL">
                      Date de validation du DATFL
                    </label>
                    <input
                      type="date"
                      id="dateValidationDATFL"
                      name="dateValidationDATFL"
                      value={soumissionFormData.dateValidationDATFL}
                      onChange={handleSoumissionInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="dateElaborationPlanningDEV">
                      Date d'élaboration du planning DEV
                    </label>
                    <input
                      type="date"
                      id="dateElaborationPlanningDEV"
                      name="dateElaborationPlanningDEV"
                      value={soumissionFormData.dateElaborationPlanningDEV}
                      onChange={handleSoumissionInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="dateValidationPlanningDEV">
                      Date de validation de planning DEV
                    </label>
                    <input
                      type="date"
                      id="dateValidationPlanningDEV"
                      name="dateValidationPlanningDEV"
                      value={soumissionFormData.dateValidationPlanningDEV}
                      onChange={handleSoumissionInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="statutSoumission">
                      Statut de soumission
                    </label>
                    <select
                      id="statutSoumission"
                      name="statutSoumission"
                      value={soumissionFormData.statutSoumission}
                      onChange={handleSoumissionInputChange}
                    >
                      <option value="attente reception mail de validation">Attente réception mail de validation</option>
                      <option value="validé">Validé</option>
                      <option value="en attente">En attente</option>
                    </select>
                  </div>

                  <div className="modal-actions">
                    <button type="submit" className="btn-primary">
                      {editingSoumission ? "Mettre à jour" : "Enregistrer"}
                    </button>
                    <button type="button" className="btn-secondary" onClick={handleCancelSoumission}>
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="table-container" style={{ marginTop: "24px" }}>
            <h3>Liste des soumissions et validations</h3>
            {demandes.length === 0 ? (
              <p>Aucune demande enregistrée pour le moment.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID Demande</th>
                    <th>Date soumission backlog</th>
                    <th>Rédacteur backlog</th>
                    <th>Date élaboration DATFL</th>
                    <th>Date validation DATFL</th>
                    <th>Date élaboration Planning DEV</th>
                    <th>Date validation Planning DEV</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {demandes
                    .filter(d => d.dateSoumissionBacklog || d.redacteurBacklog || d.dateElaborationDATFL)
                    .map((demande) => (
                    <tr key={demande.id}>
                      <td>#{demande.id}</td>
                      <td>{demande.dateSoumissionBacklog || "-"}</td>
                      <td>{demande.redacteurBacklog || "-"}</td>
                      <td>{demande.dateElaborationDATFL || "-"}</td>
                      <td>{demande.dateValidationDATFL || "-"}</td>
                      <td>{demande.dateElaborationPlanningDEV || "-"}</td>
                      <td>{demande.dateValidationPlanningDEV || "-"}</td>
                      <td>
                        <span className={`badge ${demande.statutSoumission === "validé" ? "badge-success" : "badge-pending"}`}>
                          {demande.statutSoumission || "Non défini"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-link"
                          onClick={() => handleEditSoumission(demande)}
                          style={{ color: "#4A90E2" }}
                        >
                          Modifier
                        </button>
                      </td>
                    </tr>
                  ))}
                  {demandes.filter(d => d.dateSoumissionBacklog || d.redacteurBacklog || d.dateElaborationDATFL).length === 0 && (
                    <tr>
                      <td colSpan="9" style={{ textAlign: "center", padding: "24px" }}>
                        Aucune soumission enregistrée pour le moment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
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
