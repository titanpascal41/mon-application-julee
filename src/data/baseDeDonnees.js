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
const emailExiste = (email) => {
  const utilisateur = trouverUtilisateurParEmail(email);
  return utilisateur !== undefined;
};

// Créer un nouvel utilisateur
const creerUtilisateur = (prenom, nom, email, motDePasse) => {
  const utilisateurs = chargerUtilisateurs();
  
  // Vérifier si l'email existe déjà
  if (emailExiste(email)) {
    return { succes: false, message: "Cet email est déjà utilisé" };
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
    motDePasse: motDePasse
  };
  
  utilisateurs.push(nouvelUtilisateur);
  sauvegarderUtilisateurs(utilisateurs);
  
  return { succes: true, message: "Compte créé avec succès", utilisateur: nouvelUtilisateur };
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
  creerUtilisateur,
  verifierConnexion
};

