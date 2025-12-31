// Gestion des coûts du produit

// Structure des données pour les coûts
/*
{
  id: number,
  // Charges DEV
  chargePrevisionnelleDEV: number, // H/J
  chargeEffectiveDEV: number, // H/J
  tjmDEV: number, // Taux journalier moyen DEV

  // Charges TIV
  chargePrevisionnelleTIV: number, // H/J
  chargeEffectiveTIV: number, // H/J
  tjmTIV: number, // Taux journalier moyen TIV

  // Calculs automatiques
  coutPrevuDEV: number, // chargePrevisionnelleDEV * tjmDEV
  coutReelDEV: number, // chargeEffectiveDEV * tjmDEV
  coutPrevuTIV: number, // chargePrevisionnelleTIV * tjmTIV
  coutReelTIV: number, // chargeEffectiveTIV * tjmTIV
  coutReelTotal: number, // coutReelDEV + coutReelTIV
  netAPayer: number, // coutReelTotal
  ecart: number, // coutReelTotal - (coutPrevuDEV + coutPrevuTIV)
}
*/

// Stockage local des coûts
const cleStockageCouts = "couts_produit";

// Fonction utilitaire pour obtenir les coûts depuis le localStorage
const chargerCoutsDepuisStockage = () => {
  try {
    const coutsStockes = localStorage.getItem(cleStockageCouts);
    return coutsStockes ? JSON.parse(coutsStockes) : [];
  } catch (error) {
    console.error("Erreur lors du chargement des coûts:", error);
    return [];
  }
};

// Fonction utilitaire pour sauvegarder les coûts dans le localStorage
const sauvegarderCoutsDansStockage = (couts) => {
  try {
    localStorage.setItem(cleStockageCouts, JSON.stringify(couts));
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des coûts:", error);
  }
};

// Fonction pour calculer tous les coûts automatiquement
const calculerCouts = (coutData) => {
  const coutPrevuDEV = (coutData.chargePrevisionnelleDEV || 0) * (coutData.tjmDEV || 0);
  const coutReelDEV = (coutData.chargeEffectiveDEV || 0) * (coutData.tjmDEV || 0);
  const coutPrevuTIV = (coutData.chargePrevisionnelleTIV || 0) * (coutData.tjmTIV || 0);
  const coutReelTIV = (coutData.chargeEffectiveTIV || 0) * (coutData.tjmTIV || 0);
  const coutReelTotal = coutReelDEV + coutReelTIV;
  const coutPrevuTotal = coutPrevuDEV + coutPrevuTIV;
  const ecart = coutReelTotal - coutPrevuTotal;

  return {
    coutPrevuDEV: parseFloat(coutPrevuDEV.toFixed(2)),
    coutReelDEV: parseFloat(coutReelDEV.toFixed(2)),
    coutPrevuTIV: parseFloat(coutPrevuTIV.toFixed(2)),
    coutReelTIV: parseFloat(coutReelTIV.toFixed(2)),
    coutReelTotal: parseFloat(coutReelTotal.toFixed(2)),
    netAPayer: parseFloat(coutReelTotal.toFixed(2)),
    ecart: parseFloat(ecart.toFixed(2))
  };
};

// Charger tous les coûts
export const chargerCouts = () => {
  return chargerCoutsDepuisStockage();
};

// Créer un nouveau suivi de coût
export const creerCout = (coutData) => {
  const couts = chargerCoutsDepuisStockage();

  // Créer le nouveau coût avec calculs automatiques
  const calculs = calculerCouts(coutData);
  const nouveauCout = {
    id: Date.now(),
    chargePrevisionnelleDEV: parseFloat(coutData.chargePrevisionnelleDEV || 0),
    chargeEffectiveDEV: parseFloat(coutData.chargeEffectiveDEV || 0),
    tjmDEV: parseFloat(coutData.tjmDEV || 0),
    chargePrevisionnelleTIV: parseFloat(coutData.chargePrevisionnelleTIV || 0),
    chargeEffectiveTIV: parseFloat(coutData.chargeEffectiveTIV || 0),
    tjmTIV: parseFloat(coutData.tjmTIV || 0),
    ...calculs
  };

  couts.push(nouveauCout);
  sauvegarderCoutsDansStockage(couts);

  return { succes: true, message: "Suivi de coût créé avec succès.", cout: nouveauCout };
};

// Mettre à jour un coût existant
export const mettreAJourCout = (id, coutData) => {
  const couts = chargerCoutsDepuisStockage();
  const index = couts.findIndex(c => c.id === id);

  if (index === -1) {
    return { succes: false, message: "Suivi de coût introuvable." };
  }

  // Mettre à jour et recalculer
  const coutMisAJour = {
    ...couts[index],
    chargePrevisionnelleDEV: parseFloat(coutData.chargePrevisionnelleDEV || couts[index].chargePrevisionnelleDEV),
    chargeEffectiveDEV: parseFloat(coutData.chargeEffectiveDEV || couts[index].chargeEffectiveDEV),
    tjmDEV: parseFloat(coutData.tjmDEV || couts[index].tjmDEV),
    chargePrevisionnelleTIV: parseFloat(coutData.chargePrevisionnelleTIV || couts[index].chargePrevisionnelleTIV),
    chargeEffectiveTIV: parseFloat(coutData.chargeEffectiveTIV || couts[index].chargeEffectiveTIV),
    tjmTIV: parseFloat(coutData.tjmTIV || couts[index].tjmTIV)
  };

  // Recalculer tous les coûts
  const calculs = calculerCouts(coutMisAJour);
  couts[index] = { ...coutMisAJour, ...calculs };

  sauvegarderCoutsDansStockage(couts);

  return { succes: true, message: "Suivi de coût mis à jour avec succès.", cout: couts[index] };
};

// Supprimer un coût
export const supprimerCout = (id) => {
  const couts = chargerCoutsDepuisStockage();
  const index = couts.findIndex(c => c.id === id);

  if (index === -1) {
    return { succes: false, message: "Suivi de coût introuvable." };
  }

  couts.splice(index, 1);
  sauvegarderCoutsDansStockage(couts);

  return { succes: true, message: "Suivi de coût supprimé avec succès." };
};

// Obtenir les statistiques générales
export const getStatistiquesCouts = () => {
  const couts = chargerCoutsDepuisStockage();

  if (couts.length === 0) {
    return {
      totalProjets: 0,
      coutTotalPrevu: 0,
      coutTotalReel: 0,
      ecartTotal: 0,
      projetsEnDeficit: 0,
      projetsEnBenefice: 0
    };
  }

  const totalPrevu = couts.reduce((sum, c) => sum + (c.coutPrevuDEV + c.coutPrevuTIV), 0);
  const totalReel = couts.reduce((sum, c) => sum + c.coutReelTotal, 0);
  const ecartTotal = couts.reduce((sum, c) => sum + c.ecart, 0);

  const projetsEnDeficit = couts.filter(c => c.ecart > 0).length;
  const projetsEnBenefice = couts.filter(c => c.ecart < 0).length;

  return {
    totalProjets: couts.length,
    coutTotalPrevu: parseFloat(totalPrevu.toFixed(2)),
    coutTotalReel: parseFloat(totalReel.toFixed(2)),
    ecartTotal: parseFloat(ecartTotal.toFixed(2)),
    projetsEnDeficit,
    projetsEnBenefice
  };
};

// Obtenir les coûts avec écart positif (dépassement)
export const getCoutsEnDeficit = () => {
  const couts = chargerCoutsDepuisStockage();
  return couts.filter(c => c.ecart > 0).sort((a, b) => b.ecart - a.ecart);
};

// Obtenir les coûts avec écart négatif (économie)
export const getCoutsEnBenefice = () => {
  const couts = chargerCoutsDepuisStockage();
  return couts.filter(c => c.ecart < 0).sort((a, b) => a.ecart - b.ecart);
};
