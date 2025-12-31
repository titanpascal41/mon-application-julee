// Gestion des ressources DEV et TIV

// Structure des données pour les ressources
/*
{
  id: number,
  nom: string,
  type: "DEV" | "TIV",
  disponibiliteHJ: number, // Homme/Jour
  tauxJournalier: number, // TJM
  actif: boolean
}
*/

// Stockage local des ressources
const cleStockageRessources = "ressources_dev_tiv";

// Fonction utilitaire pour obtenir les ressources depuis le localStorage
const chargerRessourcesDepuisStockage = () => {
  try {
    const ressourcesStockees = localStorage.getItem(cleStockageRessources);
    return ressourcesStockees ? JSON.parse(ressourcesStockees) : [];
  } catch (error) {
    console.error("Erreur lors du chargement des ressources:", error);
    return [];
  }
};

// Fonction utilitaire pour sauvegarder les ressources dans le localStorage
const sauvegarderRessourcesDansStockage = (ressources) => {
  try {
    localStorage.setItem(cleStockageRessources, JSON.stringify(ressources));
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des ressources:", error);
  }
};

// Charger toutes les ressources
export const chargerRessources = () => {
  return chargerRessourcesDepuisStockage();
};

// Créer une nouvelle ressource
export const creerRessource = (ressourceData) => {
  const ressources = chargerRessourcesDepuisStockage();

  // Validation des données
  if (!ressourceData.nom || !ressourceData.nom.trim()) {
    return { succes: false, message: "Le nom de la ressource est obligatoire." };
  }

  if (!ressourceData.type || !["DEV", "TIV"].includes(ressourceData.type)) {
    return { succes: false, message: "Le type de ressource doit être DEV ou TIV." };
  }

  if (!ressourceData.disponibiliteHJ || ressourceData.disponibiliteHJ <= 0) {
    return { succes: false, message: "La disponibilité doit être supérieure à 0." };
  }

  if (!ressourceData.tauxJournalier || ressourceData.tauxJournalier <= 0) {
    return { succes: false, message: "Le taux journalier doit être supérieur à 0." };
  }

  // Vérifier si le nom existe déjà
  const ressourceExistante = ressources.find(
    r => r.nom.toLowerCase() === ressourceData.nom.trim().toLowerCase()
  );

  if (ressourceExistante) {
    return { succes: false, message: "Une ressource avec ce nom existe déjà." };
  }

  // Créer la nouvelle ressource
  const nouvelleRessource = {
    id: Date.now(), // Utilisation du timestamp comme ID unique
    nom: ressourceData.nom.trim(),
    type: ressourceData.type,
    disponibiliteHJ: parseFloat(ressourceData.disponibiliteHJ),
    tauxJournalier: parseFloat(ressourceData.tauxJournalier),
    actif: ressourceData.actif !== undefined ? ressourceData.actif : true
  };

  ressources.push(nouvelleRessource);
  sauvegarderRessourcesDansStockage(ressources);

  return { succes: true, message: "Ressource créée avec succès.", ressource: nouvelleRessource };
};

// Mettre à jour une ressource existante
export const mettreAJourRessource = (id, ressourceData) => {
  const ressources = chargerRessourcesDepuisStockage();
  const index = ressources.findIndex(r => r.id === id);

  if (index === -1) {
    return { succes: false, message: "Ressource introuvable." };
  }

  // Validation des données
  if (!ressourceData.nom || !ressourceData.nom.trim()) {
    return { succes: false, message: "Le nom de la ressource est obligatoire." };
  }

  if (!ressourceData.type || !["DEV", "TIV"].includes(ressourceData.type)) {
    return { succes: false, message: "Le type de ressource doit être DEV ou TIV." };
  }

  if (!ressourceData.disponibiliteHJ || ressourceData.disponibiliteHJ <= 0) {
    return { succes: false, message: "La disponibilité doit être supérieure à 0." };
  }

  if (!ressourceData.tauxJournalier || ressourceData.tauxJournalier <= 0) {
    return { succes: false, message: "Le taux journalier doit être supérieur à 0." };
  }

  // Vérifier si le nom existe déjà (sauf pour la ressource actuelle)
  const ressourceExistante = ressources.find(
    r => r.id !== id && r.nom.toLowerCase() === ressourceData.nom.trim().toLowerCase()
  );

  if (ressourceExistante) {
    return { succes: false, message: "Une ressource avec ce nom existe déjà." };
  }

  // Mettre à jour la ressource
  ressources[index] = {
    ...ressources[index],
    nom: ressourceData.nom.trim(),
    type: ressourceData.type,
    disponibiliteHJ: parseFloat(ressourceData.disponibiliteHJ),
    tauxJournalier: parseFloat(ressourceData.tauxJournalier),
    actif: ressourceData.actif !== undefined ? ressourceData.actif : ressources[index].actif
  };

  sauvegarderRessourcesDansStockage(ressources);

  return { succes: true, message: "Ressource mise à jour avec succès.", ressource: ressources[index] };
};

// Supprimer une ressource
export const supprimerRessource = (id) => {
  const ressources = chargerRessourcesDepuisStockage();
  const index = ressources.findIndex(r => r.id === id);

  if (index === -1) {
    return { succes: false, message: "Ressource introuvable." };
  }

  ressources.splice(index, 1);
  sauvegarderRessourcesDansStockage(ressources);

  return { succes: true, message: "Ressource supprimée avec succès." };
};

// Obtenir les ressources par type
export const getRessourcesParType = (type) => {
  const ressources = chargerRessourcesDepuisStockage();
  return ressources.filter(r => r.type === type && r.actif);
};

// Obtenir toutes les ressources actives
export const getRessourcesActives = () => {
  const ressources = chargerRessourcesDepuisStockage();
  return ressources.filter(r => r.actif);
};
