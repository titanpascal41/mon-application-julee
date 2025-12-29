// Fichier pour gérer la base de données des livraisons
import donneesInitiales from './livraisons.json';

const CLE_STORAGE = "livraisonsJulee";

// Statuts possibles pour la livraison
export const STATUTS_LIVRAISON = ["Prévue", "En cours", "OK", "KO"];

// Charger les livraisons depuis localStorage ou le fichier JSON initial
export const chargerLivraisons = () => {
  const donneesStockees = localStorage.getItem(CLE_STORAGE);
  
  if (donneesStockees) {
    return JSON.parse(donneesStockees);
  } else {
    const livraisonsInitiales = donneesInitiales.livraisons || [];
    sauvegarderLivraisons(livraisonsInitiales);
    return livraisonsInitiales;
  }
};

// Sauvegarder les livraisons dans localStorage
const sauvegarderLivraisons = (livraisons) => {
  localStorage.setItem(CLE_STORAGE, JSON.stringify(livraisons));
};

// Vérifier si le comité GO/NO GO a validé la version (règle de gestion)
// Pour l'instant, on considère qu'une UAT acceptée = validation GO/NO GO
export const comiteGONOGOValide = () => {
  // Cette fonction peut être étendue pour vérifier un comité spécifique
  // Pour l'instant, on retourne true par défaut, mais on peut ajouter une vérification
  // basée sur les UAT acceptées ou un autre mécanisme
  return { 
    estValide: true, 
    message: "Le comité GO/NO GO a validé la version" 
  };
};

// Créer une nouvelle livraison
export const creerLivraison = (donneesLivraison) => {
  // Règle de gestion : La livraison ne peut être faite que si le comité GO/NO GO a validé
  const validationComite = comiteGONOGOValide();
  if (!validationComite.estValide) {
    return { succes: false, message: validationComite.message };
  }

  const livraisons = chargerLivraisons();
  
  const {
    numeroVersion,
    releaseNotes = "",
    dateLivraisonPrevue,
    dateLivraisonEffective = "",
    dateDeploiement = "",
    responsableDevOps = "",
    statutLivraison = "Prévue",
    commentairesGP = "",
    validationGONOGO = false
  } = donneesLivraison;

  // Validation des champs obligatoires
  if (!numeroVersion || !numeroVersion.trim()) {
    return { succes: false, message: "Le numéro de version est obligatoire" };
  }

  if (!dateLivraisonPrevue) {
    return { succes: false, message: "La date de livraison prévue est obligatoire" };
  }

  // Vérifier que le numéro de version n'existe pas déjà
  const versionExiste = livraisons.some(l => l.numeroVersion === numeroVersion.trim());
  if (versionExiste) {
    return { succes: false, message: "Une livraison avec ce numéro de version existe déjà" };
  }

  // Générer un nouvel ID
  const nouvelId = livraisons.length > 0 
    ? Math.max(...livraisons.map((l) => l.id)) + 1 
    : 1;

  const dateCreation = new Date().toISOString().split('T')[0];

  const nouvelleLivraison = {
    id: nouvelId,
    numeroVersion: numeroVersion.trim(),
    releaseNotes: releaseNotes.trim(),
    dateLivraisonPrevue: dateLivraisonPrevue,
    dateLivraisonEffective: dateLivraisonEffective || null,
    dateDeploiement: dateDeploiement || null,
    responsableDevOps: responsableDevOps.trim(),
    statutLivraison: statutLivraison,
    commentairesGP: commentairesGP.trim(),
    validationGONOGO: validationGONOGO,
    dateCreation: dateCreation,
    dateModification: dateCreation
  };

  livraisons.push(nouvelleLivraison);
  sauvegarderLivraisons(livraisons);

  return { 
    succes: true, 
    message: "Livraison créée avec succès", 
    livraison: nouvelleLivraison 
  };
};

// Mettre à jour une livraison
export const mettreAJourLivraison = (id, donneesLivraison) => {
  const livraisons = chargerLivraisons();
  const index = livraisons.findIndex((l) => l.id === id);

  if (index === -1) {
    return { succes: false, message: "Livraison introuvable" };
  }

  const {
    numeroVersion,
    releaseNotes,
    dateLivraisonPrevue,
    dateLivraisonEffective,
    dateDeploiement,
    responsableDevOps,
    statutLivraison,
    commentairesGP,
    validationGONOGO
  } = donneesLivraison;

  // Validation du numéro de version
  if (numeroVersion !== undefined && (!numeroVersion || !numeroVersion.trim())) {
    return { succes: false, message: "Le numéro de version est obligatoire" };
  }

  // Vérifier que le numéro de version n'existe pas déjà (sauf pour la livraison actuelle)
  if (numeroVersion !== undefined) {
    const versionExiste = livraisons.some(l => 
      l.numeroVersion === numeroVersion.trim() && l.id !== id
    );
    if (versionExiste) {
      return { succes: false, message: "Une livraison avec ce numéro de version existe déjà" };
    }
  }

  // Validation de la date de livraison prévue
  if (dateLivraisonPrevue !== undefined && !dateLivraisonPrevue) {
    return { succes: false, message: "La date de livraison prévue est obligatoire" };
  }

  // Règle : En cas d'échec de déploiement (statut KO) → rollback automatique prévu
  const statutFinal = statutLivraison !== undefined ? statutLivraison : livraisons[index].statutLivraison;
  let rollbackAutomatique = false;
  if (statutFinal === "KO") {
    rollbackAutomatique = true;
  }

  // Mettre à jour la livraison
  const livraisonModifiee = {
    ...livraisons[index],
    ...(numeroVersion !== undefined && { numeroVersion: numeroVersion.trim() }),
    ...(releaseNotes !== undefined && { releaseNotes: releaseNotes.trim() }),
    ...(dateLivraisonPrevue !== undefined && { dateLivraisonPrevue }),
    ...(dateLivraisonEffective !== undefined && { dateLivraisonEffective: dateLivraisonEffective || null }),
    ...(dateDeploiement !== undefined && { dateDeploiement: dateDeploiement || null }),
    ...(responsableDevOps !== undefined && { responsableDevOps: responsableDevOps.trim() }),
    ...(statutLivraison !== undefined && { statutLivraison: statutFinal }),
    ...(commentairesGP !== undefined && { commentairesGP: commentairesGP.trim() }),
    ...(validationGONOGO !== undefined && { validationGONOGO }),
    rollbackAutomatique: rollbackAutomatique,
    dateModification: new Date().toISOString().split('T')[0]
  };

  livraisons[index] = livraisonModifiee;
  sauvegarderLivraisons(livraisons);

  return { 
    succes: true, 
    message: "Livraison mise à jour avec succès" + (rollbackAutomatique ? " (rollback automatique prévu)" : ""), 
    livraison: livraisonModifiee 
  };
};

// Supprimer une livraison
export const supprimerLivraison = (id) => {
  const livraisons = chargerLivraisons();
  const index = livraisons.findIndex((l) => l.id === id);

  if (index === -1) {
    return { succes: false, message: "Livraison introuvable" };
  }

  livraisons.splice(index, 1);
  sauvegarderLivraisons(livraisons);

  return { succes: true, message: "Livraison supprimée avec succès" };
};

// Obtenir une livraison par ID
export const obtenirLivraison = (id) => {
  const livraisons = chargerLivraisons();
  return livraisons.find((l) => l.id === id);
};
