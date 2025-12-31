import { useState, useEffect, useCallback } from "react";
import "./PageStyles.css";
import {
  chargerDemandes,
  creerDemande,
  mettreAJourDemande,
  supprimerDemande,
} from "../../data/gestionDemandes";
import { chargerSocietes } from "../../data/societes";
import { chargerCollaborateurs } from "../../data/gestionCollaborateurs";

const Demandes = ({ activeSubPage: activeSubPageProp }) => {
  // États pour la gestion des demandes
  const [demandes, setDemandes] = useState([]);
  const [societes, setSocietes] = useState([]);
  const [collaborateurs, setCollaborateurs] = useState([]);
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
    dateValidationBacklog: "",
    dateElaborationDATFL: "",
    dateValidationDATFL: "",
    dateElaborationPlanningDEV: "",
    dateValidationPlanningDEV: "",
    statutSoumission: "attente reception mail de validation",
  });
  const [showSoumissionForm, setShowSoumissionForm] = useState(false);
  const [editingSoumission, setEditingSoumission] = useState(null);
  const [soumissionMessage, setSoumissionMessage] = useState({
    type: "",
    text: "",
  });
  const [demandeMessage, setDemandeMessage] = useState({ type: "", text: "" });
  const [showDemandeDeleteConfirm, setShowDemandeDeleteConfirm] =
    useState(false);
  const [demandeToDelete, setDemandeToDelete] = useState(null);

  const chargerLesDemandes = useCallback(() => {
    const demandesChargees = chargerDemandes();
    setDemandes(demandesChargees);
  }, []);

  const chargerLesSocietes = useCallback(() => {
    const societesChargees = chargerSocietes();
    setSocietes(societesChargees);
  }, []);

  const chargerLesCollaborateurs = useCallback(() => {
    const collaborateursCharges = chargerCollaborateurs();
    setCollaborateurs(collaborateursCharges);
  }, []);

  // Charger les données au montage
  useEffect(() => {
    chargerLesDemandes();
    chargerLesSocietes();
    chargerLesCollaborateurs();
  }, [chargerLesDemandes, chargerLesSocietes, chargerLesCollaborateurs]);

  // Fonctions pour la gestion des demandes
  const handleDemandeInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "societesDemandeurs") {
      // Sélection simple : on stocke quand même en tableau pour compatibilité avec la data
      setDemandeFormData((prev) => ({
        ...prev,
        societesDemandeurs: value ? [value] : [],
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

  const validateDemandeForm = () => {
    if (!demandeFormData.dateReception) {
      setDemandeMessage({
        type: "error",
        text: "La date de réception est obligatoire.",
      });
      return false;
    }

    if (
      !demandeFormData.societesDemandeurs ||
      demandeFormData.societesDemandeurs.length === 0
    ) {
      setDemandeMessage({
        type: "error",
        text: "Veuillez sélectionner au moins une société demandeur.",
      });
      return false;
    }

    if (!demandeFormData.interlocuteur.trim()) {
      setDemandeMessage({
        type: "error",
        text: "L'interlocuteur est obligatoire.",
      });
      return false;
    }

    return true;
  };

  const handleDemandeSubmit = async (e) => {
    e.preventDefault();
    setDemandeMessage({ type: "", text: "" });

    // Validation personnalisée
    if (!validateDemandeForm()) {
      return;
    }

    // Recharger les sociétés au cas où une nouvelle a été créée
    chargerLesSocietes();

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
    const updatedData = { ...soumissionFormData, [name]: value };

    // Règles de gestion : Si le rédacteur est "chef de projet", le statut est auto-validé
    if (
      name === "redacteurBacklog" &&
      value &&
      value.toLowerCase().includes("chef de projet")
    ) {
      updatedData.statutSoumission = "validé";
      // Si on soumet le backlog et que le rédacteur est chef de projet, date de validation = date de soumission
      if (updatedData.dateSoumissionBacklog) {
        updatedData.dateValidationBacklog = updatedData.dateSoumissionBacklog;
      }
    } else if (
      name === "dateSoumissionBacklog" &&
      value &&
      updatedData.redacteurBacklog &&
      updatedData.redacteurBacklog.toLowerCase().includes("chef de projet")
    ) {
      // Si on met à jour la date de soumission et que le rédacteur est chef de projet, valider automatiquement
      updatedData.dateValidationBacklog = value;
      updatedData.statutSoumission = "validé";
    } else if (
      name === "redacteurBacklog" &&
      value &&
      !value.toLowerCase().includes("chef de projet")
    ) {
      // Si le rédacteur n'est pas chef de projet, statut par défaut
      if (
        !updatedData.statutSoumission ||
        updatedData.statutSoumission === "validé"
      ) {
        updatedData.statutSoumission = "attente reception mail de validation";
      }
    }

    setSoumissionFormData(updatedData);
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
      dateValidationBacklog: "",
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
      dateValidationBacklog: demande.dateValidationBacklog || "",
      dateElaborationDATFL: demande.dateElaborationDATFL || "",
      dateValidationDATFL: demande.dateValidationDATFL || "",
      dateElaborationPlanningDEV: demande.dateElaborationPlanningDEV || "",
      dateValidationPlanningDEV: demande.dateValidationPlanningDEV || "",
      statutSoumission:
        demande.statutSoumission || "attente reception mail de validation",
    });
    setShowSoumissionForm(true);
    setSoumissionMessage({ type: "", text: "" });
  };

  const validateSoumissionForm = () => {
    if (!soumissionFormData.demandeId) {
      setSoumissionMessage({
        type: "error",
        text: "Veuillez sélectionner une demande.",
      });
      return false;
    }

    return true;
  };

  const handleSoumissionSubmit = (e) => {
    e.preventDefault();
    setSoumissionMessage({ type: "", text: "" });

    // Validation personnalisée
    if (!validateSoumissionForm()) {
      return;
    }

    // Mettre à jour la demande avec les informations de soumission
    const demande = demandes.find(
      (d) => d.id === parseInt(soumissionFormData.demandeId)
    );
    if (!demande) {
      setSoumissionMessage({ type: "error", text: "Demande introuvable" });
      return;
    }

    // Appliquer les règles de gestion : Si rédacteur = chef de projet, statut auto-validé
    let statutFinal = soumissionFormData.statutSoumission;
    let dateValidationBacklogFinal = soumissionFormData.dateValidationBacklog;

    if (
      soumissionFormData.redacteurBacklog &&
      soumissionFormData.redacteurBacklog
        .toLowerCase()
        .includes("chef de projet") &&
      soumissionFormData.dateSoumissionBacklog
    ) {
      statutFinal = "validé";
      if (!dateValidationBacklogFinal) {
        dateValidationBacklogFinal = soumissionFormData.dateSoumissionBacklog;
      }
    }

    const resultat = mettreAJourDemande(demande.id, {
      dateReception: demande.dateReception,
      societesDemandeurs: demande.societesDemandeurs,
      interlocuteur: demande.interlocuteur,
      dateSoumissionBacklog: soumissionFormData.dateSoumissionBacklog,
      lienCompteRendu: soumissionFormData.lienCompteRendu,
      redacteurBacklog: soumissionFormData.redacteurBacklog,
      dateValidationBacklog: dateValidationBacklogFinal,
      dateElaborationDATFL: soumissionFormData.dateElaborationDATFL,
      dateValidationDATFL: soumissionFormData.dateValidationDATFL,
      dateElaborationPlanningDEV: soumissionFormData.dateElaborationPlanningDEV,
      dateValidationPlanningDEV: soumissionFormData.dateValidationPlanningDEV,
      statutSoumission: statutFinal,
    });

    if (resultat.succes) {
      setSoumissionMessage({
        type: "success",
        text: "Informations de soumission et validation enregistrées avec succès",
      });
      chargerLesDemandes();
      setShowSoumissionForm(false);
      setSoumissionFormData({
        demandeId: "",
        dateSoumissionBacklog: "",
        lienCompteRendu: "",
        redacteurBacklog: "",
        dateValidationBacklog: "",
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
    return societesIds
      .map((id) => {
        const societe = societes.find((s) => s.id === id);
        return societe ? societe.nom : "Société introuvable";
      })
      .join(", ");
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gestion des Demandes</h1>
        <p>Gérez les demandes de développement ou d'évolution</p>
      </div>

      <div className="page-content">
        {/* Rubrique 1: CRUD de demande */}
        <div className="section-rubrique" style={{ marginBottom: "48px" }}>
          <h2
            style={{
              marginBottom: "24px",
              paddingBottom: "12px",
              borderBottom: "2px solid #e5e7eb",
            }}
          >
            CRUD de Demande
          </h2>

          <div className="action-buttons">
            <button className="btn-primary" onClick={handleCreateDemande}>
              Nouvelle demande
            </button>
          </div>

          {showDemandeForm && (
            <div className="modal-overlay" onClick={handleCancelDemande}>
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: "600px" }}
              >
                <div className="modal-header">
                  <h3>
                    {editingDemande
                      ? "Modifier la demande"
                      : "Créer une nouvelle demande"}
                  </h3>
                  <button className="modal-close" onClick={handleCancelDemande}>
                    &times;
                  </button>
                </div>
                {demandeMessage.text && (
                  <div
                    className={`info-box ${
                      demandeMessage.type === "error"
                        ? "error-box"
                        : "success-box"
                    }`}
                    style={{
                      margin: "16px 24px 0 24px",
                      padding: "12px",
                      borderRadius: "6px",
                      backgroundColor:
                        demandeMessage.type === "error" ? "#fee2e2" : "#d1fae5",
                      border: `1px solid ${
                        demandeMessage.type === "error" ? "#fecaca" : "#a7f3d0"
                      }`,
                      color:
                        demandeMessage.type === "error" ? "#991b1b" : "#065f46",
                    }}
                  >
                    <p style={{ margin: 0 }}>{demandeMessage.text}</p>
                  </div>
                )}
                <form onSubmit={handleDemandeSubmit}>
                  <div className="form-group">
                    <label htmlFor="demandeId">Identifiant de la demande</label>
                    <input
                      type="text"
                      id="demandeId"
                      value={
                        editingDemande
                          ? editingDemande.id
                          : "Généré automatiquement"
                      }
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
                      value={
                        editingDemande
                          ? editingDemande.dateEnregistrement
                          : new Date().toISOString().split("T")[0]
                      }
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
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="demandeSocietesDemandeurs">
                      Sociétés demandeurs <span className="required">*</span>
                    </label>
                    <select
                      id="demandeSocietesDemandeurs"
                      name="societesDemandeurs"
                      value={demandeFormData.societesDemandeurs[0] || ""}
                      onChange={handleDemandeInputChange}
                      required
                    >
                      {societes.length === 0 && (
                        <option value="" disabled>
                          Aucune société disponible (ajoutez-en dans Paramétrage)
                        </option>
                      )}
                      {societes.map((societe) => (
                        <option key={societe.id} value={societe.id.toString()}>
                          {societe.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="demandeInterlocuteur">
                      Interlocuteur (issu du Paramétrage){" "}
                      <span className="required">*</span>
                    </label>
                    <select
                      id="demandeInterlocuteur"
                      name="interlocuteur"
                      value={demandeFormData.interlocuteur}
                      onChange={handleDemandeInputChange}
                      required
                    >
                      {collaborateurs.length === 0 && (
                        <option value="" disabled>
                          Aucun collaborateur trouvé (ajoutez-en dans Paramétrage)
                        </option>
                      )}
                      {collaborateurs.map((collab) => (
                        <option key={collab.id} value={collab.nom}>
                          {collab.nom} {collab.email ? `- ${collab.email}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="modal-actions">
                    <button type="submit" className="btn-primary">
                      {editingDemande ? "Mettre à jour" : "Créer"}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleCancelDemande}
                    >
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
                          className="btn-secondary"
                          onClick={() => handleEditDemande(demande)}
                          style={{ marginRight: "5px" }}
                        >
                          Modifier
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => handleDeleteDemande(demande)}
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

        {/* Rubrique 2: Soumission et Validation */}
        <div className="section-rubrique">
          <h2
            style={{
              marginBottom: "24px",
              paddingBottom: "12px",
              borderBottom: "2px solid #e5e7eb",
            }}
          >
            Soumission et Validation
          </h2>

          <div className="action-buttons">
            <button className="btn-primary" onClick={handleCreateSoumission}>
              Ajouter / Modifier Soumission
            </button>
          </div>

          {showSoumissionForm && (
            <div className="modal-overlay" onClick={handleCancelSoumission}>
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: "700px" }}
              >
                <div className="modal-header">
                  <h3>
                    {editingSoumission
                      ? "Modifier la soumission"
                      : "Ajouter une soumission"}
                  </h3>
                  <button
                    className="modal-close"
                    onClick={handleCancelSoumission}
                  >
                    &times;
                  </button>
                </div>
                {soumissionMessage.text && (
                  <div
                    className={`info-box ${
                      soumissionMessage.type === "error"
                        ? "error-box"
                        : "success-box"
                    }`}
                    style={{
                      margin: "16px 24px 0 24px",
                      padding: "12px",
                      borderRadius: "6px",
                      backgroundColor:
                        soumissionMessage.type === "error"
                          ? "#fee2e2"
                          : "#d1fae5",
                      border: `1px solid ${
                        soumissionMessage.type === "error"
                          ? "#fecaca"
                          : "#a7f3d0"
                      }`,
                      color:
                        soumissionMessage.type === "error"
                          ? "#991b1b"
                          : "#065f46",
                    }}
                  >
                    <p style={{ margin: 0 }}>{soumissionMessage.text}</p>
                  </div>
                )}
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
                    >
                      {demandes.length === 0 && (
                        <option value="" disabled>
                          Aucune demande disponible
                        </option>
                      )}
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
                    <small
                      style={{
                        display: "block",
                        marginTop: "4px",
                        color: "#6b7280",
                      }}
                    >
                      Le chef de projet peut soumettre son backlog produit sans
                      le cahier de charge mais il doit contenir toutes les
                      informations nécessaires
                    </small>
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
                      placeholder="Nom du rédacteur (ex: Chef de projet, GP)"
                    />
                    <small
                      style={{
                        display: "block",
                        marginTop: "4px",
                        color: "#6b7280",
                      }}
                    >
                      Si rédacteur = "Chef de projet", le backlog est d'office
                      validé
                    </small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="dateValidationBacklog">
                      Date de validation du backlog (une fois le mail reçu)
                    </label>
                    <input
                      type="date"
                      id="dateValidationBacklog"
                      name="dateValidationBacklog"
                      value={soumissionFormData.dateValidationBacklog}
                      onChange={handleSoumissionInputChange}
                      disabled={
                        soumissionFormData.redacteurBacklog &&
                        soumissionFormData.redacteurBacklog
                          .toLowerCase()
                          .includes("chef de projet")
                      }
                    />
                    {soumissionFormData.redacteurBacklog &&
                      soumissionFormData.redacteurBacklog
                        .toLowerCase()
                        .includes("chef de projet") && (
                        <small
                          style={{
                            display: "block",
                            marginTop: "4px",
                            color: "#059669",
                          }}
                        >
                          Date de validation automatique (rédacteur = Chef de
                          projet)
                        </small>
                      )}
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
                    <small
                      style={{
                        display: "block",
                        marginTop: "4px",
                        color: "#6b7280",
                      }}
                    >
                      Le chef de projet DDI doit élaborer et mettre à jour le
                      DATFL
                    </small>
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
                    <small
                      style={{
                        display: "block",
                        marginTop: "4px",
                        color: "#6b7280",
                      }}
                    >
                      Le DATFL doit être validé par le CVATL
                    </small>
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
                    <small
                      style={{
                        display: "block",
                        marginTop: "4px",
                        color: "#6b7280",
                      }}
                    >
                      Le chef de projet DDI doit élaborer et mettre à jour le
                      planning de développement
                    </small>
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
                    <small
                      style={{
                        display: "block",
                        marginTop: "4px",
                        color: "#6b7280",
                      }}
                    >
                      Le sous-directeur doit valider le planning DEV
                    </small>
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
                      disabled={
                        soumissionFormData.redacteurBacklog &&
                        soumissionFormData.redacteurBacklog
                          .toLowerCase()
                          .includes("chef de projet")
                      }
                    >
                      <option value="attente reception mail de validation">
                        Attente réception mail de validation
                      </option>
                      <option value="validé">Validé</option>
                      <option value="en attente">En attente</option>
                    </select>
                    {soumissionFormData.redacteurBacklog &&
                      soumissionFormData.redacteurBacklog
                        .toLowerCase()
                        .includes("chef de projet") && (
                        <small
                          style={{
                            display: "block",
                            marginTop: "4px",
                            color: "#059669",
                          }}
                        >
                          Statut auto-validé (rédacteur = Chef de projet)
                        </small>
                      )}
                  </div>

                  <div className="modal-actions">
                    <button type="submit" className="btn-primary">
                      {editingSoumission ? "Mettre à jour" : "Enregistrer"}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleCancelSoumission}
                    >
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
              <p style={{ color: "#6b7280", marginTop: "16px" }}>
                Aucune demande enregistrée pour le moment.
              </p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID Demande</th>
                    <th>Date de réception de la demande</th>
                    <th>Date soumission du backlog</th>
                    <th>Date validation du backlog</th>
                    <th>Lien compte rendu de comité</th>
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
                    .filter(
                      (d) =>
                        d.dateSoumissionBacklog ||
                        d.redacteurBacklog ||
                        d.dateElaborationDATFL ||
                        d.dateValidationBacklog
                    )
                    .map((demande) => (
                      <tr key={demande.id}>
                        <td>#{demande.id}</td>
                        <td>{demande.dateReception || "-"}</td>
                        <td>{demande.dateSoumissionBacklog || "-"}</td>
                        <td>{demande.dateValidationBacklog || "-"}</td>
                        <td>
                          {demande.lienCompteRendu ? (
                            <a
                              href={demande.lienCompteRendu}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "#4A90E2" }}
                            >
                              Lien
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>{demande.redacteurBacklog || "-"}</td>
                        <td>{demande.dateElaborationDATFL || "-"}</td>
                        <td>{demande.dateValidationDATFL || "-"}</td>
                        <td>{demande.dateElaborationPlanningDEV || "-"}</td>
                        <td>{demande.dateValidationPlanningDEV || "-"}</td>
                        <td>
                          <span
                            className={`badge ${
                              demande.statutSoumission === "validé"
                                ? "badge-success"
                                : "badge-pending"
                            }`}
                          >
                            {demande.statutSoumission || "Non défini"}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-secondary"
                            onClick={() => handleEditSoumission(demande)}
                          >
                            Modifier
                          </button>
                        </td>
                      </tr>
                    ))}
                  {demandes.filter(
                    (d) =>
                      d.dateSoumissionBacklog ||
                      d.redacteurBacklog ||
                      d.dateElaborationDATFL ||
                      d.dateValidationBacklog
                  ).length === 0 && (
                    <tr>
                      <td
                        colSpan="12"
                        style={{ textAlign: "center", padding: "24px" }}
                      >
                        Aucune soumission enregistrée pour le moment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
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
              <p className="confirm-warning">Cette action est irréversible.</p>
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
