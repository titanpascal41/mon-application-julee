// Fichier pour gérer la base de données des sociétés
import donneesInitiales from "./societes.json";
import { chargerUtilisateurs } from "./baseDeDonnees";

const CLE_STORAGE = "societesJulee";
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

// sync API helpers
const syncCreateSociete = async (societe) => {
  try {
    await fetch(`${API_BASE_URL}/societes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nom: societe.nom,
        adresse: societe.adresse,
        email: societe.email,
        telephone: societe.telephone,
        description: societe.responsable, // si besoin, adapter le mapping
      }),
    });
  } catch (e) {
    console.error("Erreur sync création société API:", e);
  }
};

const syncUpdateSociete = async (societe) => {
  try {
    await fetch(`${API_BASE_URL}/societes/${societe.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nom: societe.nom,
        adresse: societe.adresse,
        email: societe.email,
        telephone: societe.telephone,
        description: societe.responsable,
      }),
    });
  } catch (e) {
    console.error("Erreur sync mise à jour société API:", e);
  }
};

const syncDeleteSociete = async (id) => {
  try {
    await fetch(`${API_BASE_URL}/societes/${id}`, { method: "DELETE" });
  } catch (e) {
    console.error("Erreur sync suppression société API:", e);
  }
};

// Charger les sociétés depuis localStorage ou le fichier JSON initial
const chargerSocietes = () => {
  // Vérifier si on a déjà des données dans localStorage
  const donneesStockees = localStorage.getItem(CLE_STORAGE);

  if (donneesStockees) {
    // Si oui, vérifier si le tableau n'est pas vide
    const societesStockees = JSON.parse(donneesStockees);
    if (societesStockees && societesStockees.length > 0) {
      // Utiliser les données de localStorage si elles ne sont pas vides
      return societesStockees;
    }
  }

  // Sinon, utiliser les données initiales du fichier JSON
  const societesInitiales = donneesInitiales.societes || [];
  // Sauvegarder dans localStorage pour la première fois
  sauvegarderSocietes(societesInitiales);
  return societesInitiales;
};

// Sauvegarder les sociétés dans localStorage
const sauvegarderSocietes = (societes) => {
  localStorage.setItem(CLE_STORAGE, JSON.stringify(societes));
};

// Vérifier si un nom de société existe déjà (en majuscules)
const nomSocieteExiste = (nom, idExclu = null) => {
  const societes = chargerSocietes();
  const nomUpper = nom.toUpperCase().trim();
  return societes.some(
    (s) => s.nom === nomUpper && (idExclu === null || s.id !== idExclu)
  );
};

// Créer une nouvelle société (version simple avec seulement le nom)
const creerSocieteSimple = (nom) => {
  const societes = chargerSocietes();

  // Vérifier que le nom est fourni
  if (!nom || !nom.trim()) {
    return { succes: false, message: "Le nom de la société est obligatoire" };
  }

  // Convertir le nom en majuscules
  const nomUpper = nom.toUpperCase().trim();

  // Vérifier l'unicité du nom
  if (nomSocieteExiste(nomUpper)) {
    // Si la société existe déjà, retourner l'ID de la société existante
    const societeExistante = societes.find((s) => s.nom === nomUpper);
    return { succes: true, message: "Société déjà existante", societe: societeExistante };
  }

  // Générer un nouvel ID
  const nouvelId =
    societes.length > 0 ? Math.max(...societes.map((s) => s.id)) + 1 : 1;

  const nouvelleSociete = {
    id: nouvelId,
    nom: nomUpper,
    adresse: "À compléter",
    email: "À compléter",
    telephone: "À compléter",
    responsable: "À compléter",
  };

  societes.push(nouvelleSociete);
  sauvegarderSocietes(societes);

  // sync API
  syncCreateSociete(nouvelleSociete);

  return { succes: true, message: "Société créée avec succès", societe: nouvelleSociete };
};

// Créer une nouvelle société
const creerSociete = ({ nom, adresse, email, telephone, responsable }) => {
  const societes = chargerSocietes();

  // Vérifier que tous les champs sont remplis
  if (!nom || !adresse || !email || !telephone || !responsable) {
    return { succes: false, message: "Tous les champs sont obligatoires" };
  }

  // Convertir le nom en majuscules
  const nomUpper = nom.toUpperCase().trim();

  // Vérifier l'unicité du nom
  if (nomSocieteExiste(nomUpper)) {
    return { succes: false, message: "Le nom de la société doit être unique" };
  }

  // Générer un nouvel ID
  const nouvelId =
    societes.length > 0 ? Math.max(...societes.map((s) => s.id)) + 1 : 1;

  const nouvelleSociete = {
    id: nouvelId,
    nom: nomUpper,
    adresse: adresse.trim(),
    email: email.trim(),
    telephone: telephone.trim(),
    responsable: responsable.trim(),
  };

  societes.push(nouvelleSociete);
  sauvegarderSocietes(societes);

  // sync API
  syncCreateSociete(nouvelleSociete);

  return { succes: true, message: "Société créée avec succès", societe: nouvelleSociete };
};

// Mettre à jour une société
const mettreAJourSociete = (id, { nom, adresse, email, telephone, responsable }) => {
  const societes = chargerSocietes();
  const index = societes.findIndex((s) => s.id === id);

  if (index === -1) {
    return { succes: false, message: "Société introuvable" };
  }

  // Vérifier que tous les champs sont remplis
  if (!nom || !adresse || !email || !telephone || !responsable) {
    return { succes: false, message: "Tous les champs sont obligatoires" };
  }

  // Convertir le nom en majuscules
  const nomUpper = nom.toUpperCase().trim();

  // Vérifier l'unicité du nom (en excluant la société actuelle)
  if (nomSocieteExiste(nomUpper, id)) {
    return { succes: false, message: "Le nom de la société doit être unique" };
  }

  // Mettre à jour la société
  societes[index] = {
    ...societes[index],
    nom: nomUpper,
    adresse: adresse.trim(),
    email: email.trim(),
    telephone: telephone.trim(),
    responsable: responsable.trim(),
  };

  sauvegarderSocietes(societes);

  // sync API
  syncUpdateSociete(societes[index]);

  return { succes: true, message: "Société mise à jour avec succès", societe: societes[index] };
};

// Supprimer une société
const supprimerSociete = (id) => {
  const societes = chargerSocietes();
  const index = societes.findIndex((s) => s.id === id);

  if (index === -1) {
    return { succes: false, message: "Société introuvable" };
  }

  // Vérifier si la société a des utilisateurs actifs
  const utilisateurs = chargerUtilisateurs();
  // On considère qu'un utilisateur est actif s'il existe (pas de champ actif dans le JSON actuel)
  // Si vous ajoutez un champ actif plus tard, modifiez cette condition
  const utilisateursActifs = utilisateurs.filter((u) => u.societeId === id);
  
  // Pour l'instant, on vérifie simplement s'il y a des utilisateurs liés à cette société
  // Si vous voulez vérifier uniquement les actifs, ajoutez: && u.actif === true
  if (utilisateursActifs.length > 0) {
    return {
      succes: false,
      message: "Impossible de supprimer une société qui possède des utilisateurs actifs",
    };
  }

  // Supprimer la société
  const [supprime] = societes.splice(index, 1);
  sauvegarderSocietes(societes);

  if (supprime?.id != null) {
    syncDeleteSociete(supprime.id);
  }

  return { succes: true, message: "Société supprimée avec succès" };
};

// Exporter les fonctions
export {
  chargerSocietes,
  sauvegarderSocietes,
  creerSociete,
  creerSocieteSimple,
  mettreAJourSociete,
  supprimerSociete,
  nomSocieteExiste,
};

