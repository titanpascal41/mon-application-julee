// Fichier pour gérer la base de données des unités organisationnelles
import donneesInitiales from './unitesOrganisationnelles.json';
import { chargerUtilisateurs } from './baseDeDonnees';
import { chargerSocietes } from './societes';

const CLE_STORAGE = "unitesOrganisationnellesJulee";

// Charger les UO depuis localStorage ou le fichier JSON initial
const chargerUO = () => {
  const donneesStockees = localStorage.getItem(CLE_STORAGE);
  
  if (donneesStockees) {
    return JSON.parse(donneesStockees);
  } else {
    const uoInitiales = donneesInitiales.unitesOrganisationnelles || [];
    sauvegarderUO(uoInitiales);
    return uoInitiales;
  }
};

// Sauvegarder les UO dans localStorage
const sauvegarderUO = (uo) => {
  localStorage.setItem(CLE_STORAGE, JSON.stringify(uo));
};

// Vérifier si une UO a des utilisateurs
const uoContientUtilisateurs = (uoId) => {
  const utilisateurs = chargerUtilisateurs();
  return utilisateurs.some((u) => u.uoId === uoId);
};

// Créer une nouvelle UO
const creerUO = ({ nom, type, adresse, codePostal, actif, societeId, uoParenteId }) => {
  const uoList = chargerUO();

  // Vérifier que tous les champs obligatoires sont remplis
  if (!nom || !type || !adresse || !codePostal || societeId === null || societeId === undefined || societeId === "") {
    return { succes: false, message: "Tous les champs obligatoires doivent être remplis" };
  }

  // Vérifier la longueur du nom (max 100 caractères)
  if (nom.length > 100) {
    return { succes: false, message: "Le nom de l'UO ne doit pas dépasser 100 caractères" };
  }

  // Vérifier que la société existe
  const societes = chargerSocietes();
  const societeExiste = societes.some((s) => s.id === parseInt(societeId));
  if (!societeExiste) {
    return { succes: false, message: "La société sélectionnée n'existe pas" };
  }

  // Vérifier que l'UO parente existe si elle est fournie
  if (uoParenteId && uoParenteId !== "") {
    const uoParenteExiste = uoList.some((uo) => uo.id === parseInt(uoParenteId));
    if (!uoParenteExiste) {
      return { succes: false, message: "L'UO parente sélectionnée n'existe pas" };
    }
    // Vérifier que l'UO parente appartient à la même société
    const uoParente = uoList.find((uo) => uo.id === parseInt(uoParenteId));
    if (uoParente.societeId !== parseInt(societeId)) {
      return { succes: false, message: "L'UO parente doit appartenir à la même société" };
    }
  }

  // Générer un nouvel ID
  const nouvelId = uoList.length > 0 ? Math.max(...uoList.map((uo) => uo.id)) + 1 : 1;

  const nouvelleUO = {
    id: nouvelId,
    nom: nom.trim(),
    type: type,
    adresse: adresse.trim(),
    codePostal: codePostal.trim(),
    actif: actif === true || actif === "true",
    societeId: parseInt(societeId),
    uoParenteId: uoParenteId && uoParenteId !== "" ? parseInt(uoParenteId) : null,
  };

  uoList.push(nouvelleUO);
  sauvegarderUO(uoList);

  return { succes: true, message: "Unité organisationnelle créée avec succès", uo: nouvelleUO };
};

// Mettre à jour une UO
const mettreAJourUO = (id, { nom, type, adresse, codePostal, actif, societeId, uoParenteId }) => {
  const uoList = chargerUO();
  const index = uoList.findIndex((uo) => uo.id === id);

  if (index === -1) {
    return { succes: false, message: "Unité organisationnelle introuvable" };
  }

  // Vérifier que tous les champs obligatoires sont remplis
  if (!nom || !type || !adresse || !codePostal || societeId === null || societeId === undefined || societeId === "") {
    return { succes: false, message: "Tous les champs obligatoires doivent être remplis" };
  }

  // Vérifier la longueur du nom (max 100 caractères)
  if (nom.length > 100) {
    return { succes: false, message: "Le nom de l'UO ne doit pas dépasser 100 caractères" };
  }

  const ancienneSocieteId = uoList[index].societeId;
  const nouvelleSocieteId = parseInt(societeId);

  // Vérifier que la société existe
  const societes = chargerSocietes();
  const societeExiste = societes.some((s) => s.id === nouvelleSocieteId);
  if (!societeExiste) {
    return { succes: false, message: "La société sélectionnée n'existe pas" };
  }

  // Si on change de société et que l'UO a des utilisateurs, interdire
  if (ancienneSocieteId !== nouvelleSocieteId && uoContientUtilisateurs(id)) {
    return {
      succes: false,
      message: "Impossible de changer la société d'une UO qui contient des utilisateurs",
    };
  }

  // Vérifier que l'UO parente existe si elle est fournie
  if (uoParenteId && uoParenteId !== "") {
    const uoParenteExiste = uoList.some((uo) => uo.id === parseInt(uoParenteId) && uo.id !== id);
    if (!uoParenteExiste) {
      return { succes: false, message: "L'UO parente sélectionnée n'existe pas" };
    }
    // Vérifier que l'UO parente appartient à la même société
    const uoParente = uoList.find((uo) => uo.id === parseInt(uoParenteId));
    if (uoParente.societeId !== nouvelleSocieteId) {
      return { succes: false, message: "L'UO parente doit appartenir à la même société" };
    }
    // Vérifier qu'on ne crée pas de boucle (une UO ne peut pas être son propre parent)
    if (parseInt(uoParenteId) === id) {
      return { succes: false, message: "Une UO ne peut pas être sa propre parente" };
    }
  }

  // Mettre à jour l'UO
  uoList[index] = {
    ...uoList[index],
    nom: nom.trim(),
    type: type,
    adresse: adresse.trim(),
    codePostal: codePostal.trim(),
    actif: actif === true || actif === "true",
    societeId: nouvelleSocieteId,
    uoParenteId: uoParenteId && uoParenteId !== "" ? parseInt(uoParenteId) : null,
  };

  sauvegarderUO(uoList);

  return { succes: true, message: "Unité organisationnelle mise à jour avec succès", uo: uoList[index] };
};

// Supprimer une UO
const supprimerUO = (id) => {
  const uoList = chargerUO();
  const index = uoList.findIndex((uo) => uo.id === id);

  if (index === -1) {
    return { succes: false, message: "Unité organisationnelle introuvable" };
  }

  // Vérifier si l'UO a des utilisateurs
  if (uoContientUtilisateurs(id)) {
    return {
      succes: false,
      message: "Impossible de supprimer une UO qui contient des utilisateurs",
    };
  }

  // Vérifier si l'UO a des UO enfants
  const uoEnfants = uoList.filter((uo) => uo.uoParenteId === id);
  if (uoEnfants.length > 0) {
    return {
      succes: false,
      message: "Impossible de supprimer une UO qui a des unités organisationnelles filles",
    };
  }

  // Supprimer l'UO
  uoList.splice(index, 1);
  sauvegarderUO(uoList);

  return { succes: true, message: "Unité organisationnelle supprimée avec succès" };
};

// Obtenir les types d'UO disponibles
const getTypesUO = () => {
  return ["Direction", "département", "service", "équipe", "filiale"];
};

// Exporter les fonctions
export {
  chargerUO,
  sauvegarderUO,
  creerUO,
  mettreAJourUO,
  supprimerUO,
  uoContientUtilisateurs,
  getTypesUO,
};

