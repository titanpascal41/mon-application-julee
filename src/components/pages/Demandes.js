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
    typeProjet: "",
    nomProjet: "",
    descriptionPerimetre: "",
    perimetre: "",
  });
  const perimetreOptions = [
    "ND",
    "ANL",
    "DEV",
    "DEP",
    "DEM",
    "REC",
    "TIF",
    "LIV",
    "FREC",
    "ANN",
    "SUSP",
    "A PLAN",
    "ENREG",
  ];

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
      typeProjet: "",
      nomProjet: "",
      descriptionPerimetre: "",
      perimetre: "",
    });
    setShowDemandeForm(true);
    setDemandeMessage({ type: "", text: "" });
  };

  // Création rapide d'une demande prospecte avec type pré-rempli
  const handleCreateDemandeProspecte = () => {
    setEditingDemande(null);
    setDemandeFormData({
      dateReception: "",
      societesDemandeurs: [],
      interlocuteur: "",
      typeProjet: "Prospecte",
      nomProjet: "",
      descriptionPerimetre: "",
      perimetre: "",
    });
    setShowDemandeForm(true);
    setDemandeMessage({ type: "", text: "" });
  };

  // Création rapide d'une demande d'évolution avec type pré-rempli
  const handleCreateDemandeEvolution = () => {
    setEditingDemande(null);
    setDemandeFormData({
      dateReception: "",
      societesDemandeurs: [],
      interlocuteur: "",
      typeProjet: "Evolution",
      nomProjet: "",
      descriptionPerimetre: "",
      perimetre: "",
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
      typeProjet: demande.typeProjet || "",
      nomProjet: demande.nomProjet || "",
      descriptionPerimetre: demande.descriptionPerimetre || "",
      perimetre: demande.perimetre || "",
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

    if (!demandeFormData.typeProjet.trim()) {
      setDemandeMessage({
        type: "error",
        text: "Le type de projet est obligatoire.",
      });
      return false;
    }

    if (!demandeFormData.nomProjet.trim()) {
      setDemandeMessage({
        type: "error",
        text: "Le nom du projet est obligatoire.",
      });
      return false;
    }

    if (!demandeFormData.descriptionPerimetre.trim()) {
      setDemandeMessage({
        type: "error",
        text: "La description du périmètre est obligatoire.",
      });
      return false;
    }

    if (!demandeFormData.perimetre) {
      setDemandeMessage({
        type: "error",
        text: "Le périmètre est obligatoire.",
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
        typeProjet: "",
        nomProjet: "",
        descriptionPerimetre: "",
        perimetre: "",
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
      typeProjet: "",
      nomProjet: "",
      descriptionPerimetre: "",
      perimetre: "",
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
        <div className="section-rubrique" style={{ marginBottom: "48px" }}>
          <h2
            style={{
              marginBottom: "24px",
              paddingBottom: "12px",
              borderBottom: "2px solid #e5e7eb",
            }}
          >
            Demandes
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
                    <label htmlFor="demandeTypeProjet">
                      Type de projet <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="demandeTypeProjet"
                      name="typeProjet"
                      value={demandeFormData.typeProjet}
                      onChange={handleDemandeInputChange}
                      placeholder="Ex : Refonte, Nouvelle feature..."
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="demandeNomProjet">
                      Nom du projet <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="demandeNomProjet"
                      name="nomProjet"
                      value={demandeFormData.nomProjet}
                      onChange={handleDemandeInputChange}
                      placeholder="Nom du projet"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="demandeDescriptionPerimetre">
                      Description du périmètre <span className="required">*</span>
                    </label>
                    <textarea
                      id="demandeDescriptionPerimetre"
                      name="descriptionPerimetre"
                      value={demandeFormData.descriptionPerimetre}
                      onChange={handleDemandeInputChange}
                      rows={3}
                      placeholder="Décrivez le périmètre concerné"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="demandePerimetre">
                      Périmètre <span className="required">*</span>
                    </label>
                    <select
                      id="demandePerimetre"
                      name="perimetre"
                      value={demandeFormData.perimetre}
                      onChange={handleDemandeInputChange}
                      required
                    >
                      <option value="" disabled>
                        Sélectionnez un périmètre
                      </option>
                      {perimetreOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
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
                    <th>Date d'enregistrement</th>
                    <th>Date de réception</th>
                    <th>Sociétés demandeurs</th>
                    <th>Interlocuteur</th>
                    <th>Type projet</th>
                    <th>Nom projet</th>
                    <th>Périmètre</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {demandes.map((demande) => (
                    <tr key={demande.id}>
                      <td>{demande.dateEnregistrement}</td>
                      <td>{demande.dateReception}</td>
                      <td>{getSocietesNames(demande.societesDemandeurs)}</td>
                      <td>{demande.interlocuteur}</td>
                      <td>{demande.typeProjet || "-"}</td>
                      <td>{demande.nomProjet || "-"}</td>
                      <td>{demande.perimetre || "-"}</td>
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

        {/* Rubrique 2: Demande prospecte */}
        <div className="section-rubrique">
          <h2
            style={{
              marginBottom: "24px",
              paddingBottom: "12px",
              borderBottom: "2px solid #e5e7eb",
            }}
          >
            Demande prospecte
          </h2>

          <div className="action-buttons">
            <button className="btn-primary" onClick={handleCreateDemandeProspecte}>
              Ajouter une demande prospecte
            </button>
          </div>

          <div className="table-container" style={{ marginTop: "24px" }}>
            <h3>Liste des demandes prospectes</h3>
            {demandes.filter((d) => (d.typeProjet || "").toLowerCase() === "prospecte")
              .length === 0 ? (
              <p style={{ color: "#6b7280", marginTop: "16px" }}>
                Aucune demande prospecte pour le moment.
              </p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date de réception</th>
                    <th>Nom projet</th>
                    <th>Sociétés demandeurs</th>
                    <th>Interlocuteur</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {demandes
                    .filter((d) => (d.typeProjet || "").toLowerCase() === "prospecte")
                    .map((demande) => (
                      <tr key={demande.id}>
                        <td>{demande.dateReception || "-"}</td>
                        <td>{demande.nomProjet || "-"}</td>
                        <td>{getSocietesNames(demande.societesDemandeurs)}</td>
                        <td>{demande.interlocuteur || "-"}</td>
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

        {/* Rubrique 3: Demande d'évolution */}
        <div className="section-rubrique">
          <h2
            style={{
              marginBottom: "24px",
              paddingBottom: "12px",
              borderBottom: "2px solid #e5e7eb",
            }}
          >
            Demande d'évolution
          </h2>

          <div className="action-buttons">
            <button className="btn-primary" onClick={handleCreateDemandeEvolution}>
              Ajouter une demande d'évolution
            </button>
          </div>

          <div className="table-container" style={{ marginTop: "24px" }}>
            <h3>Liste des demandes d'évolution</h3>
            {demandes.filter((d) => (d.typeProjet || "").toLowerCase() === "evolution")
              .length === 0 ? (
              <p style={{ color: "#6b7280", marginTop: "16px" }}>
                Aucune demande d'évolution pour le moment.
              </p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date de réception</th>
                    <th>Nom projet</th>
                    <th>Sociétés demandeurs</th>
                    <th>Interlocuteur</th>
                    <th>Périmètre</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {demandes
                    .filter((d) => (d.typeProjet || "").toLowerCase() === "evolution")
                    .map((demande) => (
                      <tr key={demande.id}>
                        <td>{demande.dateReception || "-"}</td>
                        <td>{demande.nomProjet || "-"}</td>
                        <td>{getSocietesNames(demande.societesDemandeurs)}</td>
                        <td>{demande.interlocuteur || "-"}</td>
                        <td>{demande.perimetre || "-"}</td>
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
