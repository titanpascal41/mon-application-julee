// Fichier pour gérer la base de données des demandes
import donneesInitiales from "./demandes.json";
import { chargerSocietes } from "./societes";

const CLE_STORAGE = "demandesJulee";

// Normaliser le type de projet pour la comparaison
const normalizeTypeProjet = (typeProjet) => {
  if (!typeProjet) return "";
  return String(typeProjet).trim().toLowerCase();
};

// Règles de champs obligatoires selon le type
const getDemandeRequirements = (typeProjet) => {
  const t = normalizeTypeProjet(typeProjet);
  return {
    // Pour "Prospecte" et "Evolution", pas de description de périmètre obligatoire
    requiresDescriptionPerimetre: t !== "prospecte" && t !== "evolution",
    // Pour "Prospecte", pas de périmètre obligatoire
    requiresPerimetre: t !== "prospecte",
  };
};

// Détecter si les données stockées correspondent aux seeds du fichier JSON
const estJeuDeDonneesInitial = (demandesStockees) => {
  const seeds = donneesInitiales.demandes || [];
  if (
    !Array.isArray(demandesStockees) ||
    seeds.length !== demandesStockees.length
  )
    return false;
  return seeds.every((seed) =>
    demandesStockees.some(
      (d) =>
        d.id === seed.id &&
        d.nomProjet === seed.nomProjet &&
        d.typeProjet === seed.typeProjet
    )
  );
};

// Charger les demandes depuis localStorage (pas de pré-saisie par défaut)
const chargerDemandes = () => {
  const donneesStockees = localStorage.getItem(CLE_STORAGE);

  if (donneesStockees) {
    const demandesStockees = JSON.parse(donneesStockees);
    if (demandesStockees && demandesStockees.length > 0) {
      // Si ce sont les seeds, on renvoie une liste vide pour partir de zéro
      if (estJeuDeDonneesInitial(demandesStockees)) {
        return [];
      }
      return demandesStockees;
    }
  }

  // Aucune donnée persistée : on commence vide
  return [];
};

// Sauvegarder les demandes dans localStorage
const sauvegarderDemandes = (demandes) => {
  localStorage.setItem(CLE_STORAGE, JSON.stringify(demandes));
};

// Créer une nouvelle demande
const creerDemande = ({
  dateReception,
  societesDemandeurs,
  interlocuteur,
  typeProjet,
  nomProjet,
  descriptionPerimetre,
  perimetre,
  isDraft = false,
  ...rest
}) => {
  const demandes = chargerDemandes();

  const { requiresDescriptionPerimetre, requiresPerimetre } =
    getDemandeRequirements(typeProjet);

  if (!isDraft) {
    // Vérifier que tous les champs obligatoires sont remplis
    if (!dateReception) {
      return {
        succes: false,
        message: "Tous les champs obligatoires doivent être remplis",
      };
    }

    if (!societesDemandeurs || societesDemandeurs.length === 0) {
      return {
        succes: false,
        message: "Tous les champs obligatoires doivent être remplis",
      };
    }

    if (!interlocuteur) {
      return {
        succes: false,
        message: "Tous les champs obligatoires doivent être remplis",
      };
    }

    if (!typeProjet) {
      return {
        succes: false,
        message: "Tous les champs obligatoires doivent être remplis",
      };
    }

    if (!nomProjet) {
      return {
        succes: false,
        message: "Tous les champs obligatoires doivent être remplis",
      };
    }

    if (requiresDescriptionPerimetre && !descriptionPerimetre) {
      return {
        succes: false,
        message: "Tous les champs obligatoires doivent être remplis",
      };
    }

    if (requiresPerimetre && !perimetre) {
      return {
        succes: false,
        message: "Tous les champs obligatoires doivent être remplis",
      };
    }

    // Vérifier que les sociétés existent
    const societes = chargerSocietes();
    const societesIds = Array.isArray(societesDemandeurs)
      ? societesDemandeurs
      : [societesDemandeurs];
    const toutesSocietesExistantes = societesIds.every((id) =>
      societes.some((s) => s.id === parseInt(id))
    );

    if (!toutesSocietesExistantes) {
      return {
        succes: false,
        message: "Une ou plusieurs sociétés sélectionnées n'existent pas",
      };
    }
  }

  const societesIds =
    Array.isArray(societesDemandeurs) && societesDemandeurs.length > 0
      ? societesDemandeurs
      : societesDemandeurs
      ? [societesDemandeurs]
      : [];

  // Générer un nouvel ID
  const nouvelId =
    demandes.length > 0 ? Math.max(...demandes.map((d) => d.id)) + 1 : 1;

  // Date d'enregistrement automatique
  const dateEnregistrement = new Date().toISOString().split("T")[0];

  const nouvelleDemande = {
    id: nouvelId,
    dateEnregistrement: dateEnregistrement,
    dateReception: dateReception,
    societesDemandeurs: societesIds.map((id) => parseInt(id)),
    interlocuteur: interlocuteur ? interlocuteur.trim() : "",
    typeProjet: typeProjet ? typeProjet.trim() : "",
    nomProjet: nomProjet ? nomProjet.trim() : "",
    descriptionPerimetre: descriptionPerimetre
      ? String(descriptionPerimetre).trim()
      : "",
    perimetre: perimetre ? String(perimetre) : "",
    isDraft: !!isDraft,
    ...rest,
  };

  demandes.push(nouvelleDemande);
  sauvegarderDemandes(demandes);

  return {
    succes: true,
    message: "Demande créée avec succès",
    demande: nouvelleDemande,
  };
};

// Mettre à jour une demande
const mettreAJourDemande = (
  id,
  {
    dateReception,
    societesDemandeurs,
    interlocuteur,
    typeProjet,
    nomProjet,
    descriptionPerimetre,
    perimetre,
    // Champs de soumission et validation
    dateSoumissionBacklog,
    lienCompteRendu,
    redacteurBacklog,
    dateValidationBacklog,
    dateElaborationDATFL,
    dateValidationDATFL,
    dateElaborationPlanningDEV,
    dateValidationPlanningDEV,
    statutSoumission,
    isDraft = false,
    ...rest
  }
) => {
  const demandes = chargerDemandes();
  const index = demandes.findIndex((d) => d.id === id);

  if (index === -1) {
    return { succes: false, message: "Demande introuvable" };
  }

  // Vérifier que tous les champs obligatoires sont remplis (seulement si on met à jour les champs de base)
  if (!isDraft) {
    if (
      dateReception !== undefined &&
      societesDemandeurs !== undefined &&
      interlocuteur !== undefined &&
      typeProjet !== undefined &&
      nomProjet !== undefined &&
      descriptionPerimetre !== undefined &&
      perimetre !== undefined
    ) {
      const { requiresDescriptionPerimetre, requiresPerimetre } =
        getDemandeRequirements(typeProjet);

      if (
        !dateReception ||
        !societesDemandeurs ||
        societesDemandeurs.length === 0 ||
        !interlocuteur ||
        !typeProjet ||
        !nomProjet ||
        (requiresDescriptionPerimetre && !descriptionPerimetre) ||
        (requiresPerimetre && !perimetre)
      ) {
        return {
          succes: false,
          message: "Tous les champs obligatoires doivent être remplis",
        };
      }

      // Vérifier que les sociétés existent
      const societes = chargerSocietes();
      const societesIds = Array.isArray(societesDemandeurs)
        ? societesDemandeurs
        : [societesDemandeurs];
      const toutesSocietesExistantes = societesIds.every((id) =>
        societes.some((s) => s.id === parseInt(id))
      );

      if (!toutesSocietesExistantes) {
        return {
          succes: false,
          message: "Une ou plusieurs sociétés sélectionnées n'existent pas",
        };
      }
    }
  }

  // Mettre à jour la demande (la date d'enregistrement reste inchangée)
  const demandeExistante = demandes[index];
  demandes[index] = {
    ...demandeExistante,
    // Mettre à jour seulement les champs fournis
    ...(dateReception !== undefined && { dateReception: dateReception }),
    ...(societesDemandeurs !== undefined && {
      societesDemandeurs: Array.isArray(societesDemandeurs)
        ? societesDemandeurs.map((id) => parseInt(id))
        : [parseInt(societesDemandeurs)],
    }),
    ...(interlocuteur !== undefined && { interlocuteur: interlocuteur.trim() }),
    ...(typeProjet !== undefined && { typeProjet: typeProjet.trim() }),
    ...(nomProjet !== undefined && { nomProjet: nomProjet.trim() }),
    ...(descriptionPerimetre !== undefined && {
      descriptionPerimetre: descriptionPerimetre.trim(),
    }),
    ...(perimetre !== undefined && { perimetre }),
    // Champs de soumission et validation
    ...(dateSoumissionBacklog !== undefined && { dateSoumissionBacklog }),
    ...(lienCompteRendu !== undefined && { lienCompteRendu }),
    ...(redacteurBacklog !== undefined && { redacteurBacklog }),
    ...(dateValidationBacklog !== undefined && { dateValidationBacklog }),
    ...(dateElaborationDATFL !== undefined && { dateElaborationDATFL }),
    ...(dateValidationDATFL !== undefined && { dateValidationDATFL }),
    ...(dateElaborationPlanningDEV !== undefined && {
      dateElaborationPlanningDEV,
    }),
    ...(dateValidationPlanningDEV !== undefined && {
      dateValidationPlanningDEV,
    }),
    ...(statutSoumission !== undefined && { statutSoumission }),
    ...(isDraft !== undefined && { isDraft }),
    ...(rest || {}),
  };

  sauvegarderDemandes(demandes);

  return {
    succes: true,
    message: "Demande mise à jour avec succès",
    demande: demandes[index],
  };
};

// Supprimer une demande
const supprimerDemande = (id) => {
  const demandes = chargerDemandes();
  const index = demandes.findIndex((d) => d.id === id);

  if (index === -1) {
    return { succes: false, message: "Demande introuvable" };
  }

  // Supprimer la demande
  demandes.splice(index, 1);
  sauvegarderDemandes(demandes);

  return { succes: true, message: "Demande supprimée avec succès" };
};

// Exporter les fonctions
export {
  chargerDemandes,
  sauvegarderDemandes,
  creerDemande,
  mettreAJourDemande,
  supprimerDemande,
};
