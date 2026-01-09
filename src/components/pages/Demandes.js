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

const NOUVELLE_DEMANDE_DRAFT_KEY = "nouvelleDemandeDraft";
const NOUVELLE_DEMANDE_DRAFT_ID_KEY = "nouvelleDemandeDraftId";

const getNouvelleDemandeInitialState = () => ({
  // Étape 1: Enregistrement de la demande
  dateEnregistrement: new Date().toISOString().split("T")[0],
  demandeur: "",
  interlocuteurClient: "",
  typeProjet: "",
  nomProjet: "",
  descriptionProjet: "",
  descriptionPerimetre: "",
  statutDemande: "",
  dateReception: "",
  lienIngridCDC: "",
  // Étape 2: Clarification de la demande
  dateTransmissionBacklog: "",
  dateConfirmationValidation: "",
  // Étape 3: Planification du périmètre
  dateDemandePlanificationDevTif: "",
  dateRetourEquipes: "",
  dateCommunicationPlanningClient: "",
  nombreSprint: "",
  chargePrevisionnelleParSprint: [],
  dateLivraisonPrevisionnelleTIFParSprint: [],
  dateLivraisonPrevisionnelleClientParSprint: [],
  roadmap: "",
  dateEffectiveLivraisonTIF: "",
  motifsRetardTIF: "",
  dateEffectiveLivraisonClient: "",
  motifsRetardClient: "",
  // Étape 4: Codage de l'application
  statutCodage: "en attente",
  // Étape 5: Présentation des documents
  lienIngridKickoff: "",
  lienIngridPointsControleTIF: "",
  lienIngridSignoff: "",
  // Étape 6: Réalisation des TIF
  statutTIF: "en attente",
  // Étape 7: Livraison effective au client
  statutLivraisonClient: "en attente",
});

const buildDraftPayload = ({ formData, step, societes }) => {
  const defaultSociete =
    societes && societes.length > 0 ? [societes[0].id.toString()] : [];
  const societeLabel =
    defaultSociete.length > 0
      ? societes.find((s) => s.id.toString() === defaultSociete[0])?.nom ||
        "Brouillon"
      : "Brouillon";
  return {
    dateReception:
      formData.dateReception ||
      formData.dateEnregistrement ||
      new Date().toISOString().split("T")[0],
    societesDemandeurs:
      formData.societesDemandeurs?.length > 0
        ? formData.societesDemandeurs
        : defaultSociete,
    interlocuteur:
      formData.interlocuteurClient ||
      formData.demandeur ||
      formData.interlocuteur ||
      societeLabel,
    typeProjet: formData.typeProjet || "Brouillon",
    nomProjet: formData.nomProjet || "Brouillon en cours",
    descriptionPerimetre: formData.descriptionPerimetre || "À renseigner",
    perimetre: formData.perimetre || "ENREG",
    draftStep: step,
    isDraft: true,
    // conserver le reste du formulaire saisi
    ...formData,
  };
};

const Demandes = ({ activeSubPage: activeSubPageProp }) => {
  // États pour la sélection de type de demande
  const [selectedDemandeType, setSelectedDemandeType] = useState(null);
  const [showSelectionCards, setShowSelectionCards] = useState(true);
  const [showDemandesList, setShowDemandesList] = useState(false);

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
    // Nouveaux champs pour demande d'évolution
    dateDemandeMiseAJourDATFL: "",
    dateReponseMiseAJourDATFL: "",
    charge: "",
    planningDateDebut: "",
    planningDateFin: "",
    dateDemandeDevolution: "",
    dateReponseDevolution: "",
    slt: "",
    aleasNormeParJour: "",
  });
  const [evolutionFormStep, setEvolutionFormStep] = useState(1); // Étape du formulaire d'évolution (1, 2, ou 3)

  // États pour le formulaire multi-étapes "Nouvelle demande"
  const [showNouvelleDemandeForm, setShowNouvelleDemandeForm] = useState(false);
  const [nouvelleDemandeStep, setNouvelleDemandeStep] = useState(1); // 1 à 7
  const [nouvelleDemandeFormData, setNouvelleDemandeFormData] = useState(() =>
    getNouvelleDemandeInitialState()
  );

  // Fonction pour formater une date en français (ex: "lundi 15 janvier 2025")
  const formatDateEnFrancais = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString + "T00:00:00");
    const jours = [
      "dimanche",
      "lundi",
      "mardi",
      "mercredi",
      "jeudi",
      "vendredi",
      "samedi",
    ];
    const mois = [
      "janvier",
      "février",
      "mars",
      "avril",
      "mai",
      "juin",
      "juillet",
      "août",
      "septembre",
      "octobre",
      "novembre",
      "décembre",
    ];
    const jourSemaine = jours[date.getDay()];
    const jour = date.getDate();
    const moisNom = mois[date.getMonth()];
    const annee = date.getFullYear();
    return `${jourSemaine} ${jour} ${moisNom} ${annee}`;
  };

  // Fonction pour valider et passer à l'étape suivante du formulaire d'évolution
  const handleEvolutionNextStep = () => {
    if (evolutionFormStep === 1) {
      // Valider l'étape 1
      if (!demandeFormData.dateDemandeMiseAJourDATFL) {
        setDemandeMessage({
          type: "error",
          text: "La date de demande de la mise à jour du DATFL est obligatoire.",
        });
        return;
      }
      if (!demandeFormData.dateReponseMiseAJourDATFL) {
        setDemandeMessage({
          type: "error",
          text: "La date de réponse de la mise à jour du DATFL est obligatoire.",
        });
        return;
      }
      setEvolutionFormStep(2);
      setDemandeMessage({ type: "", text: "" });
    } else if (evolutionFormStep === 2) {
      // Valider l'étape 2
      if (!demandeFormData.charge || demandeFormData.charge.trim() === "") {
        setDemandeMessage({
          type: "error",
          text: "La charge (nombre de jours) est obligatoire.",
        });
        return;
      }
      if (!demandeFormData.planningDateDebut) {
        setDemandeMessage({
          type: "error",
          text: "La date de début du planning est obligatoire.",
        });
        return;
      }
      if (!demandeFormData.planningDateFin) {
        setDemandeMessage({
          type: "error",
          text: "La date de fin du planning est obligatoire.",
        });
        return;
      }
      setEvolutionFormStep(3);
      setDemandeMessage({ type: "", text: "" });
    }
  };

  // Fonction pour revenir à l'étape précédente
  const handleEvolutionPreviousStep = () => {
    if (evolutionFormStep > 1) {
      setEvolutionFormStep(evolutionFormStep - 1);
      setDemandeMessage({ type: "", text: "" });
    }
  };

  // Fonctions de navigation pour le formulaire "Nouvelle demande" multi-étapes
  const handleNouvelleDemandeNext = () => {
    if (nouvelleDemandeStep < 7) {
      setNouvelleDemandeStep(nouvelleDemandeStep + 1);
      setDemandeMessage({ type: "", text: "" });
    }
  };

  const handleNouvelleDemandePrevious = () => {
    if (nouvelleDemandeStep > 1) {
      setNouvelleDemandeStep(nouvelleDemandeStep - 1);
      setDemandeMessage({ type: "", text: "" });
    }
  };

  const handleNouvelleDemandeCancel = () => {
    setShowNouvelleDemandeForm(false);
    setShowSelectionCards(true);
    setNouvelleDemandeStep(1);
    setDemandeMessage({ type: "", text: "" });
  };

  const handleNouvelleDemandeSubmit = async (e) => {
    e.preventDefault();
    setDemandeMessage({ type: "", text: "" });

    // Validation de l'étape actuelle avant de terminer
    if (nouvelleDemandeStep === 1) {
      if (
        !nouvelleDemandeFormData.demandeur ||
        !nouvelleDemandeFormData.nomProjet
      ) {
        setDemandeMessage({
          type: "error",
          text: "Veuillez remplir tous les champs obligatoires de l'étape 1.",
        });
        return;
      }
    }

    // Créer la demande avec toutes les données
    const dataToSave = {
      dateReception:
        nouvelleDemandeFormData.dateReception ||
        nouvelleDemandeFormData.dateEnregistrement,
      societesDemandeurs:
        societes.length > 0 ? [societes[0].id.toString()] : [],
      interlocuteur:
        nouvelleDemandeFormData.interlocuteurClient ||
        nouvelleDemandeFormData.demandeur,
      typeProjet: nouvelleDemandeFormData.typeProjet,
      nomProjet: nouvelleDemandeFormData.nomProjet,
      descriptionPerimetre: nouvelleDemandeFormData.descriptionPerimetre,
      perimetre: "",
      // Ajouter tous les nouveaux champs
      ...nouvelleDemandeFormData,
    };

    const resultat = creerDemande(dataToSave);

    if (resultat.succes) {
      localStorage.removeItem(NOUVELLE_DEMANDE_DRAFT_KEY);
      localStorage.removeItem(NOUVELLE_DEMANDE_DRAFT_ID_KEY);
      setDraftStepInfo(null);
      setDemandeMessage({
        type: "success",
        text: "Demande créée avec succès !",
      });
      chargerLesDemandes();
      setShowNouvelleDemandeForm(false);
      setShowSelectionCards(true);
      setNouvelleDemandeStep(1);
      setTimeout(() => setDemandeMessage({ type: "", text: "" }), 3000);
    } else {
      setDemandeMessage({ type: "error", text: resultat.message });
    }
  };

  const handleNouvelleDemandeInputChange = (e) => {
    const { name, value } = e.target;
    setNouvelleDemandeFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (demandeMessage.text) {
      setDemandeMessage({ type: "", text: "" });
    }
  };
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
  const [draftStepInfo, setDraftStepInfo] = useState(null);
  const [showDeleteDraftModal, setShowDeleteDraftModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDemandeDetail, setSelectedDemandeDetail] = useState(null);

  const sauvegarderNouvelleDemandeBrouillon = (stepOverride) => {
    const stepToStore = stepOverride || nouvelleDemandeStep;
    const payload = buildDraftPayload({
      formData: nouvelleDemandeFormData,
      step: stepToStore,
      societes,
    });
    const draftStepLabel = getStepLabel(stepToStore);

    try {
      localStorage.setItem(
        NOUVELLE_DEMANDE_DRAFT_KEY,
        JSON.stringify({
          step: stepToStore,
          data: payload,
          savedAt: new Date().toISOString(),
        })
      );

      const draftId = localStorage.getItem(NOUVELLE_DEMANDE_DRAFT_ID_KEY);
      if (draftId) {
        mettreAJourDemande(parseInt(draftId, 10), {
          ...payload,
          isDraft: true,
          draftStepLabel,
        });
      } else {
        const resultatDraft = creerDemande({
          ...payload,
          isDraft: true,
          draftStepLabel,
        });
        if (resultatDraft?.succes && resultatDraft.demande?.id) {
          localStorage.setItem(
            NOUVELLE_DEMANDE_DRAFT_ID_KEY,
            resultatDraft.demande.id.toString()
          );
        }
      }

      chargerLesDemandes();
      setDraftStepInfo(stepToStore);
      setDemandeMessage({
        type: "success",
        text: "Brouillon enregistré dans la liste des demandes.",
      });
    } catch (error) {
      setDemandeMessage({
        type: "error",
        text: "Impossible d'enregistrer le brouillon. Vérifiez l'espace disponible.",
      });
    }
  };

  const chargerBrouillonNouvelleDemande = () => {
    const brouillonBrut = localStorage.getItem(NOUVELLE_DEMANDE_DRAFT_KEY);
    if (!brouillonBrut) return false;
    try {
      const brouillon = JSON.parse(brouillonBrut);
      setNouvelleDemandeFormData({
        ...getNouvelleDemandeInitialState(),
        ...(brouillon.data || {}),
      });
      setNouvelleDemandeStep(brouillon.step || 1);
      setDraftStepInfo(brouillon.step || 1);
      return true;
    } catch (error) {
      localStorage.removeItem(NOUVELLE_DEMANDE_DRAFT_KEY);
      localStorage.removeItem(NOUVELLE_DEMANDE_DRAFT_ID_KEY);
      setDraftStepInfo(null);
      return false;
    }
  };

  const supprimerBrouillonNouvelleDemande = () => {
    localStorage.removeItem(NOUVELLE_DEMANDE_DRAFT_KEY);
    localStorage.removeItem(NOUVELLE_DEMANDE_DRAFT_ID_KEY);
    setNouvelleDemandeFormData(getNouvelleDemandeInitialState());
    setNouvelleDemandeStep(1);
    setDraftStepInfo(null);
  };

  const confirmerSuppressionBrouillon = () => {
    setShowDeleteDraftModal(true);
  };

  const confirmDeleteDraft = () => {
    supprimerBrouillonNouvelleDemande();
    setShowDeleteDraftModal(false);
    // Supprimer aussi le brouillon de la liste des demandes
    const draftId = localStorage.getItem(NOUVELLE_DEMANDE_DRAFT_ID_KEY);
    if (draftId) {
      supprimerDemande(parseInt(draftId, 10));
      chargerLesDemandes();
    }
  };

  const cancelDeleteDraft = () => {
    setShowDeleteDraftModal(false);
  };

  const handleShowDetail = (demande) => {
    setSelectedDemandeDetail(demande);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedDemandeDetail(null);
  };

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
    // Récupérer un éventuel brouillon existant pour afficher l'étape dans la liste
    const brouillonBrut = localStorage.getItem(NOUVELLE_DEMANDE_DRAFT_KEY);
    if (brouillonBrut) {
      try {
        const brouillon = JSON.parse(brouillonBrut);
        setDraftStepInfo(brouillon.step || 1);
      } catch (error) {
        localStorage.removeItem(NOUVELLE_DEMANDE_DRAFT_KEY);
      }
    } else {
      setDraftStepInfo(null);
    }
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
    const brouillonCharge = chargerBrouillonNouvelleDemande();
    if (!brouillonCharge) {
      setNouvelleDemandeStep(1);
      setNouvelleDemandeFormData(getNouvelleDemandeInitialState());
      setDraftStepInfo(null);
      setDemandeMessage({ type: "", text: "" });
    }
    setShowNouvelleDemandeForm(true);
    setShowSelectionCards(false);
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
    setEvolutionFormStep(1); // Réinitialiser à l'étape 1
    setDemandeFormData({
      dateReception: "",
      societesDemandeurs:
        societes.length > 0 ? [societes[0].id.toString()] : [],
      interlocuteur: "",
      typeProjet: "Evolution",
      nomProjet: "",
      descriptionPerimetre: "",
      perimetre: "",
      // Nouveaux champs pour demande d'évolution
      dateDemandeMiseAJourDATFL: "",
      dateReponseMiseAJourDATFL: "",
      charge: "",
      planningDateDebut: "",
      planningDateFin: "",
      dateDemandeDevolution: "",
      dateReponseDevolution: "",
      slt: "",
      aleasNormeParJour: "",
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

  const mapLabelToStep = (label) => {
    if (!label) return null;
    const l = label.toLowerCase();
    if (l.includes("clarification")) return 2;
    if (l.includes("planification")) return 3;
    if (l.includes("codage")) return 4;
    if (l.includes("document")) return 5;
    if (l.includes("tif")) return 6;
    if (l.includes("livraison")) return 7;
    if (l.includes("enregistrement") || l.includes("enreg")) return 1;
    return null;
  };

  // Poursuivre un brouillon via le formulaire multi-étapes
  const handlePoursuivreDemande = (demande) => {
    const fallbackLabel = demande.draftStep
      ? getStepLabel(demande.draftStep)
      : null;
    const stepFromLabel = mapLabelToStep(
      demande.draftStepLabel || fallbackLabel
    );
    const stepNumeric = Number(demande.draftStep);
    const stepRaw =
      stepFromLabel || (Number.isFinite(stepNumeric) ? stepNumeric : 1);
    const step = Math.min(Math.max(stepRaw, 1), 7);
    setSelectedDemandeType("nouvelle");
    setShowSelectionCards(false);
    setShowNouvelleDemandeForm(true);
    setShowDemandeForm(false);
    setNouvelleDemandeStep(step);
    setDemandeMessage({ type: "", text: "" });

    setNouvelleDemandeFormData((prev) => ({
      ...getNouvelleDemandeInitialState(),
      ...prev,
      ...demande,
      dateEnregistrement:
        demande.dateEnregistrement ||
        prev.dateEnregistrement ||
        new Date().toISOString().split("T")[0],
      demandeur: demande.demandeur || prev.demandeur || "",
      interlocuteurClient:
        demande.interlocuteurClient || prev.interlocuteurClient || "",
      typeProjet: demande.typeProjet || prev.typeProjet || "",
      nomProjet: demande.nomProjet || prev.nomProjet || "",
      descriptionProjet:
        demande.descriptionProjet || prev.descriptionProjet || "",
      descriptionPerimetre:
        demande.descriptionPerimetre || prev.descriptionPerimetre || "",
      statutDemande: demande.statutDemande || prev.statutDemande || "",
      dateReception: demande.dateReception || prev.dateReception || "",
      lienIngridCDC: demande.lienIngridCDC || prev.lienIngridCDC || "",
    }));

    // Remonter sur le formulaire
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      // Pour evolution : valider tous les champs spécifiques
      if (!demandeFormData.dateDemandeMiseAJourDATFL) {
        setDemandeMessage({
          type: "error",
          text: "La date de demande de la mise à jour du DATFL est obligatoire.",
        });
        return false;
      }
      if (!demandeFormData.dateReponseMiseAJourDATFL) {
        setDemandeMessage({
          type: "error",
          text: "La date de réponse de la mise à jour du DATFL est obligatoire.",
        });
        return false;
      }
      if (!demandeFormData.charge || demandeFormData.charge.trim() === "") {
        setDemandeMessage({
          type: "error",
          text: "La charge (nombre de jours) est obligatoire.",
        });
        return false;
      }
      if (!demandeFormData.planningDateDebut) {
        setDemandeMessage({
          type: "error",
          text: "La date de début du planning est obligatoire.",
        });
        return false;
      }
      if (!demandeFormData.planningDateFin) {
        setDemandeMessage({
          type: "error",
          text: "La date de fin du planning est obligatoire.",
        });
        return false;
      }
      if (!demandeFormData.dateDemandeDevolution) {
        setDemandeMessage({
          type: "error",
          text: "La date de demande devolution est obligatoire.",
        });
        return false;
      }
      if (!demandeFormData.dateReponseDevolution) {
        setDemandeMessage({
          type: "error",
          text: "La date de réponse devolution est obligatoire.",
        });
        return false;
      }
      if (!demandeFormData.slt || demandeFormData.slt.trim() === "") {
        setDemandeMessage({
          type: "error",
          text: "Le renseignement des SLT est obligatoire.",
        });
        return false;
      }
      if (
        !demandeFormData.aleasNormeParJour ||
        demandeFormData.aleasNormeParJour.trim() === ""
      ) {
        setDemandeMessage({
          type: "error",
          text: "Le renseignement d'un aléas en norme par jour est obligatoire.",
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
        // Réinitialiser les champs d'évolution
        dateDemandeMiseAJourDATFL: "",
        dateReponseMiseAJourDATFL: "",
        charge: "",
        planningDateDebut: "",
        planningDateFin: "",
        dateDemandeDevolution: "",
        dateReponseDevolution: "",
        slt: "",
        aleasNormeParJour: "",
      });
      setDemandeFormType("nouvelle");
      setEvolutionFormStep(1);
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
      // Réinitialiser les champs d'évolution
      dateDemandeMiseAJourDATFL: "",
      dateReponseMiseAJourDATFL: "",
      charge: "",
      planningDateDebut: "",
      planningDateFin: "",
      dateDemandeDevolution: "",
      dateReponseDevolution: "",
      slt: "",
      aleasNormeParJour: "",
    });
    setEvolutionFormStep(1);
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

  const getTypeDemandeLabel = (typeProjet) => {
    const t = normalizeTypeProjet(typeProjet);
    if (t === "prospecte") return "Demande prospecte";
    if (t === "evolution") return "Demande d'évolution";
    return "Nouvelle demande";
  };

  const getStepLabel = (step) => {
    const map = {
      1: "Étape Enregistrement",
      2: "Étape Clarification",
      3: "Étape Planification",
      4: "Étape Codage",
      5: "Étape Documents",
      6: "Étape TIF",
      7: "Étape Livraison",
    };
    return map[step] || `Étape ${step || ""}`.trim();
  };

  const getTypeDemandeStyle = (typeProjet) => {
    const t = normalizeTypeProjet(typeProjet);
    if (t === "prospecte") {
      return { backgroundColor: "#ff6b35", color: "#ffffff" };
    }
    if (t === "evolution") {
      return { backgroundColor: "#10b981", color: "#ffffff" };
    }
    return { backgroundColor: "#4a90e2", color: "#ffffff" };
  };

  // Gérer la sélection d'une carte
  const handleCardSelect = (type) => {
    setSelectedDemandeType(type === selectedDemandeType ? null : type);
  };

  // Gérer le clic sur "Commencer"
  const handleStartDemande = () => {
    if (!selectedDemandeType) return;

    // Si c'est "nouvelle demande", utiliser le formulaire multi-étapes
    if (selectedDemandeType === "nouvelle") {
      handleCreateDemande();
      return;
    }

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

        {/* Formulaire multi-étapes "Nouvelle demande" */}
        {showNouvelleDemandeForm && (
          <div
            className="nouvelle-demande-form-container"
            style={{
              maxWidth: "1200px",
              margin: "0 auto 32px auto",
              padding: "32px",
              backgroundColor: "#f8fafc",
              borderRadius: "16px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* Indicateur de progression des étapes */}
            <div
              className="steps-indicator"
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "40px",
                padding: "0 20px",
                position: "relative",
              }}
            >
              {[
                { num: 1, label: "Enregistrement" },
                { num: 2, label: "Clarification" },
                { num: 3, label: "Planification" },
                { num: 4, label: "Codage" },
                { num: 5, label: "Documents" },
                { num: 6, label: "TIF" },
                { num: 7, label: "Livraison" },
              ].map((step, index) => (
                <div
                  key={step.num}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      backgroundColor:
                        nouvelleDemandeStep >= step.num ? "#4A90E2" : "#e5e7eb",
                      color:
                        nouvelleDemandeStep >= step.num ? "white" : "#6b7280",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      marginBottom: "8px",
                      transition: "all 0.3s ease",
                      border:
                        nouvelleDemandeStep === step.num
                          ? "3px solid #357ABD"
                          : "none",
                      boxShadow:
                        nouvelleDemandeStep === step.num
                          ? "0 0 0 4px rgba(74, 144, 226, 0.2)"
                          : "none",
                    }}
                  >
                    {step.num}
                  </div>
                  <span
                    style={{
                      fontSize: "13px",
                      color:
                        nouvelleDemandeStep >= step.num ? "#4A90E2" : "#6b7280",
                      fontWeight:
                        nouvelleDemandeStep >= step.num ? "600" : "400",
                      textAlign: "center",
                    }}
                  >
                    {step.label}
                  </span>
                  {index < 6 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "24px",
                        left: "calc(50% + 24px)",
                        width: "calc(100% - 96px)",
                        height: "3px",
                        backgroundColor:
                          nouvelleDemandeStep > step.num
                            ? "#4A90E2"
                            : "#e5e7eb",
                        zIndex: 0,
                        transition: "all 0.3s ease",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Formulaire selon l'étape */}
            <form onSubmit={handleNouvelleDemandeSubmit}>
              {demandeMessage.text && (
                <div
                  className={`info-box ${
                    demandeMessage.type === "error"
                      ? "error-box"
                      : "success-box"
                  }`}
                  style={{
                    marginBottom: "24px",
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

              <div
                className="form-step-content"
                style={{
                  backgroundColor: "white",
                  padding: "40px",
                  borderRadius: "12px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                  minHeight: "500px",
                }}
              >
                {/* Étape 1: Enregistrement de la demande */}
                {nouvelleDemandeStep === 1 && (
                  <div>
                    <h3
                      style={{
                        marginBottom: "32px",
                        color: "#1a1a1a",
                        fontSize: "24px",
                        fontWeight: "600",
                      }}
                    >
                      1. Enregistrement de la demande
                    </h3>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "24px",
                      }}
                    >
                      <div className="form-group">
                        <label>
                          Date d'enregistrement{" "}
                          <span className="required">*</span>
                        </label>
                        <input
                          type="date"
                          name="dateEnregistrement"
                          value={nouvelleDemandeFormData.dateEnregistrement}
                          onChange={handleNouvelleDemandeInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>
                          Société demandeur <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          name="demandeur"
                          value={nouvelleDemandeFormData.demandeur}
                          onChange={handleNouvelleDemandeInputChange}
                          placeholder="Nom de la société demandeur"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>
                          L'interlocuteur client (DPASI - Nominatif){" "}
                          <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          name="interlocuteurClient"
                          value={nouvelleDemandeFormData.interlocuteurClient}
                          onChange={handleNouvelleDemandeInputChange}
                          placeholder="Nom de l'interlocuteur"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>
                          Type de projet <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          name="typeProjet"
                          value={nouvelleDemandeFormData.typeProjet}
                          onChange={handleNouvelleDemandeInputChange}
                          placeholder="Ex: Refonte, Nouvelle feature..."
                          required
                        />
                      </div>
                      <div
                        className="form-group"
                        style={{ gridColumn: "1 / -1" }}
                      >
                        <label>
                          Nom du projet / Applicatif{" "}
                          <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          name="nomProjet"
                          value={nouvelleDemandeFormData.nomProjet}
                          onChange={handleNouvelleDemandeInputChange}
                          placeholder="Nom du projet"
                          required
                        />
                      </div>
                      <div
                        className="form-group"
                        style={{ gridColumn: "1 / -1" }}
                      >
                        <label>
                          Description du projet{" "}
                          <span className="required">*</span>
                        </label>
                        <textarea
                          name="descriptionProjet"
                          value={nouvelleDemandeFormData.descriptionProjet}
                          onChange={handleNouvelleDemandeInputChange}
                          rows={4}
                          placeholder="Décrivez le projet..."
                          required
                        />
                      </div>
                      <div
                        className="form-group"
                        style={{ gridColumn: "1 / -1" }}
                      >
                        <label>
                          Description du périmètre{" "}
                          <span className="required">*</span>
                        </label>
                        <textarea
                          name="descriptionPerimetre"
                          value={nouvelleDemandeFormData.descriptionPerimetre}
                          onChange={handleNouvelleDemandeInputChange}
                          rows={4}
                          placeholder="Décrivez le périmètre..."
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>
                          Statut de la demande{" "}
                          <span className="required">*</span>
                        </label>
                        <select
                          name="statutDemande"
                          value={nouvelleDemandeFormData.statutDemande}
                          onChange={handleNouvelleDemandeInputChange}
                          required
                        >
                          <option value="">Sélectionnez un statut</option>
                          <option value="en attente">En attente</option>
                          <option value="en cours">En cours</option>
                          <option value="terminé">Terminé</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>
                          Date de réception de la demande{" "}
                          <span className="required">*</span>
                        </label>
                        <input
                          type="date"
                          name="dateReception"
                          value={nouvelleDemandeFormData.dateReception}
                          onChange={handleNouvelleDemandeInputChange}
                          required
                        />
                      </div>
                      <div
                        className="form-group"
                        style={{ gridColumn: "1 / -1" }}
                      >
                        <label>
                          Enregistrement du lien INGRID du CDC{" "}
                          <span className="required">*</span>
                        </label>
                        <input
                          type="url"
                          name="lienIngridCDC"
                          value={nouvelleDemandeFormData.lienIngridCDC}
                          onChange={handleNouvelleDemandeInputChange}
                          placeholder="https://ingrid.example.com/..."
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Étape 2: Clarification de la demande */}
                {nouvelleDemandeStep === 2 && (
                  <div>
                    <h3
                      style={{
                        marginBottom: "32px",
                        color: "#1a1a1a",
                        fontSize: "24px",
                        fontWeight: "600",
                      }}
                    >
                      2. Clarification de la demande
                    </h3>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "24px",
                      }}
                    >
                      <div className="form-group">
                        <label>
                          Date de transmission du backlog{" "}
                          <span className="required">*</span>
                        </label>
                        <input
                          type="date"
                          name="dateTransmissionBacklog"
                          value={
                            nouvelleDemandeFormData.dateTransmissionBacklog
                          }
                          onChange={handleNouvelleDemandeInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>
                          Date de confirmation de validation{" "}
                          <span className="required">*</span>
                        </label>
                        <input
                          type="date"
                          name="dateConfirmationValidation"
                          value={
                            nouvelleDemandeFormData.dateConfirmationValidation
                          }
                          onChange={handleNouvelleDemandeInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Étape 3: Planification du périmètre */}
                {nouvelleDemandeStep === 3 && (
                  <div>
                    <h3
                      style={{
                        marginBottom: "32px",
                        color: "#1a1a1a",
                        fontSize: "24px",
                        fontWeight: "600",
                      }}
                    >
                      3. Planification du périmètre
                    </h3>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "24px",
                      }}
                    >
                      <div className="form-group">
                        <label>
                          Date de demande de planification DEV+TIF{" "}
                          <span className="required">*</span>
                        </label>
                        <input
                          type="date"
                          name="dateDemandePlanificationDevTif"
                          value={
                            nouvelleDemandeFormData.dateDemandePlanificationDevTif
                          }
                          onChange={handleNouvelleDemandeInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>
                          Date du retour des équipes{" "}
                          <span className="required">*</span>
                        </label>
                        <input
                          type="date"
                          name="dateRetourEquipes"
                          value={nouvelleDemandeFormData.dateRetourEquipes}
                          onChange={handleNouvelleDemandeInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>
                          Date de communication du planning au client{" "}
                          <span className="required">*</span>
                        </label>
                        <input
                          type="date"
                          name="dateCommunicationPlanningClient"
                          value={
                            nouvelleDemandeFormData.dateCommunicationPlanningClient
                          }
                          onChange={handleNouvelleDemandeInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>
                          Nombre de sprint pour le périmètre{" "}
                          <span className="required">*</span>
                        </label>
                        <input
                          type="number"
                          name="nombreSprint"
                          value={nouvelleDemandeFormData.nombreSprint}
                          onChange={handleNouvelleDemandeInputChange}
                          min="1"
                          placeholder="Ex: 3"
                          required
                        />
                      </div>
                      <div
                        className="form-group"
                        style={{ gridColumn: "1 / -1" }}
                      >
                        <label>Proposer une roadmap</label>
                        <textarea
                          name="roadmap"
                          value={nouvelleDemandeFormData.roadmap}
                          onChange={handleNouvelleDemandeInputChange}
                          rows={4}
                          placeholder="Décrivez la roadmap..."
                        />
                      </div>
                      <div className="form-group">
                        <label>Date effective de livraison au TIF</label>
                        <input
                          type="date"
                          name="dateEffectiveLivraisonTIF"
                          value={
                            nouvelleDemandeFormData.dateEffectiveLivraisonTIF
                          }
                          onChange={handleNouvelleDemandeInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Date effective de livraison au client</label>
                        <input
                          type="date"
                          name="dateEffectiveLivraisonClient"
                          value={
                            nouvelleDemandeFormData.dateEffectiveLivraisonClient
                          }
                          onChange={handleNouvelleDemandeInputChange}
                        />
                      </div>
                      {nouvelleDemandeFormData.dateEffectiveLivraisonTIF && (
                        <div
                          className="form-group"
                          style={{ gridColumn: "1 / -1" }}
                        >
                          <label>
                            En cas de retard, renseigner les motifs du retard
                            (TIF)
                          </label>
                          <textarea
                            name="motifsRetardTIF"
                            value={nouvelleDemandeFormData.motifsRetardTIF}
                            onChange={handleNouvelleDemandeInputChange}
                            rows={3}
                            placeholder="Décrivez les motifs du retard..."
                          />
                        </div>
                      )}
                      {nouvelleDemandeFormData.dateEffectiveLivraisonClient && (
                        <div
                          className="form-group"
                          style={{ gridColumn: "1 / -1" }}
                        >
                          <label>
                            En cas de retard, renseigner les motifs du retard
                            (Client)
                          </label>
                          <textarea
                            name="motifsRetardClient"
                            value={nouvelleDemandeFormData.motifsRetardClient}
                            onChange={handleNouvelleDemandeInputChange}
                            rows={3}
                            placeholder="Décrivez les motifs du retard..."
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Étape 4: Codage de l'application */}
                {nouvelleDemandeStep === 4 && (
                  <div>
                    <h3
                      style={{
                        marginBottom: "32px",
                        color: "#1a1a1a",
                        fontSize: "24px",
                        fontWeight: "600",
                      }}
                    >
                      4. Codage de l'application
                    </h3>
                    <div className="form-group" style={{ maxWidth: "400px" }}>
                      <label>
                        Statut <span className="required">*</span>
                      </label>
                      <select
                        name="statutCodage"
                        value={nouvelleDemandeFormData.statutCodage}
                        onChange={handleNouvelleDemandeInputChange}
                        required
                      >
                        <option value="en attente">En attente</option>
                        <option value="en cours">En cours</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Étape 5: Présentation des documents */}
                {nouvelleDemandeStep === 5 && (
                  <div>
                    <h3
                      style={{
                        marginBottom: "32px",
                        color: "#1a1a1a",
                        fontSize: "24px",
                        fontWeight: "600",
                      }}
                    >
                      5. Présentation des documents
                    </h3>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr",
                        gap: "24px",
                      }}
                    >
                      <div className="form-group">
                        <label>
                          Présentation de kickoff - Lien INGRID{" "}
                          <span className="required">*</span>
                        </label>
                        <input
                          type="url"
                          name="lienIngridKickoff"
                          value={nouvelleDemandeFormData.lienIngridKickoff}
                          onChange={handleNouvelleDemandeInputChange}
                          placeholder="https://ingrid.example.com/..."
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>
                          Rédaction des points de contrôles (TIF) - Lien INGRID{" "}
                          <span className="required">*</span>
                        </label>
                        <input
                          type="url"
                          name="lienIngridPointsControleTIF"
                          value={
                            nouvelleDemandeFormData.lienIngridPointsControleTIF
                          }
                          onChange={handleNouvelleDemandeInputChange}
                          placeholder="https://ingrid.example.com/..."
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>
                          Rédaction du signoff document - Lien INGRID{" "}
                          <span className="required">*</span>
                        </label>
                        <input
                          type="url"
                          name="lienIngridSignoff"
                          value={nouvelleDemandeFormData.lienIngridSignoff}
                          onChange={handleNouvelleDemandeInputChange}
                          placeholder="https://ingrid.example.com/..."
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Étape 6: Réalisation des TIF */}
                {nouvelleDemandeStep === 6 && (
                  <div>
                    <h3
                      style={{
                        marginBottom: "32px",
                        color: "#1a1a1a",
                        fontSize: "24px",
                        fontWeight: "600",
                      }}
                    >
                      6. Réalisation des TIF
                    </h3>
                    <div className="form-group" style={{ maxWidth: "400px" }}>
                      <label>
                        Statut <span className="required">*</span>
                      </label>
                      <select
                        name="statutTIF"
                        value={nouvelleDemandeFormData.statutTIF}
                        onChange={handleNouvelleDemandeInputChange}
                        required
                      >
                        <option value="en attente">En attente</option>
                        <option value="en cours">En cours</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Étape 7: Livraison effective au client */}
                {nouvelleDemandeStep === 7 && (
                  <div>
                    <h3
                      style={{
                        marginBottom: "32px",
                        color: "#1a1a1a",
                        fontSize: "24px",
                        fontWeight: "600",
                      }}
                    >
                      7. Livraison effective au client
                    </h3>
                    <div className="form-group" style={{ maxWidth: "400px" }}>
                      <label>
                        Statut <span className="required">*</span>
                      </label>
                      <select
                        name="statutLivraisonClient"
                        value={nouvelleDemandeFormData.statutLivraisonClient}
                        onChange={handleNouvelleDemandeInputChange}
                        required
                      >
                        <option value="en attente">En attente</option>
                        <option value="effectué">Effectué</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Boutons de navigation */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "32px",
                  paddingTop: "24px",
                  borderTop: "2px solid #e5e7eb",
                }}
              >
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleNouvelleDemandeCancel}
                  >
                    ← Retour à la page principale
                  </button>
                  {nouvelleDemandeStep > 1 && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleNouvelleDemandePrevious}
                    >
                      ← Retour
                    </button>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "center",
                  }}
                >
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => sauvegarderNouvelleDemandeBrouillon()}
                  >
                    Enregistrer le brouillon
                  </button>
                  <button
                    type="button"
                    onClick={confirmerSuppressionBrouillon}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#6b7280",
                      textDecoration: "underline",
                      padding: "8px 4px",
                      cursor: "pointer",
                    }}
                  >
                    Supprimer le brouillon
                  </button>
                  {nouvelleDemandeStep < 7 ? (
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleNouvelleDemandeNext}
                    >
                      Suivant →
                    </button>
                  ) : (
                    <button type="submit" className="btn-primary">
                      Terminer
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Liste unifiée des demandes */}
        <div
          className="section-rubrique"
          style={{ marginBottom: showDemandesList ? "32px" : "8px" }}
        >
          <button
            type="button"
            onClick={() => setShowDemandesList((v) => !v)}
            style={{
              width: "100%",
              textAlign: "left",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
            aria-expanded={showDemandesList}
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
              <span>Liste des demandes</span>
              <span style={{ color: "#6b7280", fontSize: "14px" }}>
                {showDemandesList ? "Masquer" : "Afficher"}
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
                      ? `Créer une demande d'évolution - Étape ${evolutionFormStep}/3`
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

                  {/* Champs communs - affichés uniquement si ce n'est pas une demande d'évolution ou si on est en mode édition */}
                  {!(demandeFormType === "evolution" && !editingDemande) && (
                    <>
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
                          Sociétés demandeurs{" "}
                          <span className="required">*</span>
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
                            <option
                              key={societe.id}
                              value={societe.id.toString()}
                            >
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
                              {collab.nom}{" "}
                              {collab.email ? `- ${collab.email}` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

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
                    <>
                      {/* Étape 1 : Dates de mise à jour DATFL */}
                      {evolutionFormStep === 1 && (
                        <>
                          <div className="form-group">
                            <label htmlFor="dateDemandeMiseAJourDATFL">
                              Date de demande de la mise à jour du DATFL{" "}
                              <span className="required">*</span>
                            </label>
                            <input
                              type="date"
                              id="dateDemandeMiseAJourDATFL"
                              name="dateDemandeMiseAJourDATFL"
                              value={demandeFormData.dateDemandeMiseAJourDATFL}
                              onChange={handleDemandeInputChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="dateReponseMiseAJourDATFL">
                              Date de réponse de la mise à jour du DATFL{" "}
                              <span className="required">*</span>
                            </label>
                            <input
                              type="date"
                              id="dateReponseMiseAJourDATFL"
                              name="dateReponseMiseAJourDATFL"
                              value={demandeFormData.dateReponseMiseAJourDATFL}
                              onChange={handleDemandeInputChange}
                              required
                            />
                          </div>
                        </>
                      )}

                      {/* Étape 2 : Charge et Planning */}
                      {evolutionFormStep === 2 && (
                        <>
                          <div className="form-group">
                            <label htmlFor="charge">
                              Charge (nombre de jours){" "}
                              <span className="required">*</span>
                            </label>
                            <input
                              type="number"
                              id="charge"
                              name="charge"
                              value={demandeFormData.charge}
                              onChange={handleDemandeInputChange}
                              placeholder="Ex: 5"
                              min="0"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="planningDateDebut">
                              Date de début du planning{" "}
                              <span className="required">*</span>
                            </label>
                            <input
                              type="date"
                              id="planningDateDebut"
                              name="planningDateDebut"
                              value={demandeFormData.planningDateDebut}
                              onChange={handleDemandeInputChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="planningDateFin">
                              Date de fin du planning{" "}
                              <span className="required">*</span>
                            </label>
                            <input
                              type="date"
                              id="planningDateFin"
                              name="planningDateFin"
                              value={demandeFormData.planningDateFin}
                              onChange={handleDemandeInputChange}
                              required
                            />
                          </div>
                          {demandeFormData.planningDateDebut &&
                            demandeFormData.planningDateFin && (
                              <div
                                style={{
                                  padding: "12px",
                                  backgroundColor: "#f0f9ff",
                                  borderRadius: "6px",
                                  marginTop: "8px",
                                  color: "#1e40af",
                                }}
                              >
                                <strong>Planning :</strong>{" "}
                                {formatDateEnFrancais(
                                  demandeFormData.planningDateDebut
                                )}{" "}
                                au{" "}
                                {formatDateEnFrancais(
                                  demandeFormData.planningDateFin
                                )}
                              </div>
                            )}
                        </>
                      )}

                      {/* Étape 3 : Dévolution */}
                      {evolutionFormStep === 3 && (
                        <>
                          <div className="form-group">
                            <label htmlFor="dateDemandeDevolution">
                              Date de demande devolution{" "}
                              <span className="required">*</span>
                            </label>
                            <input
                              type="date"
                              id="dateDemandeDevolution"
                              name="dateDemandeDevolution"
                              value={demandeFormData.dateDemandeDevolution}
                              onChange={handleDemandeInputChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="dateReponseDevolution">
                              Date de réponse devolution{" "}
                              <span className="required">*</span>
                            </label>
                            <input
                              type="date"
                              id="dateReponseDevolution"
                              name="dateReponseDevolution"
                              value={demandeFormData.dateReponseDevolution}
                              onChange={handleDemandeInputChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="slt">
                              Renseigner les SLT{" "}
                              <span className="required">*</span>
                            </label>
                            <textarea
                              id="slt"
                              name="slt"
                              value={demandeFormData.slt}
                              onChange={handleDemandeInputChange}
                              rows={4}
                              placeholder="Saisissez les SLT..."
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="aleasNormeParJour">
                              Renseigner un aléas en norme par jour{" "}
                              <span className="required">*</span>
                            </label>
                            <input
                              type="text"
                              id="aleasNormeParJour"
                              name="aleasNormeParJour"
                              value={demandeFormData.aleasNormeParJour}
                              onChange={handleDemandeInputChange}
                              placeholder="Ex: 0.5"
                              required
                            />
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {/* Pour prospecte : pas de champs supplémentaires */}

                  <div
                    className="modal-actions"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      {demandeFormType === "evolution" &&
                        evolutionFormStep > 1 && (
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={handleEvolutionPreviousStep}
                            style={{ marginRight: "8px" }}
                          >
                            ← Précédent
                          </button>
                        )}
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={handleCancelDemande}
                      >
                        Annuler
                      </button>
                    </div>
                    <div>
                      {demandeFormType === "evolution" ? (
                        evolutionFormStep < 3 ? (
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={handleEvolutionNextStep}
                          >
                            Suivant →
                          </button>
                        ) : (
                          <button type="submit" className="btn-primary">
                            Terminer
                          </button>
                        )
                      ) : (
                        <button type="submit" className="btn-primary">
                          {editingDemande ? "Mettre à jour" : "Créer"}
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showDemandesList && (
            <div className="table-container" style={{ marginTop: "24px" }}>
              <h3>Liste des demandes</h3>
              {demandes.length === 0 ? (
                <p style={{ color: "#6b7280", marginTop: "16px" }}>
                  Aucune demande créée pour le moment.
                </p>
              ) : (
                <table className="data-table" style={{ tableLayout: "auto" }}>
                  <thead>
                    <tr>
                      <th style={{ whiteSpace: "nowrap" }}>Date d'enre.</th>
                      <th style={{ whiteSpace: "nowrap" }}>Date de réc.</th>
                      <th style={{ whiteSpace: "nowrap" }}>Type de demande</th>
                      <th style={{ whiteSpace: "nowrap" }}>Étape en cours</th>
                      <th style={{ whiteSpace: "nowrap" }}>Sociétés dem.</th>
                      <th style={{ whiteSpace: "nowrap" }}>Interlocuteur</th>
                      <th style={{ whiteSpace: "nowrap" }}>Nom projet</th>
                      <th style={{ whiteSpace: "nowrap" }}>Périmètre</th>
                      <th style={{ whiteSpace: "nowrap" }}>Détail</th>
                      <th style={{ whiteSpace: "nowrap" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demandes.map((demande) => (
                      <tr key={demande.id}>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {demande.dateEnregistrement}
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {demande.dateReception || "-"}
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "6px 10px",
                              borderRadius: "999px",
                              fontWeight: 600,
                              fontSize: "13px",
                              ...getTypeDemandeStyle(demande.typeProjet),
                            }}
                          >
                            {getTypeDemandeLabel(demande.typeProjet)}
                          </span>
                        </td>
                        <td>
                          {demande.draftStep ? (
                            <span
                              style={{
                                display: "inline-block",
                                padding: "4px 8px",
                                borderRadius: "999px",
                                backgroundColor: "#e5e7eb",
                                color: "#111827",
                                fontSize: "12px",
                                fontWeight: 600,
                              }}
                            >
                              {demande.draftStepLabel ||
                                getStepLabel(demande.draftStep)}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {getSocietesNames(demande.societesDemandeurs)}
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {demande.interlocuteurClient ||
                            demande.interlocuteur ||
                            "-"}
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {demande.nomProjet || "-"}
                        </td>
                        <td
                          style={{
                            maxWidth: "150px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {demande.descriptionPerimetre ||
                            demande.perimetre ||
                            "-"}
                        </td>
                        <td>
                          <button
                            className="btn-secondary"
                            onClick={() => handleShowDetail(demande)}
                            style={{
                              padding: "6px 12px",
                              fontSize: "13px",
                            }}
                          >
                            Détail
                          </button>
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          <div
                            style={{
                              display: "flex",
                              gap: "5px",
                              alignItems: "center",
                            }}
                          >
                            <button
                              className="btn-secondary"
                              onClick={() => handlePoursuivreDemande(demande)}
                              style={{
                                padding: "6px 10px",
                                fontSize: "13px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              Poursuivre
                            </button>
                            <button
                              className="btn-danger"
                              onClick={() => handleDeleteDemande(demande)}
                              style={{
                                padding: "6px 10px",
                                fontSize: "13px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Sections prospecte / évolution fusionnées dans la liste unique */}
      </div>

      {/* Popup de détail de la demande */}
      {showDetailModal && selectedDemandeDetail && (
        <div className="modal-overlay" onClick={closeDetailModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "900px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div className="modal-header">
              <h3>
                Détail de la demande -{" "}
                {selectedDemandeDetail.nomProjet ||
                  `#${selectedDemandeDetail.id}`}
              </h3>
              <button className="modal-close" onClick={closeDetailModal}>
                &times;
              </button>
            </div>

            <div className="modal-body" style={{ padding: "24px" }}>
              {/* Étape 1: Enregistrement */}
              <div style={{ marginBottom: "32px" }}>
                <h4
                  style={{
                    color: "#3b82f6",
                    marginBottom: "16px",
                    paddingBottom: "8px",
                    borderBottom: "2px solidrgb(98, 157, 252)",
                  }}
                >
                  Étape 1 : Enregistrement
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <div>
                    <strong>Date d'enregistrement :</strong>
                    <p style={{ margin: "4px 0 0 0", color: "#4b5563" }}>
                      {selectedDemandeDetail.dateEnregistrement || "-"}
                    </p>
                  </div>
                  <div>
                    <strong>Date de réception :</strong>
                    <p style={{ margin: "4px 0 0 0", color: "#4b5563" }}>
                      {selectedDemandeDetail.dateReception || "-"}
                    </p>
                  </div>
                  <div>
                    <strong>Demandeur :</strong>
                    <p style={{ margin: "4px 0 0 0", color: "#4b5563" }}>
                      {selectedDemandeDetail.demandeur || "-"}
                    </p>
                  </div>
                  <div>
                    <strong>Interlocuteur client :</strong>
                    <p style={{ margin: "4px 0 0 0", color: "#4b5563" }}>
                      {selectedDemandeDetail.interlocuteurClient || "-"}
                    </p>
                  </div>
                  <div>
                    <strong>Type de projet :</strong>
                    <p style={{ margin: "4px 0 0 0", color: "#4b5563" }}>
                      {selectedDemandeDetail.typeProjet || "-"}
                    </p>
                  </div>
                  <div>
                    <strong>Nom du projet :</strong>
                    <p style={{ margin: "4px 0 0 0", color: "#4b5563" }}>
                      {selectedDemandeDetail.nomProjet || "-"}
                    </p>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <strong>Description du projet :</strong>
                    <p style={{ margin: "4px 0 0 0", color: "#4b5563" }}>
                      {selectedDemandeDetail.descriptionProjet || "-"}
                    </p>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <strong>Description du périmètre :</strong>
                    <p style={{ margin: "4px 0 0 0", color: "#4b5563" }}>
                      {selectedDemandeDetail.descriptionPerimetre || "-"}
                    </p>
                  </div>
                  <div>
                    <strong>Périmètre :</strong>
                    <p style={{ margin: "4px 0 0 0", color: "#4b5563" }}>
                      {selectedDemandeDetail.perimetre || "-"}
                    </p>
                  </div>
                  <div>
                    <strong>Statut de la demande :</strong>
                    <p style={{ margin: "4px 0 0 0", color: "#4b5563" }}>
                      {selectedDemandeDetail.statutDemande || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Étape 2: Clarification */}
              <div style={{ marginBottom: "32px" }}>
                <h4
                  style={{
                    color: "#3b82f6",
                    marginBottom: "16px",
                    paddingBottom: "8px",
                    borderBottom: "2px solidrgb(98, 157, 252)",
                  }}
                >
                  Étape 2 : Clarification
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <div>
                    <strong>Lien Ingrid CDC :</strong>
                    <p style={{ margin: "4px 0 0 0", color: "#4b5563" }}>
                      {selectedDemandeDetail.lienIngridCDC ? (
                        <a
                          href={selectedDemandeDetail.lienIngridCDC}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {selectedDemandeDetail.lienIngridCDC}
                        </a>
                      ) : (
                        "-"
                      )}
                    </p>
                  </div>
                  <div>
                    <strong>Date de transmission du backlog :</strong>
                    <p style={{ margin: "4px 0 0 0", color: "#4b5563" }}>
                      {selectedDemandeDetail.dateTransmissionBacklog || "-"}
                    </p>
                  </div>
                  <div>
                    <strong>Date de confirmation de validation :</strong>
                    <p style={{ margin: "4px 0 0 0", color: "#4b5563" }}>
                      {selectedDemandeDetail.dateConfirmationValidation || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Étape 3: Planification */}
              <div style={{ marginBottom: "32px" }}>
                <h4
                  style={{
                    color: "#3b82f6",
                    marginBottom: "16px",
                    paddingBottom: "8px",
                    borderBottom: "2px solidrgb(98, 157, 252)",
                  }}
                >
                  Étape 3 : Planification
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <div>
                    <strong>Date de demande de planification Dev/TIF :</strong>
                    <p style={{ margin: "4px 0 0 0", color: "#4b5563" }}>
                      {selectedDemandeDetail.dateDemandePlanificationDevTif ||
                        "-"}
                    </p>
                  </div>
                  <div>
                    <strong>Date de retour des équipes :</strong>
                    <p style={{ margin: "4px 0 0 0", color: "#4b5563" }}>
                      {selectedDemandeDetail.dateRetourEquipes || "-"}
                    </p>
                  </div>
                  <div>
                    <strong>
                      Date de communication du planning au client :
                    </strong>
                    <p style={{ margin: "4px 0 0 0", color: "#4b5563" }}>
                      {selectedDemandeDetail.dateCommunicationPlanningClient ||
                        "-"}
                    </p>
                  </div>
                  <div>
                    <strong>Nombre de sprints :</strong>
                    <p style={{ margin: "4px 0 0 0", color: "#4b5563" }}>
                      {selectedDemandeDetail.nombreSprint || "-"}
                    </p>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <strong>Roadmap :</strong>
                    <p style={{ margin: "4px 0 0 0", color: "#4b5563" }}>
                      {selectedDemandeDetail.roadmap || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Étape 4: Codage */}
              <div style={{ marginBottom: "32px" }}>
                <h4
                  style={{
                    color: "#3b82f6",
                    marginBottom: "16px",
                    paddingBottom: "8px",
                    borderBottom: "2px solidrgb(98, 157, 252)",
                  }}
                >
                  Étape 4 : Codage
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <div>
                    <strong>Statut de codage :</strong>
                    <p style={{ margin: "4px 0 0 0", color: "#4b5563" }}>
                      {selectedDemandeDetail.statutCodage || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Étape 5: Documents */}
              <div style={{ marginBottom: "32px" }}>
                <h4
                  style={{
                    color: "#3b82f6",
                    marginBottom: "16px",
                    paddingBottom: "8px",
                    borderBottom: "2px solidrgb(98, 157, 252)",
                  }}
                >
                  Étape 5 : Documents
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: "16px",
                  }}
                >
                  <div>
                    <strong>Lien Ingrid Kickoff :</strong>
                    <p style={{ margin: "4px 0 0 0", color: "#4b5563" }}>
                      {selectedDemandeDetail.lienIngridKickoff ? (
                        <a
                          href={selectedDemandeDetail.lienIngridKickoff}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {selectedDemandeDetail.lienIngridKickoff}
                        </a>
                      ) : (
                        "-"
                      )}
                    </p>
                  </div>
                  <div>
                    <strong>Lien Ingrid Points de contrôle TIF :</strong>
                    <p style={{ margin: "4px 0 0 0", color: "#4b5563" }}>
                      {selectedDemandeDetail.lienIngridPointsControleTIF ? (
                        <a
                          href={
                            selectedDemandeDetail.lienIngridPointsControleTIF
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {selectedDemandeDetail.lienIngridPointsControleTIF}
                        </a>
                      ) : (
                        "-"
                      )}
                    </p>
                  </div>
                  <div>
                    <strong>Lien Ingrid Signoff :</strong>
                    <p style={{ margin: "4px 0 0 0", color: "#4b5563" }}>
                      {selectedDemandeDetail.lienIngridSignoff ? (
                        <a
                          href={selectedDemandeDetail.lienIngridSignoff}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {selectedDemandeDetail.lienIngridSignoff}
                        </a>
                      ) : (
                        "-"
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Étape 6: TIF */}
              <div style={{ marginBottom: "32px" }}>
                <h4
                  style={{
                    color: "#3b82f6",
                    marginBottom: "16px",
                    paddingBottom: "8px",
                    borderBottom: "2px solid #3b82f6",
                  }}
                >
                  Étape 6 : TIF (Tests d'Intégration Fonctionnels)
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <div>
                    <strong>Statut TIF :</strong>
                    <p style={{ margin: "4px 0 0 0", color: "#4b5563" }}>
                      {selectedDemandeDetail.statutTIF || "-"}
                    </p>
                  </div>
                  <div>
                    <strong>Date effective de livraison TIF :</strong>
                    <p style={{ margin: "4px 0 0 0", color: "#4b5563" }}>
                      {selectedDemandeDetail.dateEffectiveLivraisonTIF || "-"}
                    </p>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <strong>Motifs de retard TIF :</strong>
                    <p style={{ margin: "4px 0 0 0", color: "#4b5563" }}>
                      {selectedDemandeDetail.motifsRetardTIF || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Étape 7: Livraison */}
              <div style={{ marginBottom: "32px" }}>
                <h4
                  style={{
                    color: "#3b82f6",
                    marginBottom: "16px",
                    paddingBottom: "8px",
                    borderBottom: "2px solid #3b82f6",
                  }}
                >
                  Étape 7 : Livraison effective au client
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <div>
                    <strong>Statut de livraison client :</strong>
                    <p style={{ margin: "4px 0 0 0", color: "#4b5563" }}>
                      {selectedDemandeDetail.statutLivraisonClient || "-"}
                    </p>
                  </div>
                  <div>
                    <strong>Date effective de livraison client :</strong>
                    <p style={{ margin: "4px 0 0 0", color: "#4b5563" }}>
                      {selectedDemandeDetail.dateEffectiveLivraisonClient ||
                        "-"}
                    </p>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <strong>Motifs de retard client :</strong>
                    <p style={{ margin: "4px 0 0 0", color: "#4b5563" }}>
                      {selectedDemandeDetail.motifsRetardClient || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popup de confirmation de suppression de brouillon */}
      {showDeleteDraftModal && (
        <div className="modal-overlay" onClick={cancelDeleteDraft}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <h3>Confirmer la suppression</h3>
            </div>
            <div className="confirm-modal-body">
              <p>Voulez-vous vraiment supprimer ce brouillon ?</p>
              <p className="confirm-warning">Cette action est irréversible.</p>
            </div>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="btn-danger"
                onClick={confirmDeleteDraft}
              >
                Supprimer
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={cancelDeleteDraft}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

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
