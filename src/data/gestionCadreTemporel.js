// Fichier pour gérer la base de données du Cadre Temporel du Projet
import donneesInitiales from './cadreTemporel.json';

const CLE_STORAGE = "cadreTemporelJulee";

// Charger le cadre temporel depuis localStorage ou le fichier JSON initial
const chargerCadreTemporel = () => {
  const donneesStockees = localStorage.getItem(CLE_STORAGE);
  
  if (donneesStockees) {
    return JSON.parse(donneesStockees);
  } else {
    const cadreInitial = donneesInitiales.cadreTemporel || [];
    sauvegarderCadreTemporel(cadreInitial);
    return cadreInitial;
  }
};

// Sauvegarder le cadre temporel dans localStorage
const sauvegarderCadreTemporel = (cadre) => {
  localStorage.setItem(CLE_STORAGE, JSON.stringify(cadre));
};

// Créer ou mettre à jour le cadre temporel du projet
const creerOuMettreAJourCadreTemporel = ({ 
  dateDebutProjet, 
  dateFinPrevisionnelle, 
  statutValidationDate, 
  dateCommunicationPlanningClient 
}) => {
  const cadre = chargerCadreTemporel();

  // Vérifier que tous les champs obligatoires sont remplis
  if (!dateDebutProjet || !dateFinPrevisionnelle || !dateCommunicationPlanningClient) {
    return { succes: false, message: "Tous les champs obligatoires doivent être remplis" };
  }

  // Vérifier que la date de fin n'est pas antérieure à la date de début
  if (new Date(dateFinPrevisionnelle) < new Date(dateDebutProjet)) {
    return { succes: false, message: "La date de fin ne peut pas être antérieure à la date de début" };
  }

  // Si un cadre existe déjà, le mettre à jour (il ne peut y en avoir qu'un seul)
  if (cadre.length > 0) {
    cadre[0] = {
      id: cadre[0].id,
      dateDebutProjet: dateDebutProjet.trim(),
      dateFinPrevisionnelle: dateFinPrevisionnelle.trim(),
      statutValidationDate: statutValidationDate || "non validé",
      dateCommunicationPlanningClient: dateCommunicationPlanningClient.trim(),
    };
    sauvegarderCadreTemporel(cadre);
    return { succes: true, message: "Cadre temporel mis à jour avec succès", cadre: cadre[0] };
  }

  // Sinon, créer un nouveau cadre
  const nouveauCadre = {
    id: 1,
    dateDebutProjet: dateDebutProjet.trim(),
    dateFinPrevisionnelle: dateFinPrevisionnelle.trim(),
    statutValidationDate: statutValidationDate || "non validé",
    dateCommunicationPlanningClient: dateCommunicationPlanningClient.trim(),
  };

  cadre.push(nouveauCadre);
  sauvegarderCadreTemporel(cadre);

  return { succes: true, message: "Cadre temporel créé avec succès", cadre: nouveauCadre };
};

// Supprimer le cadre temporel
const supprimerCadreTemporel = () => {
  sauvegarderCadreTemporel([]);
  return { succes: true, message: "Cadre temporel supprimé avec succès" };
};

// Exporter les fonctions
export {
  chargerCadreTemporel,
  sauvegarderCadreTemporel,
  creerOuMettreAJourCadreTemporel,
  supprimerCadreTemporel,
};

