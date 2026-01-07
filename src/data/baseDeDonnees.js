// Fichier pour gérer la base de données des utilisateurs
import donneesInitiales from "./utilisateurs.json";

// URL de base de l'API backend (adaptable via variable d'environnement)
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";
// Mot de passe par défaut (unique et configurable)
const DEFAULT_PASSWORD = process.env.REACT_APP_DEFAULT_PASSWORD || "Julee@2024!";

// Creds admin (connexion exclusive)
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL || "admin@julee.local";
const ADMIN_PASSWORD =
  process.env.REACT_APP_ADMIN_PASSWORD || "JuleeAdmin@2024!";

// Fonctions utilitaires pour synchroniser avec l'API backend (best effort, non bloquant)
const syncCreateUserWithApi = (user) => {
  // On ne bloque pas l'UI si l'API échoue : on log juste l'erreur
  try {
    fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // Le backend attend au minimum { name, email }
        name: `${user.prenom || ""} ${user.nom || ""}`.trim() || user.nom || user.prenom,
        email: user.email,
        // On envoie aussi les champs étendus si un jour la table les contient
        nom: user.nom,
        prenom: user.prenom,
        motDePasse: user.motDePasse,
        profilId: user.profilId,
        description: user.description,
      }),
    }).catch((err) => {
      console.error("Erreur lors de la synchronisation de création utilisateur avec l'API:", err);
    });
  } catch (err) {
    console.error("Erreur lors de l'appel API création utilisateur:", err);
  }
};

const syncUpdateUserWithApi = (user) => {
  if (!user?.id) return;
  try {
    fetch(`${API_BASE_URL}/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${user.prenom || ""} ${user.nom || ""}`.trim() || user.nom || user.prenom,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        motDePasse: user.motDePasse,
        profilId: user.profilId,
        description: user.description,
      }),
    }).catch((err) => {
      console.error("Erreur lors de la synchronisation de mise à jour utilisateur avec l'API:", err);
    });
  } catch (err) {
    console.error("Erreur lors de l'appel API mise à jour utilisateur:", err);
  }
};

const syncDeleteUserWithApi = (id) => {
  if (!id) return;
  try {
    fetch(`${API_BASE_URL}/users/${id}`, {
      method: "DELETE",
    }).catch((err) => {
      console.error("Erreur lors de la synchronisation de suppression utilisateur avec l'API:", err);
    });
  } catch (err) {
    console.error("Erreur lors de l'appel API suppression utilisateur:", err);
  }
};

// Charger les utilisateurs depuis localStorage ou le fichier JSON initial
const chargerUtilisateurs = () => {
  // Vérifier si on a déjà des données dans localStorage
  const donneesStockees = localStorage.getItem("utilisateursJulee");

  if (donneesStockees) {
    // Si oui, vérifier si le tableau n'est pas vide
    const utilisateursStockes = JSON.parse(donneesStockees);
    if (utilisateursStockes && utilisateursStockes.length > 0) {
      // Utiliser les données de localStorage si elles ne sont pas vides
      return utilisateursStockes;
    }
  }
  
  // Sinon, utiliser les données initiales du fichier JSON
  const utilisateursInitiaux = donneesInitiales.utilisateurs || [];
  // Sauvegarder dans localStorage pour la première fois
  sauvegarderUtilisateurs(utilisateursInitiaux);
  return utilisateursInitiaux;
};

// Sauvegarder les utilisateurs dans localStorage
const sauvegarderUtilisateurs = (utilisateurs) => {
  localStorage.setItem("utilisateursJulee", JSON.stringify(utilisateurs));
};

// Trouver un utilisateur par email
const trouverUtilisateurParEmail = (email) => {
  const utilisateurs = chargerUtilisateurs();
  return utilisateurs.find((user) => user.email === email);
};

// Vérifier si un email existe déjà
const emailExiste = (email, idExclu = null) => {
  const utilisateur = trouverUtilisateurParEmail(email);
  if (!utilisateur) return false;
  // Si on modifie un utilisateur existant, exclure son propre ID
  if (idExclu && utilisateur.id === idExclu) return false;
  return true;
};

// Vérifier la complexité du mot de passe (8 caractères différents minimum)
const validerMotDePasse = (motDePasse) => {
  if (!motDePasse || motDePasse.length < 8) {
    return {
      valide: false,
      message: "Le mot de passe doit contenir au moins 8 caractères",
    };
  }

  // Compter les caractères uniques
  const caracteresUniques = new Set(motDePasse).size;
  if (caracteresUniques < 8) {
    return {
      valide: false,
      message: "Le mot de passe doit contenir au moins 8 caractères différents",
    };
  }

  return { valide: true, message: "" };
};

// Créer un nouvel utilisateur
const creerUtilisateur = (
  prenom,
  nom,
  email,
  motDePasse,
  profilId,
  description = ""
) => {
  const utilisateurs = chargerUtilisateurs();

  // Vérifier si l'email existe déjà
  if (emailExiste(email)) {
    return { succes: false, message: "Cet email est déjà utilisé" };
  }

  // Vérifier que le profil est fourni (obligatoire)
  if (!profilId) {
    return {
      succes: false,
      message: "Un profil doit être sélectionné pour créer un utilisateur",
    };
  }

  // Valider le mot de passe
  const motDePasseFinal = motDePasse || DEFAULT_PASSWORD;
  const validationMotDePasse = validerMotDePasse(motDePasseFinal);
  if (!validationMotDePasse.valide) {
    return { succes: false, message: validationMotDePasse.message };
  }

  // Créer le nouvel utilisateur
  const nouvelId =
    utilisateurs.length > 0
      ? Math.max(...utilisateurs.map((u) => u.id)) + 1
      : 1;

  const nouvelUtilisateur = {
    id: nouvelId,
    prenom: prenom,
    nom: nom,
    email: email,
    motDePasse: motDePasseFinal,
    profilId: profilId,
    description: description || "",
  };

  utilisateurs.push(nouvelUtilisateur);
  sauvegarderUtilisateurs(utilisateurs);

  // Synchroniser en arrière-plan avec la base MySQL via l'API backend
  syncCreateUserWithApi(nouvelUtilisateur);

  return {
    succes: true,
    message: "Compte créé avec succès",
    utilisateur: nouvelUtilisateur,
  };
};

// Mettre à jour un utilisateur
const mettreAJourUtilisateur = (
  id,
  prenom,
  nom,
  email,
  motDePasse,
  profilId,
  description
) => {
  const utilisateurs = chargerUtilisateurs();
  const index = utilisateurs.findIndex((u) => u.id === id);

  if (index === -1) {
    return { succes: false, message: "Utilisateur introuvable" };
  }

  // Vérifier si l'email existe déjà (en excluant l'utilisateur actuel)
  if (emailExiste(email, id)) {
    return { succes: false, message: "Cet email est déjà utilisé" };
  }

  // Vérifier que le profil est fourni
  if (!profilId) {
    return { succes: false, message: "Un profil doit être sélectionné" };
  }

  // Valider le mot de passe seulement s'il est fourni et différent
  if (motDePasse && motDePasse !== utilisateurs[index].motDePasse) {
    const validationMotDePasse = validerMotDePasse(motDePasse);
    if (!validationMotDePasse.valide) {
      return { succes: false, message: validationMotDePasse.message };
    }
  }

  // Mettre à jour l'utilisateur
  utilisateurs[index] = {
    ...utilisateurs[index],
    prenom: prenom,
    nom: nom,
    email: email,
    motDePasse: motDePasse || utilisateurs[index].motDePasse, // Garder l'ancien si non fourni
    profilId: profilId,
    description: description || "",
  };

  sauvegarderUtilisateurs(utilisateurs);

  // Synchroniser en arrière-plan avec l'API backend
  syncUpdateUserWithApi(utilisateurs[index]);

  return {
    succes: true,
    message: "Utilisateur mis à jour avec succès",
    utilisateur: utilisateurs[index],
  };
};

// Supprimer un utilisateur
const supprimerUtilisateur = (id) => {
  const utilisateurs = chargerUtilisateurs();
  const index = utilisateurs.findIndex((u) => u.id === id);

  if (index === -1) {
    return { succes: false, message: "Utilisateur introuvable" };
  }

  // Vérifier si l'utilisateur supprimé est celui qui est connecté
  const utilisateurConnecte = localStorage.getItem("utilisateurConnecte");
  if (utilisateurConnecte) {
    const userConnecte = JSON.parse(utilisateurConnecte);
    if (userConnecte.id === id) {
      // Déconnecter l'utilisateur s'il est celui qui est supprimé
      localStorage.removeItem("utilisateurConnecte");
      // Recharger la page pour forcer la reconnexion
      window.location.reload();
    }
  }

  // Supprimer l'utilisateur
  utilisateurs.splice(index, 1);
  sauvegarderUtilisateurs(utilisateurs);

  // Synchroniser en arrière-plan avec l'API backend
  syncDeleteUserWithApi(id);

  return { succes: true, message: "Utilisateur supprimé avec succès" };
};

// Vérifier les identifiants de connexion
const verifierConnexion = (email, motDePasse) => {
  // Connexion uniquement via le compte admin configuré
  if (email === ADMIN_EMAIL && motDePasse === ADMIN_PASSWORD) {
    return {
      succes: true,
      message: "Connexion réussie (admin)",
      utilisateur: {
        id: 0,
        prenom: "Admin",
        nom: "Julee",
        email: ADMIN_EMAIL,
        profilId: "admin",
      },
    };
  }

  return { succes: false, message: "Email ou mot de passe incorrect" };
};

// Exporter les fonctions
export {
  chargerUtilisateurs,
  sauvegarderUtilisateurs,
  trouverUtilisateurParEmail,
  emailExiste,
  validerMotDePasse,
  creerUtilisateur,
  mettreAJourUtilisateur,
  supprimerUtilisateur,
  verifierConnexion,
};
