import { Router } from "express";
import { db } from "../db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

const router = Router();

// GET tous les statuts
router.get("/", (_req, res) => {
  db.query("SELECT * FROM statuts ORDER BY ordre ASC, id ASC", (err, results) => {
    if (err) {
      console.error("Erreur SELECT statuts:", err);
      return res
        .status(500)
        .json({ message: "Erreur lors de la récupération des statuts", error: err.message });
    }
    const rows = results as RowDataPacket[];
    return res.json(rows);
  });
});

// GET un statut par id
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM statuts WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error("Erreur SELECT statut:", err);
      return res
        .status(500)
        .json({ message: "Erreur lors de la récupération du statut", error: err.message });
    }
    const rows = results as RowDataPacket[];
    if (rows.length === 0) {
      return res.status(404).json({ message: "Statut non trouvé" });
    }
    return res.json(rows[0]);
  });
});

// CREATE statut
router.post("/", (req, res) => {
  const {
    nom,
    categorie,
    description,
    quiPeutAppliquer,
    actif = true,
    couleur = null,
    ordre = null,
  } = req.body;

  if (!nom || !nom.trim()) {
    return res.status(400).json({ message: "Le nom du statut est requis" });
  }

  db.query(
    "INSERT INTO statuts (nom, categorie, description, quiPeutAppliquer, actif, couleur, ordre) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [nom.trim(), categorie || null, description || null, quiPeutAppliquer || null, actif, couleur, ordre],
    (err, result) => {
      if (err) {
        console.error("Erreur INSERT statut:", err);
        return res
          .status(500)
          .json({ message: "Erreur lors de la création du statut", error: err.message });
      }
      const info = result as ResultSetHeader;
      return res.status(201).json({
        id: info.insertId,
        nom: nom.trim(),
        categorie,
        description,
        quiPeutAppliquer,
        actif,
        couleur,
        ordre,
      });
    }
  );
});

// UPDATE statut
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { nom, categorie, description, quiPeutAppliquer, actif, couleur = null, ordre = null } =
    req.body;

  if (!nom || !nom.trim()) {
    return res.status(400).json({ message: "Le nom du statut est requis" });
  }

  db.query(
    "UPDATE statuts SET nom = ?, categorie = ?, description = ?, quiPeutAppliquer = ?, actif = ?, couleur = ?, ordre = ? WHERE id = ?",
    [
      nom.trim(),
      categorie || null,
      description || null,
      quiPeutAppliquer || null,
      actif ?? true,
      couleur,
      ordre,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("Erreur UPDATE statut:", err);
        return res
          .status(500)
          .json({ message: "Erreur lors de la mise à jour du statut", error: err.message });
      }
      const info = result as ResultSetHeader;
      if (info.affectedRows === 0) {
        return res.status(404).json({ message: "Statut non trouvé" });
      }
      return res.json({
        id,
        nom: nom.trim(),
        categorie,
        description,
        quiPeutAppliquer,
        actif: actif ?? true,
        couleur,
        ordre,
      });
    }
  );
});

// DELETE statut
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM statuts WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Erreur DELETE statut:", err);
      return res
        .status(500)
        .json({ message: "Erreur lors de la suppression du statut", error: err.message });
    }
    const info = result as ResultSetHeader;
    if (info.affectedRows === 0) {
      return res.status(404).json({ message: "Statut non trouvé" });
    }
    return res.json({ message: "Statut supprimé" });
  });
});

export default router;
