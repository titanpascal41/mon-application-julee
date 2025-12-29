// Service pour exporter les rapports du Kanban
import { chargerKanban, obtenirColonnes } from "../data/gestionKanban";
import {
  chargerCartes,
  obtenirStatistiques,
  obtenirCartesParColonne,
} from "../data/gestionCartesKanban";

// Exporter les données du kanban en JSON
const exporterKanbanJSON = () => {
  const kanban = chargerKanban();
  const cartes = chargerCartes();

  const donnees = {
    kanban: kanban,
    cartes: cartes,
    dateExport: new Date().toISOString(),
  };

  const jsonString = JSON.stringify(donnees, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `kanban-export-${
    new Date().toISOString().split("T")[0]
  }.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { succes: true, message: "Export JSON réussi" };
};

// Exporter les données du kanban en CSV
const exporterKanbanCSV = () => {
  const cartes = chargerCartes();
  const colonnes = obtenirColonnes();

  // Créer un mapping des colonnes pour les noms
  const colonnesMap = {};
  colonnes.forEach((col) => {
    colonnesMap[col.id] = col.nom;
  });

  // En-têtes CSV
  const enTetes = [
    "ID",
    "Titre",
    "Description",
    "Colonne",
    "Priorité",
    "Estimation",
    "Assigné",
    "Tags",
    "Date Création",
    "Date Modification",
  ];

  // Lignes de données
  const lignes = cartes.map((carte) => {
    return [
      carte.id,
      `"${carte.titre.replace(/"/g, '""')}"`,
      `"${(carte.description || "").replace(/"/g, '""')}"`,
      colonnesMap[carte.colonneId] || "",
      carte.priorite || "",
      carte.estimation || "",
      carte.assignee || "",
      carte.tags ? carte.tags.join("; ") : "",
      carte.dateCreation || "",
      carte.dateModification || "",
    ].join(",");
  });

  const csvContent = [enTetes.join(","), ...lignes].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `kanban-export-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { succes: true, message: "Export CSV réussi" };
};

// Générer un rapport texte formaté
const genererRapportTexte = () => {
  const kanban = chargerKanban();
  const cartes = chargerCartes();
  const colonnes = obtenirColonnes();
  const stats = obtenirStatistiques();

  let rapport = "═══════════════════════════════════════════════════════════\n";
  rapport += "RAPPORT KANBAN\n";
  rapport += "═══════════════════════════════════════════════════════════\n\n";

  if (kanban) {
    rapport += `Nom du Kanban: ${kanban.nom}\n`;
    rapport += `Description: ${kanban.description || "Aucune"}\n`;
    rapport += `Date de création: ${new Date(
      kanban.dateCreation
    ).toLocaleDateString("fr-FR")}\n`;
    rapport += `Dernière modification: ${new Date(
      kanban.dateModification
    ).toLocaleDateString("fr-FR")}\n\n`;
  }

  rapport += "═══════════════════════════════════════════════════════════\n";
  rapport += "STATISTIQUES\n";
  rapport += "═══════════════════════════════════════════════════════════\n\n";
  rapport += `Total de cartes: ${stats.total}\n`;
  rapport += `Estimation totale: ${stats.estimationTotale} points\n\n`;

  rapport += "Répartition par priorité:\n";
  rapport += `  - Haute: ${stats.parPriorite.Haute}\n`;
  rapport += `  - Moyenne: ${stats.parPriorite.Moyenne}\n`;
  rapport += `  - Basse: ${stats.parPriorite.Basse}\n\n`;

  rapport += "═══════════════════════════════════════════════════════════\n";
  rapport += "CARTES PAR COLONNE\n";
  rapport += "═══════════════════════════════════════════════════════════\n\n";

  colonnes.forEach((colonne) => {
    const cartesColonne = obtenirCartesParColonne(colonne.id);
    rapport += `${colonne.nom} (${cartesColonne.length} carte${
      cartesColonne.length > 1 ? "s" : ""
    })\n`;
    rapport += "─".repeat(50) + "\n";

    if (cartesColonne.length === 0) {
      rapport += "  Aucune carte\n\n";
    } else {
      cartesColonne.forEach((carte) => {
        rapport += `  [${carte.id}] ${carte.titre}\n`;
        if (carte.description) {
          rapport += `      ${carte.description.substring(0, 60)}${
            carte.description.length > 60 ? "..." : ""
          }\n`;
        }
        rapport += `      Priorité: ${carte.priorite} | Estimation: ${
          carte.estimation || "N/A"
        } points\n`;
        if (carte.tags && carte.tags.length > 0) {
          rapport += `      Tags: ${carte.tags.join(", ")}\n`;
        }
        rapport += "\n";
      });
    }
  });

  rapport += "═══════════════════════════════════════════════════════════\n";
  rapport += `Généré le ${new Date().toLocaleString("fr-FR")}\n`;
  rapport += "═══════════════════════════════════════════════════════════\n";

  return rapport;
};

// Exporter le rapport en fichier texte
const exporterRapportTexte = () => {
  const rapport = genererRapportTexte();
  const blob = new Blob([rapport], { type: "text/plain;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `rapport-kanban-${
    new Date().toISOString().split("T")[0]
  }.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { succes: true, message: "Export du rapport réussi" };
};

// Obtenir un résumé pour l'affichage
const obtenirResume = () => {
  const kanban = chargerKanban();
  const stats = obtenirStatistiques();
  const colonnes = obtenirColonnes();

  const resume = {
    nomKanban: kanban ? kanban.nom : "Non configuré",
    totalCartes: stats.total,
    estimationTotale: stats.estimationTotale,
    repartitionPriorite: stats.parPriorite,
    repartitionColonne: stats.parColonne,
    nombreColonnes: colonnes.length,
  };

  return resume;
};

// Exporter les fonctions
export {
  exporterKanbanJSON,
  exporterKanbanCSV,
  genererRapportTexte,
  exporterRapportTexte,
  obtenirResume,
};
