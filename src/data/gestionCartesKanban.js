// Fichier pour gérer la base de données des cartes Kanban
import donneesInitiales from "./cartesKanban.json";

// Sauvegarder les cartes dans localStorage
const sauvegarderCartes = (cartes) => {
  localStorage.setItem("cartesKanbanJulee", JSON.stringify(cartes));
};

// Charger les cartes depuis localStorage ou le fichier JSON initial
const chargerCartes = () => {
  // Vérifier si on a déjà des données dans localStorage
  const donneesStockees = localStorage.getItem("cartesKanbanJulee");

  if (donneesStockees) {
    // Si oui, utiliser les données de localStorage
    return JSON.parse(donneesStockees);
  } else {
    // Sinon, utiliser les données initiales du fichier JSON
    const cartesInitiales = donneesInitiales.cartes || [];
    // Sauvegarder dans localStorage pour la première fois
    sauvegarderCartes(cartesInitiales);
    return cartesInitiales;
  }
};

// Trouver une carte par ID
const trouverCarteParId = (id) => {
  const cartes = chargerCartes();
  return cartes.find((carte) => carte.id === id);
};

// Obtenir les cartes d'une colonne
const obtenirCartesParColonne = (colonneId) => {
  const cartes = chargerCartes();
  return cartes.filter((carte) => carte.colonneId === colonneId);
};

// Valider les données d'une carte
const validerCarte = (carteData) => {
  if (!carteData.titre || carteData.titre.trim() === "") {
    return { valide: false, message: "Le titre de la carte est obligatoire" };
  }

  if (!carteData.colonneId) {
    return { valide: false, message: "La colonne est obligatoire" };
  }

  // Vérifier que la priorité est valide si fournie
  if (carteData.priorite) {
    const prioritesValides = ["Haute", "Moyenne", "Basse"];
    if (!prioritesValides.includes(carteData.priorite)) {
      return {
        valide: false,
        message: "La priorité doit être Haute, Moyenne ou Basse",
      };
    }
  }

  // Vérifier que l'estimation est positive si fournie
  if (carteData.estimation && carteData.estimation < 0) {
    return { valide: false, message: "L'estimation doit être positive" };
  }

  return { valide: true, message: "" };
};

// Créer une nouvelle carte
const creerCarte = (carteData) => {
  const cartes = chargerCartes();

  // Valider les données
  const validation = validerCarte(carteData);
  if (!validation.valide) {
    return { succes: false, message: validation.message };
  }

  // Créer la nouvelle carte
  const nouvelId =
    cartes.length > 0 ? Math.max(...cartes.map((c) => c.id)) + 1 : 1;

  const nouvelleCarte = {
    id: nouvelId,
    titre: carteData.titre.trim(),
    description: carteData.description || "",
    colonneId: carteData.colonneId,
    priorite: carteData.priorite || "Moyenne",
    estimation: carteData.estimation || null,
    assignee: carteData.assignee || null,
    tags: carteData.tags || [],
    dateCreation: new Date().toISOString(),
    dateModification: new Date().toISOString(),
  };

  cartes.push(nouvelleCarte);
  sauvegarderCartes(cartes);

  return {
    succes: true,
    message: "Carte créée avec succès",
    carte: nouvelleCarte,
  };
};

// Mettre à jour une carte
const mettreAJourCarte = (id, carteData) => {
  const cartes = chargerCartes();
  const index = cartes.findIndex((c) => c.id === id);

  if (index === -1) {
    return { succes: false, message: "Carte introuvable" };
  }

  // Valider les données
  const validation = validerCarte(carteData);
  if (!validation.valide) {
    return { succes: false, message: validation.message };
  }

  // Mettre à jour la carte
  cartes[index] = {
    ...cartes[index],
    ...carteData,
    id: id, // S'assurer que l'ID ne change pas
    dateModification: new Date().toISOString(),
  };

  sauvegarderCartes(cartes);

  return {
    succes: true,
    message: "Carte mise à jour avec succès",
    carte: cartes[index],
  };
};

// Déplacer une carte vers une autre colonne
const deplacerCarte = (id, nouvelleColonneId) => {
  const cartes = chargerCartes();
  const index = cartes.findIndex((c) => c.id === id);

  if (index === -1) {
    return { succes: false, message: "Carte introuvable" };
  }

  // Mettre à jour la colonne de la carte
  cartes[index].colonneId = nouvelleColonneId;
  cartes[index].dateModification = new Date().toISOString();

  sauvegarderCartes(cartes);

  return {
    succes: true,
    message: "Carte déplacée avec succès",
    carte: cartes[index],
  };
};

// Supprimer une carte
const supprimerCarte = (id) => {
  const cartes = chargerCartes();
  const index = cartes.findIndex((c) => c.id === id);

  if (index === -1) {
    return { succes: false, message: "Carte introuvable" };
  }

  // Supprimer la carte
  cartes.splice(index, 1);
  sauvegarderCartes(cartes);

  return { succes: true, message: "Carte supprimée avec succès" };
};

// Obtenir les statistiques des cartes
const obtenirStatistiques = () => {
  const cartes = chargerCartes();

  const stats = {
    total: cartes.length,
    parColonne: {},
    parPriorite: {
      Haute: 0,
      Moyenne: 0,
      Basse: 0,
    },
    estimationTotale: 0,
  };

  cartes.forEach((carte) => {
    // Compter par colonne
    if (!stats.parColonne[carte.colonneId]) {
      stats.parColonne[carte.colonneId] = 0;
    }
    stats.parColonne[carte.colonneId]++;

    // Compter par priorité
    if (stats.parPriorite[carte.priorite] !== undefined) {
      stats.parPriorite[carte.priorite]++;
    }

    // Calculer l'estimation totale
    if (carte.estimation) {
      stats.estimationTotale += carte.estimation;
    }
  });

  return stats;
};

// Exporter les fonctions
export {
  chargerCartes,
  sauvegarderCartes,
  trouverCarteParId,
  obtenirCartesParColonne,
  validerCarte,
  creerCarte,
  mettreAJourCarte,
  deplacerCarte,
  supprimerCarte,
  obtenirStatistiques,
};
