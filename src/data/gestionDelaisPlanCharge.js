// Gestion des délais du plan de charge

// Structure des données pour les délais
/*
{
  id: number,
  dateValidationSI: string, // Date de validation du SI
  dateReponseDEV: string, // Date de réponse DEV
  dateReponseTIV: string, // Date de réponse TIV
  delaiDEV: number, // Délai en heures ouvrées pour DEV
  delaiTIV: number, // Délai en heures ouvrées pour TIV
  respectDelaiDEV: boolean, // true si délai respecté (≤48h)
  respectDelaiTIV: boolean, // true si délai respecté (≤48h)
  rappelEnvoyeDEV: boolean, // true si rappel envoyé pour DEV
  rappelEnvoyeTIV: boolean, // true si rappel envoyé pour TIV
  notificationVue: boolean, // true si la notification a été vue par l'utilisateur
}
*/

// Stockage local des délais
const cleStockageDelais = "delais_plan_charge";

// Fonction utilitaire pour obtenir les délais depuis le localStorage
const chargerDelaisDepuisStockage = () => {
  try {
    const delaisStockes = localStorage.getItem(cleStockageDelais);
    return delaisStockes ? JSON.parse(delaisStockes) : [];
  } catch (error) {
    console.error("Erreur lors du chargement des délais:", error);
    return [];
  }
};

// Fonction utilitaire pour sauvegarder les délais dans le localStorage
const sauvegarderDelaisDansStockage = (delais) => {
  try {
    localStorage.setItem(cleStockageDelais, JSON.stringify(delais));
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des délais:", error);
  }
};

// Fonction pour calculer les heures ouvrées entre deux dates
const calculerHeuresOuvre = (dateDebut, dateFin) => {
  const debut = new Date(dateDebut);
  const fin = new Date(dateFin);

  if (fin < debut) return 0;

  let heuresOuvre = 0;
  const courant = new Date(debut);

  while (courant <= fin) {
    // Vérifier si c'est un jour ouvré (lundi à vendredi)
    const jourSemaine = courant.getDay(); // 0 = dimanche, 6 = samedi
    if (jourSemaine >= 1 && jourSemaine <= 5) { // Lundi à vendredi
      // Vérifier si c'est dans les heures ouvrées (9h-17h)
      const heure = courant.getHours();
      if (heure >= 9 && heure < 17) {
        heuresOuvre += 1;
      }
    }
    courant.setHours(courant.getHours() + 1);
  }

  return heuresOuvre;
};

// Charger tous les délais
export const chargerDelais = () => {
  return chargerDelaisDepuisStockage();
};

// Créer un nouveau suivi de délai
export const creerDelai = (delaiData) => {
  const delais = chargerDelaisDepuisStockage();

  // Validation des données
  if (!delaiData.dateValidationSI) {
    return { succes: false, message: "La date de validation SI est obligatoire." };
  }

  // Créer le nouveau délai
  const nouveauDelai = {
    id: Date.now(),
    dateValidationSI: delaiData.dateValidationSI,
    dateReponseDEV: delaiData.dateReponseDEV || null,
    dateReponseTIV: delaiData.dateReponseTIV || null,
    delaiDEV: 0,
    delaiTIV: 0,
    respectDelaiDEV: false,
    respectDelaiTIV: false,
    rappelEnvoyeDEV: false,
    rappelEnvoyeTIV: false,
    notificationVue: false
  };

  // Calculer les délais si les dates de réponse sont fournies
  if (nouveauDelai.dateReponseDEV) {
    nouveauDelai.delaiDEV = calculerHeuresOuvre(nouveauDelai.dateValidationSI, nouveauDelai.dateReponseDEV);
    nouveauDelai.respectDelaiDEV = nouveauDelai.delaiDEV <= 48;
  }

  if (nouveauDelai.dateReponseTIV) {
    nouveauDelai.delaiTIV = calculerHeuresOuvre(nouveauDelai.dateValidationSI, nouveauDelai.dateReponseTIV);
    nouveauDelai.respectDelaiTIV = nouveauDelai.delaiTIV <= 48;
  }

  delais.push(nouveauDelai);
  sauvegarderDelaisDansStockage(delais);

  return { succes: true, message: "Suivi de délai créé avec succès.", delai: nouveauDelai };
};

// Mettre à jour un délai existant
export const mettreAJourDelai = (id, delaiData) => {
  const delais = chargerDelaisDepuisStockage();
  const index = delais.findIndex(d => d.id === id);

  if (index === -1) {
    return { succes: false, message: "Suivi de délai introuvable." };
  }

  // Validation des données
  if (!delaiData.dateValidationSI) {
    return { succes: false, message: "La date de validation SI est obligatoire." };
  }

  // Mettre à jour le délai
  delais[index] = {
    ...delais[index],
    dateValidationSI: delaiData.dateValidationSI,
    dateReponseDEV: delaiData.dateReponseDEV || null,
    dateReponseTIV: delaiData.dateReponseTIV || null
  };

  // Recalculer les délais
  if (delais[index].dateReponseDEV) {
    delais[index].delaiDEV = calculerHeuresOuvre(delais[index].dateValidationSI, delais[index].dateReponseDEV);
    delais[index].respectDelaiDEV = delais[index].delaiDEV <= 48;

    // Générer un rappel si délai dépassé et pas encore envoyé
    if (!delais[index].respectDelaiDEV && !delais[index].rappelEnvoyeDEV) {
      console.log("RAPPEL: Délai DEV dépassé pour le suivi ID:", id);
      // Ici on pourrait envoyer un email automatique
      delais[index].rappelEnvoyeDEV = true;
    }
  }

  if (delais[index].dateReponseTIV) {
    delais[index].delaiTIV = calculerHeuresOuvre(delais[index].dateValidationSI, delais[index].dateReponseTIV);
    delais[index].respectDelaiTIV = delais[index].delaiTIV <= 48;

    // Générer un rappel si délai dépassé et pas encore envoyé
    if (!delais[index].respectDelaiTIV && !delais[index].rappelEnvoyeTIV) {
      console.log("RAPPEL: Délai TIV dépassé pour le suivi ID:", id);
      // Ici on pourrait envoyer un email automatique
      delais[index].rappelEnvoyeTIV = true;
    }
  }

  sauvegarderDelaisDansStockage(delais);

  return { succes: true, message: "Suivi de délai mis à jour avec succès.", delai: delais[index] };
};

// Supprimer un délai
export const supprimerDelai = (id) => {
  const delais = chargerDelaisDepuisStockage();
  const index = delais.findIndex(d => d.id === id);

  if (index === -1) {
    return { succes: false, message: "Suivi de délai introuvable." };
  }

  delais.splice(index, 1);
  sauvegarderDelaisDansStockage(delais);

  return { succes: true, message: "Suivi de délai supprimé avec succès." };
};

// Marquer une notification comme vue
export const marquerNotificationVue = (id) => {
  const delais = chargerDelaisDepuisStockage();
  const index = delais.findIndex(d => d.id === id);

  if (index === -1) {
    return { succes: false, message: "Délai introuvable." };
  }

  delais[index].notificationVue = true;
  sauvegarderDelaisDansStockage(delais);

  return { succes: true, message: "Notification marquée comme vue." };
};

// Obtenir les délais en retard (non vus en notification)
export const getDelaisEnRetard = () => {
  const delais = chargerDelaisDepuisStockage();
  const maintenant = new Date();

  return delais.filter(delai => {
    // Ne pas afficher les notifications déjà vues
    if (delai.notificationVue) return false;

    let estEnRetard = false;

    // Vérifier DEV
    if (delai.dateReponseDEV) {
      const delaiDEV = calculerHeuresOuvre(delai.dateValidationSI, maintenant.toISOString());
      if (delaiDEV > 48 && !delai.respectDelaiDEV) estEnRetard = true;
    } else {
      // Pas de réponse DEV, vérifier si délai dépassé
      const delaiDEV = calculerHeuresOuvre(delai.dateValidationSI, maintenant.toISOString());
      if (delaiDEV > 48) estEnRetard = true;
    }

    // Vérifier TIV
    if (delai.dateReponseTIV) {
      const delaiTIV = calculerHeuresOuvre(delai.dateValidationSI, maintenant.toISOString());
      if (delaiTIV > 48 && !delai.respectDelaiTIV) estEnRetard = true;
    } else {
      // Pas de réponse TIV, vérifier si délai dépassé
      const delaiTIV = calculerHeuresOuvre(delai.dateValidationSI, maintenant.toISOString());
      if (delaiTIV > 48) estEnRetard = true;
    }

    return estEnRetard;
  });
};

// Obtenir tous les délais en retard (même ceux déjà vus)
export const getTousDelaisEnRetard = () => {
  const delais = chargerDelaisDepuisStockage();
  const maintenant = new Date();

  return delais.filter(delai => {
    let estEnRetard = false;

    // Vérifier DEV
    if (delai.dateReponseDEV) {
      const delaiDEV = calculerHeuresOuvre(delai.dateValidationSI, maintenant.toISOString());
      if (delaiDEV > 48 && !delai.respectDelaiDEV) estEnRetard = true;
    } else {
      // Pas de réponse DEV, vérifier si délai dépassé
      const delaiDEV = calculerHeuresOuvre(delai.dateValidationSI, maintenant.toISOString());
      if (delaiDEV > 48) estEnRetard = true;
    }

    // Vérifier TIV
    if (delai.dateReponseTIV) {
      const delaiTIV = calculerHeuresOuvre(delai.dateValidationSI, maintenant.toISOString());
      if (delaiTIV > 48 && !delai.respectDelaiTIV) estEnRetard = true;
    } else {
      // Pas de réponse TIV, vérifier si délai dépassé
      const delaiTIV = calculerHeuresOuvre(delai.dateValidationSI, maintenant.toISOString());
      if (delaiTIV > 48) estEnRetard = true;
    }

    return estEnRetard;
  });
};
