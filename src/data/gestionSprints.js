// Fichier pour gérer la base de données des sprints
import donneesInitiales from "./sprints.json";

// Sauvegarder les sprints dans localStorage
const sauvegarderSprints = (sprints) => {
  localStorage.setItem("sprintsJulee", JSON.stringify(sprints));
};

// Charger les sprints depuis localStorage ou le fichier JSON initial
const chargerSprints = () => {
  // Vérifier si on a déjà des données dans localStorage
  const donneesStockees = localStorage.getItem("sprintsJulee");

  if (donneesStockees) {
    // Si oui, utiliser les données de localStorage
    return JSON.parse(donneesStockees);
  } else {
    // Sinon, utiliser les données initiales du fichier JSON
    const sprintsInitiaux = donneesInitiales.sprints || [];
    // Sauvegarder dans localStorage pour la première fois
    sauvegarderSprints(sprintsInitiaux);
    return sprintsInitiaux;
  }
};

// Trouver un sprint par ID
const trouverSprintParId = (id) => {
  const sprints = chargerSprints();
  return sprints.find((sprint) => sprint.id === id);
};

// Valider les données d'un sprint
const validerSprint = (sprintData) => {
  if (!sprintData.nom || sprintData.nom.trim() === "") {
    return { valide: false, message: "Le nom du sprint est obligatoire" };
  }

  if (!sprintData.dateDebut) {
    return { valide: false, message: "La date de début est obligatoire" };
  }

  if (!sprintData.dateFin) {
    return { valide: false, message: "La date de fin est obligatoire" };
  }

  if (new Date(sprintData.dateDebut) > new Date(sprintData.dateFin)) {
    return {
      valide: false,
      message: "La date de fin doit être postérieure à la date de début",
    };
  }

  // Valider les ressources
  if (sprintData.ressources && sprintData.ressources.length > 0) {
    for (const ressource of sprintData.ressources) {
      if (!ressource.type || (ressource.type !== "DEV" && ressource.type !== "TIV")) {
        return {
          valide: false,
          message: "Chaque ressource doit être typée DEV ou TIV",
        };
      }

      if (
        ressource.disponibilite === undefined ||
        ressource.disponibilite === null ||
        ressource.disponibilite < 0
      ) {
        return {
          valide: false,
          message: "Chaque ressource doit avoir une disponibilité en Homme/Jour (>= 0)",
        };
      }

      if (
        ressource.tjm === undefined ||
        ressource.tjm === null ||
        ressource.tjm < 0
      ) {
        return {
          valide: false,
          message: "Chaque ressource doit avoir un Taux Journalier (TJM) >= 0",
        };
      }
    }
  }

  return { valide: true, message: "" };
};

// Créer un nouveau sprint
const creerSprint = (sprintData) => {
  const sprints = chargerSprints();

  // Validation
  const validation = validerSprint(sprintData);
  if (!validation.valide) {
    return { succes: false, message: validation.message };
  }

  // Générer un nouvel ID
  const nouvelId =
    sprints.length > 0
      ? Math.max(...sprints.map((s) => s.id)) + 1
      : 1;

  const nouveauSprint = {
    id: nouvelId,
    nom: sprintData.nom.trim(),
    description: sprintData.description || "",
    dateDebut: sprintData.dateDebut,
    dateFin: sprintData.dateFin,
    dateValidationSI: sprintData.dateValidationSI || null,
    dateReponseDEV: sprintData.dateReponseDEV || null,
    dateReponseTIV: sprintData.dateReponseTIV || null,
    etape: sprintData.etape || "",
    evenementImportant: sprintData.evenementImportant || "",
    pointsControle: sprintData.pointsControle || [],
    ressources: sprintData.ressources || [],
    respectPlanning: sprintData.respectPlanning || false,
    dateCreation: new Date().toISOString(),
    dateModification: new Date().toISOString(),
  };

  sprints.push(nouveauSprint);
  sauvegarderSprints(sprints);

  return {
    succes: true,
    message: "Sprint créé avec succès",
    sprint: nouveauSprint,
  };
};

// Mettre à jour un sprint
const mettreAJourSprint = (id, sprintData) => {
  const sprints = chargerSprints();
  const index = sprints.findIndex((s) => s.id === id);

  if (index === -1) {
    return { succes: false, message: "Sprint non trouvé" };
  }

  // Validation
  const validation = validerSprint(sprintData);
  if (!validation.valide) {
    return { succes: false, message: validation.message };
  }

  const sprintExistant = sprints[index];
  const sprintModifie = {
    ...sprintExistant,
    nom: sprintData.nom.trim(),
    description: sprintData.description || "",
    dateDebut: sprintData.dateDebut,
    dateFin: sprintData.dateFin,
    dateValidationSI: sprintData.dateValidationSI || null,
    dateReponseDEV: sprintData.dateReponseDEV || null,
    dateReponseTIV: sprintData.dateReponseTIV || null,
    etape: sprintData.etape || "",
    evenementImportant: sprintData.evenementImportant || "",
    pointsControle: sprintData.pointsControle || [],
    ressources: sprintData.ressources || [],
    respectPlanning: sprintData.respectPlanning || false,
    dateModification: new Date().toISOString(),
  };

  sprints[index] = sprintModifie;
  sauvegarderSprints(sprints);

  return {
    succes: true,
    message: "Sprint mis à jour avec succès",
    sprint: sprintModifie,
  };
};

// Supprimer un sprint
const supprimerSprint = (id) => {
  const sprints = chargerSprints();
  const index = sprints.findIndex((s) => s.id === id);

  if (index === -1) {
    return { succes: false, message: "Sprint non trouvé" };
  }

  sprints.splice(index, 1);
  sauvegarderSprints(sprints);

  return { succes: true, message: "Sprint supprimé avec succès" };
};

// Calculer le coût total d'un sprint
const calculerCoutSprint = (sprintId) => {
  const sprint = trouverSprintParId(sprintId);
  if (!sprint || !sprint.ressources || sprint.ressources.length === 0) {
    return 0;
  }

  let coutTotal = 0;
  sprint.ressources.forEach((ressource) => {
    const coutRessource = ressource.disponibilite * ressource.tjm;
    coutTotal += coutRessource;
  });

  return coutTotal;
};

export {
  chargerSprints,
  trouverSprintParId,
  creerSprint,
  mettreAJourSprint,
  supprimerSprint,
  calculerCoutSprint,
  validerSprint,
};
