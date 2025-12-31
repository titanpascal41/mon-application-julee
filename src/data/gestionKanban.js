// Fichier pour gérer la base de données du Kanban
import donneesInitiales from "./kanban.json";

// Sauvegarder le kanban dans localStorage
const sauvegarderKanban = (kanban) => {
  localStorage.setItem("kanbanJulee", JSON.stringify(kanban));
};

// Charger le kanban depuis localStorage ou le fichier JSON initial
const chargerKanban = () => {
  // Vérifier si on a déjà des données dans localStorage
  const donneesStockees = localStorage.getItem("kanbanJulee");

  if (donneesStockees) {
    // Si oui, utiliser les données de localStorage
    return JSON.parse(donneesStockees);
  } else {
    // Sinon, utiliser les données initiales du fichier JSON
    const kanbanInitial = donneesInitiales.kanban || null;
    // Sauvegarder dans localStorage pour la première fois
    if (kanbanInitial) {
      sauvegarderKanban(kanbanInitial);
    }
    return kanbanInitial;
  }
};

// Obtenir les colonnes du kanban
const obtenirColonnes = () => {
  const kanban = chargerKanban();
  return kanban ? kanban.colonnes || [] : [];
};

// Trouver une colonne par ID
const trouverColonneParId = (id) => {
  const colonnes = obtenirColonnes();
  return colonnes.find((colonne) => colonne.id === id);
};

// Valider les données d'une colonne
const validerColonne = (colonneData) => {
  if (!colonneData.nom || colonneData.nom.trim() === "") {
    return { valide: false, message: "Le nom de la colonne est obligatoire" };
  }

  if (colonneData.ordre && colonneData.ordre < 0) {
    return { valide: false, message: "L'ordre doit être positif" };
  }

  if (colonneData.limiteCartes && colonneData.limiteCartes < 0) {
    return { valide: false, message: "La limite de cartes doit être positive" };
  }

  return { valide: true, message: "" };
};

// Créer une nouvelle colonne
const creerColonne = (colonneData) => {
  const kanban = chargerKanban();

  if (!kanban) {
    return { succes: false, message: "Le kanban n'existe pas" };
  }

  // Valider les données
  const validation = validerColonne(colonneData);
  if (!validation.valide) {
    return { succes: false, message: validation.message };
  }

  // Créer la nouvelle colonne
  const colonnes = kanban.colonnes || [];
  const nouvelId =
    colonnes.length > 0 ? Math.max(...colonnes.map((c) => c.id)) + 1 : 1;

  const nouvelleColonne = {
    id: nouvelId,
    nom: colonneData.nom.trim(),
    ordre:
      colonneData.ordre !== undefined ? colonneData.ordre : colonnes.length + 1,
    limiteCartes: colonneData.limiteCartes || null,
    couleur: colonneData.couleur || "#3498db",
  };

  colonnes.push(nouvelleColonne);
  kanban.colonnes = colonnes;
  kanban.dateModification = new Date().toISOString();

  sauvegarderKanban(kanban);

  return {
    succes: true,
    message: "Colonne créée avec succès",
    colonne: nouvelleColonne,
  };
};

// Mettre à jour une colonne
const mettreAJourColonne = (id, colonneData) => {
  const kanban = chargerKanban();

  if (!kanban) {
    return { succes: false, message: "Le kanban n'existe pas" };
  }

  const colonnes = kanban.colonnes || [];
  const index = colonnes.findIndex((c) => c.id === id);

  if (index === -1) {
    return { succes: false, message: "Colonne introuvable" };
  }

  // Valider les données
  const validation = validerColonne(colonneData);
  if (!validation.valide) {
    return { succes: false, message: validation.message };
  }

  // Mettre à jour la colonne
  colonnes[index] = {
    ...colonnes[index],
    ...colonneData,
    id: id, // S'assurer que l'ID ne change pas
  };

  kanban.colonnes = colonnes;
  kanban.dateModification = new Date().toISOString();

  sauvegarderKanban(kanban);

  return {
    succes: true,
    message: "Colonne mise à jour avec succès",
    colonne: colonnes[index],
  };
};

// Supprimer une colonne
const supprimerColonne = (id) => {
  const kanban = chargerKanban();

  if (!kanban) {
    return { succes: false, message: "Le kanban n'existe pas" };
  }

  const colonnes = kanban.colonnes || [];
  const index = colonnes.findIndex((c) => c.id === id);

  if (index === -1) {
    return { succes: false, message: "Colonne introuvable" };
  }

  // Supprimer la colonne
  colonnes.splice(index, 1);
  kanban.colonnes = colonnes;
  kanban.dateModification = new Date().toISOString();

  sauvegarderKanban(kanban);

  return { succes: true, message: "Colonne supprimée avec succès" };
};

// Mettre à jour la configuration du kanban
const mettreAJourConfiguration = (configData) => {
  const kanban = chargerKanban();

  if (!kanban) {
    return { succes: false, message: "Le kanban n'existe pas" };
  }

  kanban.nom = configData.nom || kanban.nom;
  kanban.description =
    configData.description !== undefined
      ? configData.description
      : kanban.description;
  kanban.dateModification = new Date().toISOString();

  sauvegarderKanban(kanban);

  return {
    succes: true,
    message: "Configuration mise à jour avec succès",
    kanban: kanban,
  };
};

// Exporter les fonctions
export {
  chargerKanban,
  sauvegarderKanban,
  obtenirColonnes,
  trouverColonneParId,
  validerColonne,
  creerColonne,
  mettreAJourColonne,
  supprimerColonne,
  mettreAJourConfiguration,
};
