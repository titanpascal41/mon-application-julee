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
  // États pour la sélection de type de demande
  const [selectedDemandeType, setSelectedDemandeType] = useState(null);
  const [showSelectionCards, setShowSelectionCards] = useState(true);
  const [showNouvellesDemandesList, setShowNouvellesDemandesList] =
    useState(false);
  const [showDemandesProspectesList, setShowDemandesProspectesList] =
    useState(false);
  const [showDemandesEvolutionList, setShowDemandesEvolutionList] =
    useState(false);

  // États pour la gestion des demandes
  const [demandes, setDemandes] = useState([]);
  const [societes, setSocietes] = useState([]);
  const [collaborateurs, setCollaborateurs] = useState([]);
  const [showDemandeForm, setShowDemandeForm] = useState(false);
  const [demandeFormType, setDemandeFormType] = useState("nouvelle"); // "nouvelle", "prospecte", "evolution"
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

  // Auto-sélectionner une société par défaut quand le formulaire est ouvert.
  // Sans ça, le <select> peut afficher la 1ère option (ex: TechCorp) sans que le state soit rempli,
  // ce qui déclenche une erreur de validation "Veuillez sélectionner au moins une société demandeur."
  useEffect(() => {
    if (!showDemandeForm) return;
    if (!societes || societes.length === 0) return;
    if (demandeFormData?.societesDemandeurs?.length > 0) return;

    setDemandeFormData((prev) => ({
      ...prev,
      societesDemandeurs: [societes[0].id.toString()],
    }));
  }, [
    showDemandeForm,
    societes,
    demandeFormData?.societesDemandeurs?.length,
    setDemandeFormData,
  ]);

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

    // Effacer le message d'erreur immédiatement lors de la modification
    if (demandeMessage.text) {
      setDemandeMessage({ type: "", text: "" });
    }

    // Si c'est le champ interlocuteur et qu'une valeur est sélectionnée, effacer le message d'erreur
    if (name === "interlocuteur" && value && value.trim()) {
      setDemandeMessage({ type: "", text: "" });
    }
  };

  const handleCreateDemande = () => {
    setEditingDemande(null);
    setDemandeFormType("nouvelle");
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
    setShowSelectionCards(false);
    setDemandeMessage({ type: "", text: "" });
  };

  // Création d'une demande prospecte avec formulaire dédié
  const handleCreateDemandeProspecte = () => {
    setEditingDemande(null);
    setDemandeFormType("prospecte");
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
    setShowSelectionCards(false);
    setDemandeMessage({ type: "", text: "" });
  };

  // Création d'une demande d'évolution avec formulaire dédié
  const handleCreateDemandeEvolution = () => {
    setEditingDemande(null);
    setDemandeFormType("evolution");
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
    setShowSelectionCards(false);
    setDemandeMessage({ type: "", text: "" });
  };

  const handleEditDemande = (demande) => {
    setEditingDemande(demande);
    // Déterminer le type de formulaire selon le type de projet
    const typeNormalized = normalizeTypeProjet(demande.typeProjet);
    if (typeNormalized === "prospecte") {
      setDemandeFormType("prospecte");
    } else if (typeNormalized === "evolution") {
      setDemandeFormType("evolution");
    } else {
      setDemandeFormType("nouvelle");
    }
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
    setShowSelectionCards(false);
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
    // Validation commune
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

    const interlocuteurValue = demandeFormData.interlocuteur;
    if (
      !interlocuteurValue ||
      (typeof interlocuteurValue === "string" && !interlocuteurValue.trim())
    ) {
      setDemandeMessage({
        type: "error",
        text: "Le collaborateur est obligatoire.",
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

    // Validation selon le type de formulaire
    if (demandeFormType === "prospecte") {
      // Pour prospecte : pas besoin de descriptionPerimetre ni perimetre
      return true;
    } else if (demandeFormType === "evolution") {
      // Pour evolution : besoin de perimetre mais pas de descriptionPerimetre
      if (!demandeFormData.perimetre) {
        setDemandeMessage({
          type: "error",
          text: "Le périmètre est obligatoire.",
        });
        return false;
      }
      return true;
    } else {
      // Pour nouvelle demande : tous les champs sont requis
      if (!demandeFormData.typeProjet.trim()) {
        setDemandeMessage({
          type: "error",
          text: "Le type de projet est obligatoire.",
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
    }
  };

  const handleDemandeSubmit = async (e) => {
    e.preventDefault();
    setDemandeMessage({ type: "", text: "" });

    // S'assurer que typeProjet est bien défini pour prospecte et evolution
    if (demandeFormType === "prospecte" && !demandeFormData.typeProjet) {
      setDemandeFormData((prev) => ({ ...prev, typeProjet: "Prospecte" }));
    } else if (demandeFormType === "evolution" && !demandeFormData.typeProjet) {
      setDemandeFormData((prev) => ({ ...prev, typeProjet: "Evolution" }));
    }

    // Validation personnalisée
    if (!validateDemandeForm()) {
      return;
    }

    // Recharger les sociétés au cas où une nouvelle a été créée
    chargerLesSocietes();

    // S'assurer que typeProjet est inclus dans les données à sauvegarder
    const dataToSave = {
      ...demandeFormData,
      typeProjet:
        demandeFormType === "prospecte"
          ? "Prospecte"
          : demandeFormType === "evolution"
          ? "Evolution"
          : demandeFormData.typeProjet,
    };

    let resultat;
    if (editingDemande) {
      resultat = mettreAJourDemande(editingDemande.id, dataToSave);
    } else {
      resultat = creerDemande(dataToSave);
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
      setDemandeFormType("nouvelle");
      setEditingDemande(null);
      setShowSelectionCards(true);
      setSelectedDemandeType(null);
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
    // Revenir à la sélection si on annule une nouvelle création
    if (!editingDemande) {
      setShowSelectionCards(true);
      setSelectedDemandeType(null);
    }
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
    //
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

  // Fonction helper pour normaliser le type de projet pour la comparaison
  const normalizeTypeProjet = (typeProjet) => {
    if (!typeProjet) return "";
    return String(typeProjet).trim().toLowerCase();
  };

  // Gérer la sélection d'une carte
  const handleCardSelect = (type) => {
    setSelectedDemandeType(type === selectedDemandeType ? null : type);
  };

  // Gérer le clic sur "Commencer"
  const handleStartDemande = () => {
    if (!selectedDemandeType) return;

    setShowSelectionCards(false);
    setEditingDemande(null);
    // Important : piloter le formulaire (champs + validation) selon le type choisi
    setDemandeFormType(selectedDemandeType);

    let typeProjetValue = "";
    if (selectedDemandeType === "nouvelle") {
      typeProjetValue = "";
    } else if (selectedDemandeType === "prospecte") {
      typeProjetValue = "Prospecte";
    } else if (selectedDemandeType === "evolution") {
      typeProjetValue = "Evolution";
    }

    setDemandeFormData({
      dateReception: "",
      societesDemandeurs: [],
      interlocuteur: "",
      typeProjet: typeProjetValue,
      nomProjet: "",
      descriptionPerimetre: "",
      perimetre: "",
    });
    setShowDemandeForm(true);
    setDemandeMessage({ type: "", text: "" });
  };

  // Types de demandes avec leurs configurations
  const demandeTypes = [
    {
      id: "nouvelle",
      label: "Nouvelle demande",
      icon: "fa-solid fa-plus-circle",
      iconColor: "#4A90E2",
      borderColor: "#4A90E2",
      buttonColor: "#4A90E2",
      description: "Créer une nouvelle demande de développement",
    },
    {
      id: "prospecte",
      label: "Demande prospecte",
      icon: "fa-solid fa-search",
      iconColor: "#FF6B35",
      borderColor: "#FF6B35",
      buttonColor: "#FF6B35",
      description: "Demande pour un projet prospecté",
    },
    {
      id: "evolution",
      label: "Demande d'évolution",
      icon: "fa-solid fa-arrow-up",
      iconColor: "#10B981",
      borderColor: "#10B981",
      buttonColor: "#10B981",
      description: "Demande d'amélioration ou d'évolution",
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gestion des Demandes</h1>
        <p>Gérez les demandes de développement ou d'évolution</p>
      </div>

      <div className="page-content">
        {/* Interface de sélection par cartes */}
        {showSelectionCards && (
          <div className="demandes-selection-container">
            <div className="demandes-cards-grid">
              {demandeTypes.map((type) => {
                const isSelected = selectedDemandeType === type.id;
                return (
                  <div
                    key={type.id}
                    className={`demande-selection-card demande-card-${
                      type.id
                    } ${isSelected ? "selected" : ""}`}
                    onClick={() => handleCardSelect(type.id)}
                    style={{
                      borderColor: isSelected ? type.borderColor : "#e5e7eb",
                    }}
                  >
                    <div
                      className="card-checkbox"
                      style={{
                        background: isSelected ? type.borderColor : "white",
                        borderColor: isSelected ? type.borderColor : "#9ca3af",
                      }}
                    ></div>
                    <div className="card-icon">
                      <i
                        className={type.icon}
                        style={{ color: type.iconColor }}
                      ></i>
                    </div>
                    <p
                      className="card-text"
                      style={{
                        color: isSelected ? type.borderColor : "#1a1a1a",
                      }}
                    >
                      {type.label}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="demande-selection-actions">
              <button
                className="demande-selection-button"
                onClick={handleStartDemande}
                disabled={!selectedDemandeType}
                style={{
                  background: selectedDemandeType
                    ? `linear-gradient(135deg, ${
                        demandeTypes.find((t) => t.id === selectedDemandeType)
                          ?.buttonColor || "#4A90E2"
                      } 0%, ${
                        demandeTypes.find((t) => t.id === selectedDemandeType)
                          ?.buttonColor || "#4A90E2"
                      }dd 100%)`
                    : "#9ca3af",
                  boxShadow: selectedDemandeType
                    ? `0 4px 12px rgba(${
                        selectedDemandeType === "nouvelle"
                          ? "74, 144, 226"
                          : selectedDemandeType === "prospecte"
                          ? "255, 107, 53"
                          : "16, 185, 129"
                      }, 0.3)`
                    : "none",
                }}
              >
                Commencer
              </button>
            </div>
          </div>
        )}

        {/* Bouton "Retour à la sélection" supprimé à la demande */}
        <div
          className="section-rubrique"
          style={{ marginBottom: showNouvellesDemandesList ? "32px" : "8px" }}
        >
          <button
            type="button"
            onClick={() => setShowNouvellesDemandesList((v) => !v)}
            style={{
              width: "100%",
              textAlign: "left",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
            aria-expanded={showNouvellesDemandesList}
          >
            <h2
              style={{
                marginBottom: "24px",
                paddingBottom: "12px",
                borderBottom: "2px solid #e5e7eb",
                color: "#4A90E2",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <span>Liste des nouvelles demandes</span>
              <span style={{ color: "#6b7280", fontSize: "14px" }}>
                {showNouvellesDemandesList ? "Masquer" : "Afficher"}
              </span>
            </h2>
          </button>

          {/* Bouton "Créer une demande" supprimé à la demande */}

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
                      ? `Modifier la demande ${
                          demandeFormType === "prospecte"
                            ? "prospecte"
                            : demandeFormType === "evolution"
                            ? "d'évolution"
                            : ""
                        }`
                      : demandeFormType === "prospecte"
                      ? "Créer une demande prospecte"
                      : demandeFormType === "evolution"
                      ? "Créer une demande d'évolution"
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
                  {/* Champ caché pour typeProjet pour prospecte et evolution */}
                  {(demandeFormType === "prospecte" ||
                    demandeFormType === "evolution") && (
                    <input
                      type="hidden"
                      name="typeProjet"
                      value={demandeFormData.typeProjet}
                    />
                  )}
                  {/* Champs communs à tous les formulaires */}
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
                          Aucune société disponible (ajoutez-en dans
                          Paramétrage)
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
                      Collaborateur <span className="required">*</span>
                    </label>
                    <select
                      id="demandeInterlocuteur"
                      name="interlocuteur"
                      value={demandeFormData.interlocuteur || ""}
                      onChange={handleDemandeInputChange}
                    >
                      <option value="" disabled>
                        {collaborateurs.length === 0
                          ? "Aucun collaborateur trouvé (ajoutez-en dans Paramétrage)"
                          : "Sélectionnez un collaborateur"}
                      </option>
                      {collaborateurs.map((collab) => (
                        <option key={collab.id} value={collab.nom}>
                          {collab.nom} {collab.email ? `- ${collab.email}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Champs spécifiques selon le type de formulaire */}
                  {demandeFormType === "nouvelle" && (
                    <>
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
                        <label htmlFor="demandeDescriptionPerimetre">
                          Description du périmètre{" "}
                          <span className="required">*</span>
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
                    </>
                  )}

                  {demandeFormType === "evolution" && (
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
                  )}

                  {/* Pour prospecte : pas de champs supplémentaires */}

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

          {showNouvellesDemandesList && (
            <div className="table-container" style={{ marginTop: "24px" }}>
              <h3>Liste des nouvelles demandes</h3>
              {(() => {
                // Filtrer pour exclure les demandes prospectes et d'évolution
                const demandesNouvelles = demandes.filter((d) => {
                  const typeNormalized = normalizeTypeProjet(d.typeProjet);
                  return (
                    typeNormalized !== "prospecte" &&
                    typeNormalized !== "evolution"
                  );
                });

                return demandesNouvelles.length === 0 ? (
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
                        <th>Collaborateur</th>
                        <th>Type projet</th>
                        <th>Nom projet</th>
                        <th>Périmètre</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {demandesNouvelles.map((demande) => (
                        <tr key={demande.id}>
                          <td>{demande.dateEnregistrement}</td>
                          <td>{demande.dateReception}</td>
                          <td>
                            {getSocietesNames(demande.societesDemandeurs)}
                          </td>
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
                );
              })()}
            </div>
          )}
        </div>

        {/* Rubrique 2: Demande prospecte */}
        <div className="section-rubrique">
          <button
            type="button"
            onClick={() => setShowDemandesProspectesList((v) => !v)}
            style={{
              width: "100%",
              textAlign: "left",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
            aria-expanded={showDemandesProspectesList}
          >
            <h2
              style={{
                marginBottom: "24px",
                paddingBottom: "12px",
                borderBottom: "2px solid #e5e7eb",
                color: "#4A90E2",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <span>Liste des demandes prospectes</span>
              <span style={{ color: "#6b7280", fontSize: "14px" }}>
                {showDemandesProspectesList ? "Masquer" : "Afficher"}
              </span>
            </h2>
          </button>

          {/* Bouton "Créer une demande prospecte" supprimé à la demande */}

          {showDemandesProspectesList && (
            <div className="table-container" style={{ marginTop: "24px" }}>
              <h3>Liste des demandes prospectes</h3>
              {(() => {
                const demandesProspectes = demandes.filter(
                  (d) => normalizeTypeProjet(d.typeProjet) === "prospecte"
                );
                return demandesProspectes.length === 0 ? (
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
                        <th>Collaborateur</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {demandesProspectes.map((demande) => (
                        <tr key={demande.id}>
                          <td>{demande.dateReception || "-"}</td>
                          <td>{demande.nomProjet || "-"}</td>
                          <td>
                            {getSocietesNames(demande.societesDemandeurs)}
                          </td>
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
                );
              })()}
            </div>
          )}
        </div>

        {/* Rubrique 3: Demande d'évolution */}
        <div className="section-rubrique">
          <button
            type="button"
            onClick={() => setShowDemandesEvolutionList((v) => !v)}
            style={{
              width: "100%",
              textAlign: "left",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
            aria-expanded={showDemandesEvolutionList}
          >
            <h2
              style={{
                marginBottom: "24px",
                paddingBottom: "12px",
                borderBottom: "2px solid #e5e7eb",
                color: "#4A90E2",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <span>Liste des demandes d'évolution</span>
              <span style={{ color: "#6b7280", fontSize: "14px" }}>
                {showDemandesEvolutionList ? "Masquer" : "Afficher"}
              </span>
            </h2>
          </button>

          {/* Bouton "Créer une demande d'évolution" supprimé à la demande */}

          {showDemandesEvolutionList && (
            <div className="table-container" style={{ marginTop: "24px" }}>
              <h3>Liste des demandes d'évolution</h3>
              {(() => {
                const demandesEvolution = demandes.filter(
                  (d) => normalizeTypeProjet(d.typeProjet) === "evolution"
                );
                return demandesEvolution.length === 0 ? (
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
                        <th>Collaborateur</th>
                        <th>Périmètre</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {demandesEvolution.map((demande) => (
                        <tr key={demande.id}>
                          <td>{demande.dateReception || "-"}</td>
                          <td>{demande.nomProjet || "-"}</td>
                          <td>
                            {getSocietesNames(demande.societesDemandeurs)}
                          </td>
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
                );
              })()}
            </div>
          )}
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
