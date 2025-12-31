// Fichier pour gérer la base de données des bugs
import donneesInitiales from './bugs.json';
import { chargerUtilisateurs } from './baseDeDonnees';

// Sauvegarder les bugs dans localStorage
const sauvegarderBugs = (bugs) => {
  localStorage.setItem("bugsJulee", JSON.stringify(bugs));
};

// Charger les bugs depuis localStorage ou le fichier JSON initial
const chargerBugs = () => {
  // Vérifier si on a déjà des données dans localStorage
  const donneesStockees = localStorage.getItem("bugsJulee");
  
  if (donneesStockees) {
    // Si oui, utiliser les données de localStorage
    return JSON.parse(donneesStockees);
  } else {
    // Sinon, utiliser les données initiales du fichier JSON
    const bugsInitiaux = donneesInitiales.bugs || [];
    // Sauvegarder dans localStorage pour la première fois
    sauvegarderBugs(bugsInitiaux);
    return bugsInitiaux;
  }
};

// Trouver un bug par ID
const trouverBugParId = (id) => {
  const bugs = chargerBugs();
  return bugs.find((bug) => bug.id === id);
};

// Valider les données d'un bug
const validerBug = (bugData) => {
  // Vérifier les champs obligatoires
  if (!bugData.descriptionCourte || bugData.descriptionCourte.trim() === "") {
    return { valide: false, message: "La description courte est obligatoire" };
  }
  
  if (!bugData.severite || bugData.severite === "") {
    return { valide: false, message: "La sévérité est obligatoire" };
  }
  
  if (!bugData.moduleImpacte || bugData.moduleImpacte === "") {
    return { valide: false, message: "Le module impacté est obligatoire" };
  }
  
  // Vérifier que la sévérité est valide
  const severitesValides = ["Bloquant", "Majeur", "Mineur"];
  if (!severitesValides.includes(bugData.severite)) {
    return { valide: false, message: "La sévérité doit être Bloquant, Majeur ou Mineur" };
  }
  
  // Vérifier que la priorité est valide si fournie
  if (bugData.priorite) {
    const prioritesValides = ["Haute", "Moyenne", "Basse"];
    if (!prioritesValides.includes(bugData.priorite)) {
      return { valide: false, message: "La priorité doit être Haute, Moyenne ou Basse" };
    }
  }
  
  return { valide: true, message: "" };
};

// Créer un nouveau bug
const creerBug = (bugData) => {
  const bugs = chargerBugs();
  
  // Valider les données
  const validation = validerBug(bugData);
  if (!validation.valide) {
    return { succes: false, message: validation.message };
  }
  
  // Créer le nouveau bug
  const nouvelId = bugs.length > 0 
    ? Math.max(...bugs.map(b => b.id)) + 1 
    : 1;
  
  const nouveauBug = {
    id: nouvelId,
    dateCreation: bugData.dateCreation || new Date().toISOString(),
    declarant: bugData.declarant || "",
    descriptionCourte: bugData.descriptionCourte.trim(),
    descriptionDetaillee: bugData.descriptionDetaillee || "",
    fonctionnaliteImpactee: bugData.fonctionnaliteImpactee || "",
    moduleImpacte: bugData.moduleImpacte,
    severite: bugData.severite,
    priorite: bugData.priorite || "Moyenne",
    statut: "Ouvert",
    captureEcran: bugData.captureEcran || null,
    dateModification: new Date().toISOString()
  };
  
  bugs.push(nouveauBug);
  sauvegarderBugs(bugs);
  
  return { succes: true, message: "Bug déclaré avec succès", bug: nouveauBug };
};

// Mettre à jour un bug
const mettreAJourBug = (id, bugData) => {
  const bugs = chargerBugs();
  const index = bugs.findIndex((b) => b.id === id);
  
  if (index === -1) {
    return { succes: false, message: "Bug introuvable" };
  }
  
  // Valider les données
  const validation = validerBug(bugData);
  if (!validation.valide) {
    return { succes: false, message: validation.message };
  }
  
  // Mettre à jour le bug
  bugs[index] = {
    ...bugs[index],
    ...bugData,
    dateModification: new Date().toISOString()
  };
  
  sauvegarderBugs(bugs);
  
  return { succes: true, message: "Bug mis à jour avec succès", bug: bugs[index] };
};

// Supprimer un bug
const supprimerBug = (id) => {
  const bugs = chargerBugs();
  const index = bugs.findIndex((b) => b.id === id);
  
  if (index === -1) {
    return { succes: false, message: "Bug introuvable" };
  }
  
  // Supprimer le bug
  bugs.splice(index, 1);
  sauvegarderBugs(bugs);
  
  return { succes: true, message: "Bug supprimé avec succès" };
};

// Exporter les fonctions
export {
  chargerBugs,
  sauvegarderBugs,
  trouverBugParId,
  validerBug,
  creerBug,
  mettreAJourBug,
  supprimerBug
};

