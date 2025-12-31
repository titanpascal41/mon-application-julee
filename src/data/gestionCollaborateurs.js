// Gestion des collaborateurs

const CLE_COLLAB = "collaborateurs";

const chargerDepuisStockage = () => {
  try {
    const data = localStorage.getItem(CLE_COLLAB);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Erreur chargement collaborateurs:", e);
    return [];
  }
};

const sauvegarderDansStockage = (collaborateurs) => {
  try {
    localStorage.setItem(CLE_COLLAB, JSON.stringify(collaborateurs));
  } catch (e) {
    console.error("Erreur sauvegarde collaborateurs:", e);
  }
};

export const chargerCollaborateurs = () => chargerDepuisStockage();

export const creerCollaborateur = (data) => {
  const collaborateurs = chargerDepuisStockage();
  const nouveau = {
    id: Date.now(),
    nom: (data.nom || "").trim(),
    email: (data.email || "").trim(),
    poste: (data.poste || "").trim(),
    telephone: (data.telephone || "").trim(),
    actif: data.actif ?? true,
  };

  if (!nouveau.nom) {
    return { succes: false, message: "Le nom est obligatoire." };
  }
  if (!nouveau.email) {
    return { succes: false, message: "L'email est obligatoire." };
  }

  collaborateurs.push(nouveau);
  sauvegarderDansStockage(collaborateurs);
  return { succes: true, message: "Collaborateur créé avec succès.", collaborateur: nouveau };
};

export const mettreAJourCollaborateur = (id, data) => {
  const collaborateurs = chargerDepuisStockage();
  const idx = collaborateurs.findIndex((c) => c.id === id);
  if (idx === -1) {
    return { succes: false, message: "Collaborateur introuvable." };
  }

  const existant = collaborateurs[idx];
  const maj = {
    ...existant,
    nom: (data.nom ?? existant.nom).trim(),
    email: (data.email ?? existant.email).trim(),
    poste: (data.poste ?? existant.poste).trim(),
    telephone: (data.telephone ?? existant.telephone).trim(),
    actif: data.actif ?? existant.actif,
  };

  if (!maj.nom) {
    return { succes: false, message: "Le nom est obligatoire." };
  }
  if (!maj.email) {
    return { succes: false, message: "L'email est obligatoire." };
  }

  collaborateurs[idx] = maj;
  sauvegarderDansStockage(collaborateurs);
  return { succes: true, message: "Collaborateur mis à jour avec succès.", collaborateur: maj };
};

export const supprimerCollaborateur = (id) => {
  const collaborateurs = chargerDepuisStockage();
  const idx = collaborateurs.findIndex((c) => c.id === id);
  if (idx === -1) {
    return { succes: false, message: "Collaborateur introuvable." };
  }
  collaborateurs.splice(idx, 1);
  sauvegarderDansStockage(collaborateurs);
  return { succes: true, message: "Collaborateur supprimé avec succès." };
};

