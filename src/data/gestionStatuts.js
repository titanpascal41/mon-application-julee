// Fichier pour gérer la base de données des statuts
import donneesInitiales from './statuts.json';

const CLE_STORAGE = "statutsJulee";

// Charger les statuts depuis localStorage ou le fichier JSON initial
const chargerStatuts = () => {
  const donneesStockees = localStorage.getItem(CLE_STORAGE);
  
  if (donneesStockees) {
    return JSON.parse(donneesStockees);
  } else {
    const statutsInitiaux = donneesInitiales.statuts || [];
    sauvegarderStatuts(statutsInitiaux);
    return statutsInitiaux;
  }
};

// Sauvegarder les statuts dans localStorage
const sauvegarderStatuts = (statuts) => {
  localStorage.setItem(CLE_STORAGE, JSON.stringify(statuts));
};

// Vérifier si un nom de statut existe déjà
const nomStatutExiste = (nom, idExclu = null) => {
  const statuts = chargerStatuts();
  const nomTrim = nom.trim();
  return statuts.some(
    (s) => s.nom === nomTrim && (idExclu === null || s.id !== idExclu)
  );
};

// Vérifier si un statut est utilisé dans une demande
// Note: Pour l'instant, on vérifie dans localStorage, mais il faudra adapter selon votre structure de données des demandes
const statutEstUtilise = (statutId) => {
  // Vérifier dans les demandes stockées dans localStorage
  const demandesStockees = localStorage.getItem("demandesJulee");
  if (demandesStockees) {
    try {
      const demandes = JSON.parse(demandesStockees);
      return demandes.some((d) => d.statutId === statutId);
    } catch (e) {
      return false;
    }
  }
  return false;
};

// Créer un nouveau statut
const creerStatut = ({ nom, categorie, description, quiPeutAppliquer, actif }) => {
  const statuts = chargerStatuts();

  // Vérifier que tous les champs obligatoires sont remplis
  if (!nom || !categorie || !quiPeutAppliquer) {
    return { succes: false, message: "Le nom, la catégorie et 'Qui peut appliquer' sont obligatoires" };
  }

  // Vérifier l'unicité du nom
  if (nomStatutExiste(nom)) {
    return { succes: false, message: "Le nom du statut doit être unique" };
  }

  // Générer un nouvel ID
  const nouvelId = statuts.length > 0 ? Math.max(...statuts.map((s) => s.id)) + 1 : 1;

  const nouveauStatut = {
    id: nouvelId,
    nom: nom.trim(),
    categorie: categorie,
    description: description ? description.trim() : "",
    quiPeutAppliquer: quiPeutAppliquer,
    actif: actif === true || actif === "true",
  };

  statuts.push(nouveauStatut);
  sauvegarderStatuts(statuts);

  return { succes: true, message: "Statut créé avec succès", statut: nouveauStatut };
};

// Mettre à jour un statut
const mettreAJourStatut = (id, { nom, categorie, description, quiPeutAppliquer, actif }) => {
  const statuts = chargerStatuts();
  const index = statuts.findIndex((s) => s.id === id);

  if (index === -1) {
    return { succes: false, message: "Statut introuvable" };
  }

  // Vérifier que tous les champs obligatoires sont remplis
  if (!nom || !categorie || !quiPeutAppliquer) {
    return { succes: false, message: "Le nom, la catégorie et 'Qui peut appliquer' sont obligatoires" };
  }

  // Vérifier l'unicité du nom (en excluant le statut actuel)
  if (nomStatutExiste(nom, id)) {
    return { succes: false, message: "Le nom du statut doit être unique" };
  }

  // Mettre à jour le statut
  statuts[index] = {
    ...statuts[index],
    nom: nom.trim(),
    categorie: categorie,
    description: description ? description.trim() : "",
    quiPeutAppliquer: quiPeutAppliquer,
    actif: actif === true || actif === "true",
  };

  sauvegarderStatuts(statuts);

  return { succes: true, message: "Statut mis à jour avec succès", statut: statuts[index] };
};

// Supprimer un statut
const supprimerStatut = (id) => {
  const statuts = chargerStatuts();
  const index = statuts.findIndex((s) => s.id === id);

  if (index === -1) {
    return { succes: false, message: "Statut introuvable" };
  }

  // Vérifier si le statut est utilisé dans une demande
  if (statutEstUtilise(id)) {
    return {
      succes: false,
      message: "Impossible de supprimer un statut utilisé dans une demande",
    };
  }

  // Supprimer le statut
  statuts.splice(index, 1);
  sauvegarderStatuts(statuts);

  return { succes: true, message: "Statut supprimé avec succès" };
};

// Obtenir les catégories disponibles
const getCategories = () => {
  return ["demande", "tache", "projet"];
};

// Obtenir les options pour "Qui peut appliquer"
const getQuiPeutAppliquer = () => {
  return ["Administrateur", "gestionnaire", "tous les utilisateurs"];
};

// Exporter les fonctions
export {
  chargerStatuts,
  sauvegarderStatuts,
  creerStatut,
  mettreAJourStatut,
  supprimerStatut,
  nomStatutExiste,
  statutEstUtilise,
  getCategories,
  getQuiPeutAppliquer,
};

