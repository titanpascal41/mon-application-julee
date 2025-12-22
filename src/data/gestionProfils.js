// Fichier pour gérer la base de données des profils
import donneesInitiales from './profils.json';
import { chargerUtilisateurs } from './baseDeDonnees';

// Sauvegarder les profils dans localStorage
const sauvegarderProfils = (profils) => {
  localStorage.setItem("profilsJulee", JSON.stringify(profils));
};

// Charger les profils depuis localStorage ou le fichier JSON initial
const chargerProfils = () => {
  // Vérifier si on a déjà des données dans localStorage
  const donneesStockees = localStorage.getItem("profilsJulee");
  
  if (donneesStockees) {
    // Si oui, utiliser les données de localStorage
    return JSON.parse(donneesStockees);
  } else {
    // Sinon, utiliser les données initiales du fichier JSON
    const profilsInitiaux = donneesInitiales.profils || [];
    // Sauvegarder dans localStorage pour la première fois
    sauvegarderProfils(profilsInitiaux);
    return profilsInitiaux;
  }
};

// Trouver un profil par ID
const trouverProfilParId = (id) => {
  const profils = chargerProfils();
  return profils.find((profil) => profil.id === id);
};

// Trouver un profil par nom (pour vérifier l'unicité)
const trouverProfilParNom = (nom) => {
  const profils = chargerProfils();
  return profils.find((profil) => profil.nom === nom.toUpperCase());
};

// Vérifier si un nom de profil existe déjà
const nomProfilExiste = (nom, idExclu = null) => {
  const profil = trouverProfilParNom(nom);
  if (!profil) return false;
  // Si on modifie un profil existant, exclure son propre ID
  if (idExclu && profil.id === idExclu) return false;
  return true;
};

// Vérifier si un profil est assigné à un utilisateur
const profilEstUtilise = (profilId) => {
  const utilisateurs = chargerUtilisateurs();
  return utilisateurs.some((user) => user.profilId === profilId);
};

// Créer un nouveau profil
const creerProfil = (nom, prenom) => {
  const profils = chargerProfils();
  
  // Normaliser le nom en majuscules et le prénom en minuscules
  const nomNormalise = nom.trim().toUpperCase();
  const prenomNormalise = prenom.trim().toLowerCase();
  
  // Vérifier que les champs ne sont pas vides
  if (!nomNormalise || !prenomNormalise) {
    return { succes: false, message: "Le nom et le prénom sont obligatoires" };
  }
  
  // Vérifier si le nom existe déjà
  if (nomProfilExiste(nomNormalise)) {
    return { succes: false, message: "Un profil avec ce nom existe déjà" };
  }
  
  // Créer le nouveau profil
  const nouvelId = profils.length > 0 
    ? Math.max(...profils.map(p => p.id)) + 1 
    : 1;
  
  const nouveauProfil = {
    id: nouvelId,
    nom: nomNormalise,
    prenom: prenomNormalise
  };
  
  profils.push(nouveauProfil);
  sauvegarderProfils(profils);
  
  return { succes: true, message: "Profil créé avec succès", profil: nouveauProfil };
};

// Mettre à jour un profil
const mettreAJourProfil = (id, nom, prenom) => {
  const profils = chargerProfils();
  const index = profils.findIndex((p) => p.id === id);
  
  if (index === -1) {
    return { succes: false, message: "Profil introuvable" };
  }
  
  // Normaliser le nom en majuscules et le prénom en minuscules
  const nomNormalise = nom.trim().toUpperCase();
  const prenomNormalise = prenom.trim().toLowerCase();
  
  // Vérifier que les champs ne sont pas vides
  if (!nomNormalise || !prenomNormalise) {
    return { succes: false, message: "Le nom et le prénom sont obligatoires" };
  }
  
  // Vérifier si le nom existe déjà (en excluant le profil actuel)
  if (nomProfilExiste(nomNormalise, id)) {
    return { succes: false, message: "Un profil avec ce nom existe déjà" };
  }
  
  // Mettre à jour le profil
  profils[index] = {
    ...profils[index],
    nom: nomNormalise,
    prenom: prenomNormalise
  };
  
  sauvegarderProfils(profils);
  
  return { succes: true, message: "Profil mis à jour avec succès", profil: profils[index] };
};

// Supprimer un profil
const supprimerProfil = (id) => {
  const profils = chargerProfils();
  const index = profils.findIndex((p) => p.id === id);
  
  if (index === -1) {
    return { succes: false, message: "Profil introuvable" };
  }
  
  // Vérifier si le profil est assigné à un utilisateur
  if (profilEstUtilise(id)) {
    return { succes: false, message: "Ce profil ne peut pas être supprimé car il est assigné à un ou plusieurs utilisateurs" };
  }
  
  // Supprimer le profil
  profils.splice(index, 1);
  sauvegarderProfils(profils);
  
  return { succes: true, message: "Profil supprimé avec succès" };
};

// Exporter les fonctions
export {
  chargerProfils,
  sauvegarderProfils,
  trouverProfilParId,
  trouverProfilParNom,
  nomProfilExiste,
  profilEstUtilise,
  creerProfil,
  mettreAJourProfil,
  supprimerProfil
};

