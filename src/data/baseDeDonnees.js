// Fichier pour gérer la base de données des utilisateurs
import donneesInitiales from './utilisateurs.json';

// Charger les utilisateurs depuis localStorage ou le fichier JSON initial
const chargerUtilisateurs = () => {
  // Vérifier si on a déjà des données dans localStorage
  const donneesStockees = localStorage.getItem("utilisateursJulee");
  
  if (donneesStockees) {
    // Si oui, utiliser les données de localStorage
    return JSON.parse(donneesStockees);
  } else {
    // Sinon, utiliser les données initiales du fichier JSON
    const utilisateursInitiaux = donneesInitiales.utilisateurs || [];
    // Sauvegarder dans localStorage pour la première fois
    sauvegarderUtilisateurs(utilisateursInitiaux);
    return utilisateursInitiaux;
  }
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
    return { valide: false, message: "Le mot de passe doit contenir au moins 8 caractères" };
  }
  
  // Compter les caractères uniques
  const caracteresUniques = new Set(motDePasse).size;
  if (caracteresUniques < 8) {
    return { 
      valide: false, 
      message: "Le mot de passe doit contenir au moins 8 caractères différents" 
    };
  }
  
  return { valide: true, message: "" };
};

// Créer un nouvel utilisateur
const creerUtilisateur = (prenom, nom, email, motDePasse, profilId = null, description = "") => {
  const utilisateurs = chargerUtilisateurs();
  
  // Vérifier si l'email existe déjà
  if (emailExiste(email)) {
    return { succes: false, message: "Cet email est déjà utilisé" };
  }
  
  // Le profil est optionnel lors de la création d'un compte public
  // Il pourra être assigné plus tard par un administrateur
  
  // Valider le mot de passe
  const validationMotDePasse = validerMotDePasse(motDePasse);
  if (!validationMotDePasse.valide) {
    return { succes: false, message: validationMotDePasse.message };
  }
  
  // Créer le nouvel utilisateur
  const nouvelId = utilisateurs.length > 0 
    ? Math.max(...utilisateurs.map(u => u.id)) + 1 
    : 1;
  
  const nouvelUtilisateur = {
    id: nouvelId,
    prenom: prenom,
    nom: nom,
    email: email,
    motDePasse: motDePasse,
    profilId: profilId,
    description: description || ""
  };
  
  utilisateurs.push(nouvelUtilisateur);
  sauvegarderUtilisateurs(utilisateurs);
  
  return { succes: true, message: "Compte créé avec succès", utilisateur: nouvelUtilisateur };
};

// Mettre à jour un utilisateur
const mettreAJourUtilisateur = (id, prenom, nom, email, motDePasse, profilId, description) => {
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
    description: description || ""
  };
  
  sauvegarderUtilisateurs(utilisateurs);
  
  return { succes: true, message: "Utilisateur mis à jour avec succès", utilisateur: utilisateurs[index] };
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
  
  return { succes: true, message: "Utilisateur supprimé avec succès" };
};

// Vérifier les identifiants de connexion
const verifierConnexion = (email, motDePasse) => {
  const utilisateur = trouverUtilisateurParEmail(email);
  
  if (!utilisateur) {
    return { succes: false, message: "Email ou mot de passe incorrect" };
  }
  
  if (utilisateur.motDePasse !== motDePasse) {
    return { succes: false, message: "Email ou mot de passe incorrect" };
  }
  
  return { succes: true, message: "Connexion réussie", utilisateur: utilisateur };
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
  verifierConnexion
};

