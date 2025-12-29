// Fichier pour gérer la base de données des UAT
import donneesInitiales from './uat.json';
import { chargerRecettes } from './gestionRecettes';

const CLE_STORAGE = "uatJulee";

// Statuts possibles pour l'UAT
export const STATUTS_UAT = ["Accepté", "Accepté avec réserve", "Refusé"];

// Charger les UAT depuis localStorage ou le fichier JSON initial
export const chargerUAT = () => {
  const donneesStockees = localStorage.getItem(CLE_STORAGE);
  
  if (donneesStockees) {
    return JSON.parse(donneesStockees);
  } else {
    const uatInitiales = donneesInitiales.uat || [];
    sauvegarderUAT(uatInitiales);
    return uatInitiales;
  }
};

// Sauvegarder les UAT dans localStorage
const sauvegarderUAT = (uat) => {
  localStorage.setItem(CLE_STORAGE, JSON.stringify(uat));
};

// Vérifier si la recette interne est 100% OK (règle de gestion)
export const recetteInterneEstOK = () => {
  const recettes = chargerRecettes();
  
  // S'il n'y a pas de recette, on ne peut pas commencer l'UAT
  if (recettes.length === 0) {
    return { 
      estOK: false, 
      message: "Aucune recette interne trouvée. Vous devez d'abord créer et valider une recette interne." 
    };
  }
  
  // Vérifier qu'il existe au moins une recette avec le statut "OK"
  const recetteOK = recettes.find(r => r.statutGlobal === "OK");
  
  if (!recetteOK) {
    return { 
      estOK: false, 
      message: "La recette interne doit être 100% OK (statut = 'OK') avant de pouvoir commencer l'UAT. Actuellement, aucune recette n'est au statut OK." 
    };
  }
  
  // Vérifier qu'il n'y a pas d'anomalies bloquantes dans la recette OK
  if (recetteOK.anomaliesBloquantes > 0) {
    return { 
      estOK: false, 
      message: "La recette interne ne peut pas être OK si elle contient des anomalies bloquantes." 
    };
  }
  
  return { 
    estOK: true, 
    message: "La recette interne est OK, vous pouvez commencer l'UAT.",
    recetteOK: recetteOK
  };
};

// Créer une nouvelle UAT
export const creerUAT = (donneesUAT) => {
  // Règle de gestion : L'UAT ne peut commencer que si la recette interne est 100% OK
  const validationRecette = recetteInterneEstOK();
  if (!validationRecette.estOK) {
    return { succes: false, message: validationRecette.message };
  }

  const uatList = chargerUAT();
  
  const {
    dateDebutUAT,
    dateFinUAT,
    statutUAT = "",
    nombreRetoursUAT = 0,
    reservesMetier = "",
    commentaireUAT = "",
    signatureValidationClient = "",
    planAction = ""
  } = donneesUAT;

  // Validation des champs obligatoires
  if (!dateDebutUAT) {
    return { succes: false, message: "La date de début UAT est obligatoire" };
  }

  if (!dateFinUAT) {
    return { succes: false, message: "La date de fin UAT est obligatoire" };
  }

  // Validation : la date de fin doit être après la date de début
  if (new Date(dateFinUAT) < new Date(dateDebutUAT)) {
    return { succes: false, message: "La date de fin UAT doit être postérieure à la date de début" };
  }

  if (!statutUAT) {
    return { succes: false, message: "Le statut UAT est obligatoire" };
  }

  // Règle : Si refus → un plan d'action doit être créé par le GP
  if (statutUAT === "Refusé" && !planAction.trim()) {
    return { 
      succes: false, 
      message: "Un plan d'action est obligatoire lorsque le statut UAT est 'Refusé'" 
    };
  }

  // Validation du nombre de retours (doit être >= 0)
  if (nombreRetoursUAT < 0) {
    return { succes: false, message: "Le nombre de retours UAT ne peut pas être négatif" };
  }

  // Générer un nouvel ID
  const nouvelId = uatList.length > 0 
    ? Math.max(...uatList.map((u) => u.id)) + 1 
    : 1;

  const dateCreation = new Date().toISOString().split('T')[0];

  const nouvelleUAT = {
    id: nouvelId,
    dateDebutUAT: dateDebutUAT,
    dateFinUAT: dateFinUAT,
    statutUAT: statutUAT,
    nombreRetoursUAT: parseInt(nombreRetoursUAT) || 0,
    reservesMetier: reservesMetier.trim(),
    commentaireUAT: commentaireUAT.trim(),
    signatureValidationClient: signatureValidationClient.trim(),
    planAction: planAction.trim(),
    dateCreation: dateCreation,
    dateModification: dateCreation,
    recetteInterneId: validationRecette.recetteOK.id // Lier à la recette interne OK
  };

  uatList.push(nouvelleUAT);
  sauvegarderUAT(uatList);

  return { 
    succes: true, 
    message: "UAT créée avec succès", 
    uat: nouvelleUAT 
  };
};

// Mettre à jour une UAT
export const mettreAJourUAT = (id, donneesUAT) => {
  const uatList = chargerUAT();
  const index = uatList.findIndex((u) => u.id === id);

  if (index === -1) {
    return { succes: false, message: "UAT introuvable" };
  }

  const {
    dateDebutUAT,
    dateFinUAT,
    statutUAT,
    nombreRetoursUAT,
    reservesMetier,
    commentaireUAT,
    signatureValidationClient,
    planAction
  } = donneesUAT;

  // Validation de la date de début
  if (dateDebutUAT !== undefined && !dateDebutUAT) {
    return { succes: false, message: "La date de début UAT est obligatoire" };
  }

  // Validation de la date de fin
  if (dateFinUAT !== undefined && !dateFinUAT) {
    return { succes: false, message: "La date de fin UAT est obligatoire" };
  }

  // Validation : la date de fin doit être après la date de début
  const dateDebut = dateDebutUAT !== undefined ? dateDebutUAT : uatList[index].dateDebutUAT;
  const dateFin = dateFinUAT !== undefined ? dateFinUAT : uatList[index].dateFinUAT;
  
  if (new Date(dateFin) < new Date(dateDebut)) {
    return { succes: false, message: "La date de fin UAT doit être postérieure à la date de début" };
  }

  // Règle : Si refus → un plan d'action doit être créé par le GP
  const statutFinal = statutUAT !== undefined ? statutUAT : uatList[index].statutUAT;
  const planActionFinal = planAction !== undefined ? planAction : uatList[index].planAction;
  
  if (statutFinal === "Refusé" && !planActionFinal.trim()) {
    return { 
      succes: false, 
      message: "Un plan d'action est obligatoire lorsque le statut UAT est 'Refusé'" 
    };
  }

  // Validation du nombre de retours
  if (nombreRetoursUAT !== undefined && nombreRetoursUAT < 0) {
    return { succes: false, message: "Le nombre de retours UAT ne peut pas être négatif" };
  }

  // Mettre à jour l'UAT
  const uatModifiee = {
    ...uatList[index],
    ...(dateDebutUAT !== undefined && { dateDebutUAT }),
    ...(dateFinUAT !== undefined && { dateFinUAT }),
    ...(statutUAT !== undefined && { statutUAT: statutFinal }),
    ...(nombreRetoursUAT !== undefined && { nombreRetoursUAT: parseInt(nombreRetoursUAT) || 0 }),
    ...(reservesMetier !== undefined && { reservesMetier: reservesMetier.trim() }),
    ...(commentaireUAT !== undefined && { commentaireUAT: commentaireUAT.trim() }),
    ...(signatureValidationClient !== undefined && { signatureValidationClient: signatureValidationClient.trim() }),
    ...(planAction !== undefined && { planAction: planActionFinal }),
    dateModification: new Date().toISOString().split('T')[0]
  };

  uatList[index] = uatModifiee;
  sauvegarderUAT(uatList);

  return { 
    succes: true, 
    message: "UAT mise à jour avec succès", 
    uat: uatModifiee 
  };
};

// Supprimer une UAT
export const supprimerUAT = (id) => {
  const uatList = chargerUAT();
  const index = uatList.findIndex((u) => u.id === id);

  if (index === -1) {
    return { succes: false, message: "UAT introuvable" };
  }

  uatList.splice(index, 1);
  sauvegarderUAT(uatList);

  return { succes: true, message: "UAT supprimée avec succès" };
};

// Obtenir une UAT par ID
export const obtenirUAT = (id) => {
  const uatList = chargerUAT();
  return uatList.find((u) => u.id === id);
};
