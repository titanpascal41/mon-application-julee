// Fichier pour gérer la base de données des statuts
import donneesInitiales from "./statuts.json";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const CLE_STORAGE = "statutsJulee";

// Charger les statuts depuis localStorage ou le fichier JSON initial
const chargerStatutsLocal = () => {
  const donneesStockees = localStorage.getItem(CLE_STORAGE);

  if (donneesStockees) {
    return JSON.parse(donneesStockees);
  } else {
    const statutsInitiaux = donneesInitiales.statuts || [];
    sauvegarderStatuts(statutsInitiaux);
    return statutsInitiaux;
  }
};

const fetchStatutsDepuisApi = async () => {
  try {
    const resp = await fetch(`${API_BASE_URL}/statuts`);
    if (!resp.ok) throw new Error("Fetch statuts API échoué");
    const data = await resp.json();
    if (Array.isArray(data)) {
      // Si l'API répond mais ne contient rien, on revient aux données locales pour avoir un rendu.
      if (data.length === 0) {
        return chargerStatutsLocal();
      }
      sauvegarderStatuts(data);
      return data;
    }
    return chargerStatutsLocal();
  } catch (err) {
    console.warn("API statuts indisponible, fallback local:", err.message);
    return chargerStatutsLocal();
  }
};

const chargerStatuts = async () => {
  return fetchStatutsDepuisApi();
};

// Sauvegarder les statuts dans localStorage
const sauvegarderStatuts = (statuts) => {
  localStorage.setItem(CLE_STORAGE, JSON.stringify(statuts));
};

// Vérifier si un nom de statut existe déjà
const nomStatutExiste = async (nom, idExclu = null) => {
  const statuts = await chargerStatuts();
  const nomTrim = nom.trim();
  return statuts.some(
    (s) => s.nom === nomTrim && (idExclu === null || s.id !== idExclu)
  );
};

// Vérifier si un statut est utilisé dans une demande
// Note: Pour l'instant, on vérifie dans localStorage, mais il faudra adapter selon votre structure de données des demandes
const statutEstUtilise = (statutId) => {
  // Vérifier dans les demandes stockées dans localStorage
  const demandesStockees = localStorage.getItem("demandesJulee");
  if (demandesStockees) {
    try {
      const demandes = JSON.parse(demandesStockees);
      return demandes.some((d) => d.statutId === statutId);
    } catch (e) {
      return false;
    }
  }
  return false;
};

// Créer un nouveau statut
const creerStatut = async ({ nom, description, actif }) => {
  const statuts = await chargerStatuts();

  // Vérifier que le nom est renseigné
  if (!nom) {
    return { succes: false, message: "Le nom du statut est obligatoire" };
  }

  // Vérifier l'unicité du nom
  if (await nomStatutExiste(nom)) {
    return { succes: false, message: "Le nom du statut doit être unique" };
  }

  // Générer un nouvel ID
  const nouvelId = statuts.length > 0 ? Math.max(...statuts.map((s) => s.id)) + 1 : 1;

  const nouveauStatut = {
    id: nouvelId,
    nom: nom.trim(),
    description: description ? description.trim() : "",
    // Règle métier: seul l'administrateur peut appliquer/modifier
    quiPeutAppliquer: "Administrateur",
    actif: actif === true || actif === "true",
  };

  // Sync API
  try {
    const resp = await fetch(`${API_BASE_URL}/statuts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nom: nouveauStatut.nom,
        description: nouveauStatut.description,
        quiPeutAppliquer: nouveauStatut.quiPeutAppliquer,
        actif: nouveauStatut.actif,
      }),
    });
    if (resp.ok) {
      const created = await resp.json();
      // Mettre à jour l'id si l'API en fournit un
      nouveauStatut.id = created.id || nouveauStatut.id;
    }
  } catch (err) {
    console.warn("Erreur sync API statuts (create):", err.message);
  }

  const statutsMaj = [...statuts, nouveauStatut];
  sauvegarderStatuts(statutsMaj);

  return { succes: true, message: "Statut créé avec succès", statut: nouveauStatut };
};

// Mettre à jour un statut
const mettreAJourStatut = async (id, { nom, description, actif }) => {
  const statuts = await chargerStatuts();
  const index = statuts.findIndex((s) => s.id === id);

  if (index === -1) {
    return { succes: false, message: "Statut introuvable" };
  }

  // Vérifier que le nom est renseigné
  if (!nom) {
    return { succes: false, message: "Le nom du statut est obligatoire" };
  }

  // Vérifier l'unicité du nom (en excluant le statut actuel)
  if (await nomStatutExiste(nom, id)) {
    return { succes: false, message: "Le nom du statut doit être unique" };
  }

  // Mettre à jour le statut
  statuts[index] = {
    ...statuts[index],
    nom: nom.trim(),
    description: description ? description.trim() : "",
    // Règle métier: seul l'administrateur peut appliquer/modifier
    quiPeutAppliquer: "Administrateur",
    actif: actif === true || actif === "true",
  };

  // Sync API
  try {
    await fetch(`${API_BASE_URL}/statuts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nom: statuts[index].nom,
        description: statuts[index].description,
        quiPeutAppliquer: statuts[index].quiPeutAppliquer,
        actif: statuts[index].actif,
      }),
    });
  } catch (err) {
    console.warn("Erreur sync API statuts (update):", err.message);
  }

  sauvegarderStatuts(statuts);

  return { succes: true, message: "Statut mis à jour avec succès", statut: statuts[index] };
};

// Supprimer un statut
const supprimerStatut = async (id) => {
  const statuts = await chargerStatuts();
  const index = statuts.findIndex((s) => s.id === id);

  if (index === -1) {
    return { succes: false, message: "Statut introuvable" };
  }

  // Vérifier si le statut est utilisé dans une demande
  if (statutEstUtilise(id)) {
    return {
      succes: false,
      message: "Impossible de supprimer un statut utilisé dans une demande",
    };
  }

  // Supprimer le statut
  statuts.splice(index, 1);
  // Sync API
  try {
    await fetch(`${API_BASE_URL}/statuts/${id}`, { method: "DELETE" });
  } catch (err) {
    console.warn("Erreur sync API statuts (delete):", err.message);
  }

  sauvegarderStatuts(statuts);

  return { succes: true, message: "Statut supprimé avec succès" };
};

// Exporter les fonctions
export {
  chargerStatuts,
  sauvegarderStatuts,
  creerStatut,
  mettreAJourStatut,
  supprimerStatut,
  nomStatutExiste,
  statutEstUtilise,
};

