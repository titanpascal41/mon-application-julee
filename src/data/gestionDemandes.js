// Fichier pour gérer la base de données des demandes
import donneesInitiales from './demandes.json';
import { chargerSocietes } from './societes';

const CLE_STORAGE = "demandesJulee";

// Charger les demandes depuis localStorage ou le fichier JSON initial
const chargerDemandes = () => {
  const donneesStockees = localStorage.getItem(CLE_STORAGE);
  
  if (donneesStockees) {
    return JSON.parse(donneesStockees);
  } else {
    const demandesInitiales = donneesInitiales.demandes || [];
    sauvegarderDemandes(demandesInitiales);
    return demandesInitiales;
  }
};

// Sauvegarder les demandes dans localStorage
const sauvegarderDemandes = (demandes) => {
  localStorage.setItem(CLE_STORAGE, JSON.stringify(demandes));
};

// Créer une nouvelle demande
const creerDemande = ({ dateReception, societesDemandeurs, interlocuteur }) => {
  const demandes = chargerDemandes();

  // Vérifier que tous les champs obligatoires sont remplis
  if (!dateReception || !societesDemandeurs || societesDemandeurs.length === 0 || !interlocuteur) {
    return { succes: false, message: "Tous les champs obligatoires doivent être remplis" };
  }

  // Vérifier que les sociétés existent
  const societes = chargerSocietes();
  const societesIds = Array.isArray(societesDemandeurs) ? societesDemandeurs : [societesDemandeurs];
  const toutesSocietesExistantes = societesIds.every((id) => 
    societes.some((s) => s.id === parseInt(id))
  );
  
  if (!toutesSocietesExistantes) {
    return { succes: false, message: "Une ou plusieurs sociétés sélectionnées n'existent pas" };
  }

  // Générer un nouvel ID
  const nouvelId = demandes.length > 0 ? Math.max(...demandes.map((d) => d.id)) + 1 : 1;

  // Date d'enregistrement automatique
  const dateEnregistrement = new Date().toISOString().split('T')[0];

  const nouvelleDemande = {
    id: nouvelId,
    dateEnregistrement: dateEnregistrement,
    dateReception: dateReception,
    societesDemandeurs: societesIds.map((id) => parseInt(id)),
    interlocuteur: interlocuteur.trim(),
  };

  demandes.push(nouvelleDemande);
  sauvegarderDemandes(demandes);

  return { succes: true, message: "Demande créée avec succès", demande: nouvelleDemande };
};

// Mettre à jour une demande
const mettreAJourDemande = (id, { dateReception, societesDemandeurs, interlocuteur }) => {
  const demandes = chargerDemandes();
  const index = demandes.findIndex((d) => d.id === id);

  if (index === -1) {
    return { succes: false, message: "Demande introuvable" };
  }

  // Vérifier que tous les champs obligatoires sont remplis
  if (!dateReception || !societesDemandeurs || societesDemandeurs.length === 0 || !interlocuteur) {
    return { succes: false, message: "Tous les champs obligatoires doivent être remplis" };
  }

  // Vérifier que les sociétés existent
  const societes = chargerSocietes();
  const societesIds = Array.isArray(societesDemandeurs) ? societesDemandeurs : [societesDemandeurs];
  const toutesSocietesExistantes = societesIds.every((id) => 
    societes.some((s) => s.id === parseInt(id))
  );
  
  if (!toutesSocietesExistantes) {
    return { succes: false, message: "Une ou plusieurs sociétés sélectionnées n'existent pas" };
  }

  // Mettre à jour la demande (la date d'enregistrement reste inchangée)
  demandes[index] = {
    ...demandes[index],
    dateReception: dateReception,
    societesDemandeurs: societesIds.map((id) => parseInt(id)),
    interlocuteur: interlocuteur.trim(),
  };

  sauvegarderDemandes(demandes);

  return { succes: true, message: "Demande mise à jour avec succès", demande: demandes[index] };
};

// Supprimer une demande
const supprimerDemande = (id) => {
  const demandes = chargerDemandes();
  const index = demandes.findIndex((d) => d.id === id);

  if (index === -1) {
    return { succes: false, message: "Demande introuvable" };
  }

  // Supprimer la demande
  demandes.splice(index, 1);
  sauvegarderDemandes(demandes);

  return { succes: true, message: "Demande supprimée avec succès" };
};

// Exporter les fonctions
export {
  chargerDemandes,
  sauvegarderDemandes,
  creerDemande,
  mettreAJourDemande,
  supprimerDemande,
};

