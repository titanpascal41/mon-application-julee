// Fichier pour gérer la base de données des recettes
import donneesInitiales from './recettes.json';

const CLE_STORAGE = "recettesJulee";

// Statuts possibles pour la recette
export const STATUTS_RECETTE = ["En cours", "OK", "KO", "Bloquée"];

// Charger les recettes depuis localStorage ou le fichier JSON initial
export const chargerRecettes = () => {
  const donneesStockees = localStorage.getItem(CLE_STORAGE);
  
  if (donneesStockees) {
    return JSON.parse(donneesStockees);
  } else {
    const recettesInitiales = donneesInitiales.recettes || [];
    sauvegarderRecettes(recettesInitiales);
    return recettesInitiales;
  }
};

// Sauvegarder les recettes dans localStorage
const sauvegarderRecettes = (recettes) => {
  localStorage.setItem(CLE_STORAGE, JSON.stringify(recettes));
};

// Vérifier si une recette a des anomalies bloquantes (bloque automatiquement)
const aAnomaliesBloquantes = (anomaliesBloquantes) => {
  return anomaliesBloquantes > 0;
};

// Calculer le statut automatique basé sur les anomalies
const calculerStatutAutomatique = (anomaliesBloquantes, anomaliesMajeures, anomaliesMineures) => {
  // Si anomalies bloquantes > 0, la recette est automatiquement bloquée
  if (anomaliesBloquantes > 0) {
    return "Bloquée";
  }
  // Sinon, le statut reste celui défini par le GP
  return null; // null signifie que le GP doit définir le statut
};

// Créer une nouvelle recette
export const creerRecette = (donneesRecette) => {
  const recettes = chargerRecettes();
  
  const {
    dateDebut,
    dateFin,
    anomaliesBloquantes = 0,
    anomaliesMajeures = 0,
    anomaliesMineures = 0,
    statutGlobal = "En cours",
    commentairesGP = ""
  } = donneesRecette;

  // Validation des champs obligatoires
  if (!dateDebut) {
    return { succes: false, message: "La date de début est obligatoire" };
  }

  // Validation des nombres d'anomalies (doivent être >= 0)
  if (anomaliesBloquantes < 0 || anomaliesMajeures < 0 || anomaliesMineures < 0) {
    return { succes: false, message: "Le nombre d'anomalies ne peut pas être négatif" };
  }

  // Règle : Si anomalies bloquantes > 0, la recette est automatiquement bloquée
  let statutFinal = statutGlobal;
  if (aAnomaliesBloquantes(anomaliesBloquantes)) {
    statutFinal = "Bloquée";
  }

  // Générer un nouvel ID
  const nouvelId = recettes.length > 0 
    ? Math.max(...recettes.map((r) => r.id)) + 1 
    : 1;

  const dateCreation = new Date().toISOString().split('T')[0];

  const nouvelleRecette = {
    id: nouvelId,
    dateDebut: dateDebut,
    dateFin: dateFin || null,
    anomaliesBloquantes: parseInt(anomaliesBloquantes) || 0,
    anomaliesMajeures: parseInt(anomaliesMajeures) || 0,
    anomaliesMineures: parseInt(anomaliesMineures) || 0,
    statutGlobal: statutFinal,
    commentairesGP: commentairesGP.trim(),
    dateCreation: dateCreation,
    dateModification: dateCreation
  };

  recettes.push(nouvelleRecette);
  sauvegarderRecettes(recettes);

  return { 
    succes: true, 
    message: "Recette créée avec succès" + (statutFinal === "Bloquée" ? " (bloquée automatiquement à cause d'anomalies bloquantes)" : ""), 
    recette: nouvelleRecette 
  };
};

// Mettre à jour une recette
export const mettreAJourRecette = (id, donneesRecette) => {
  const recettes = chargerRecettes();
  const index = recettes.findIndex((r) => r.id === id);

  if (index === -1) {
    return { succes: false, message: "Recette introuvable" };
  }

  const {
    dateDebut,
    dateFin,
    anomaliesBloquantes,
    anomaliesMajeures,
    anomaliesMineures,
    statutGlobal,
    commentairesGP
  } = donneesRecette;

  // Validation de la date de début
  if (dateDebut !== undefined && !dateDebut) {
    return { succes: false, message: "La date de début est obligatoire" };
  }

  // Validation des nombres d'anomalies
  if (
    (anomaliesBloquantes !== undefined && anomaliesBloquantes < 0) ||
    (anomaliesMajeures !== undefined && anomaliesMajeures < 0) ||
    (anomaliesMineures !== undefined && anomaliesMineures < 0)
  ) {
    return { succes: false, message: "Le nombre d'anomalies ne peut pas être négatif" };
  }

  // Règle : Si anomalies bloquantes > 0, la recette est automatiquement bloquée
  let statutFinal = statutGlobal !== undefined ? statutGlobal : recettes[index].statutGlobal;
  const anomaliesBloquantesFinal = anomaliesBloquantes !== undefined 
    ? parseInt(anomaliesBloquantes) 
    : recettes[index].anomaliesBloquantes;

  if (aAnomaliesBloquantes(anomaliesBloquantesFinal)) {
    statutFinal = "Bloquée";
  }

  // Mettre à jour la recette
  const recetteModifiee = {
    ...recettes[index],
    ...(dateDebut !== undefined && { dateDebut }),
    ...(dateFin !== undefined && { dateFin: dateFin || null }),
    ...(anomaliesBloquantes !== undefined && { anomaliesBloquantes: anomaliesBloquantesFinal }),
    ...(anomaliesMajeures !== undefined && { anomaliesMajeures: parseInt(anomaliesMajeures) || 0 }),
    ...(anomaliesMineures !== undefined && { anomaliesMineures: parseInt(anomaliesMineures) || 0 }),
    statutGlobal: statutFinal,
    ...(commentairesGP !== undefined && { commentairesGP: commentairesGP.trim() }),
    dateModification: new Date().toISOString().split('T')[0]
  };

  recettes[index] = recetteModifiee;
  sauvegarderRecettes(recettes);

  return { 
    succes: true, 
    message: "Recette mise à jour avec succès" + (statutFinal === "Bloquée" && recettes[index].statutGlobal !== "Bloquée" ? " (bloquée automatiquement à cause d'anomalies bloquantes)" : ""), 
    recette: recetteModifiee 
  };
};

// Supprimer une recette
export const supprimerRecette = (id) => {
  const recettes = chargerRecettes();
  const index = recettes.findIndex((r) => r.id === id);

  if (index === -1) {
    return { succes: false, message: "Recette introuvable" };
  }

  recettes.splice(index, 1);
  sauvegarderRecettes(recettes);

  return { succes: true, message: "Recette supprimée avec succès" };
};

// Obtenir une recette par ID
export const obtenirRecette = (id) => {
  const recettes = chargerRecettes();
  return recettes.find((r) => r.id === id);
};
