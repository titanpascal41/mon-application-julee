import { Router } from "express";
import { db } from "../db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

const router = Router();

// GET toutes les sociétés
router.get("/", (_req, res) => {
  db.query("SELECT * FROM societes ORDER BY id ASC", (err, results) => {
    if (err) {
      console.error("Erreur SELECT societes:", err);
      return res
        .status(500)
        .json({ message: "Erreur lors de la récupération des sociétés", error: err.message });
    }
    const rows = results as RowDataPacket[];
    return res.json(rows);
  });
});

// GET une société par id
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM societes WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error("Erreur SELECT societe:", err);
      return res
        .status(500)
        .json({ message: "Erreur lors de la récupération de la société", error: err.message });
    }
    const rows = results as RowDataPacket[];
    if (rows.length === 0) {
      return res.status(404).json({ message: "Société non trouvée" });
    }
    return res.json(rows[0]);
  });
});

// CREATE société
router.post("/", (req, res) => {
  const { nom, description, adresse, telephone, email } = req.body;

  if (!nom || !nom.trim()) {
    return res.status(400).json({ message: "Le nom de la société est requis" });
  }

  db.query(
    "INSERT INTO societes (nom, description, adresse, telephone, email) VALUES (?, ?, ?, ?, ?)",
    [nom.trim(), description || null, adresse || null, telephone || null, email || null],
    (err, result) => {
      if (err) {
        console.error("Erreur INSERT societe:", err);
        return res
          .status(500)
          .json({ message: "Erreur lors de la création de la société", error: err.message });
      }
      const info = result as ResultSetHeader;
      return res.status(201).json({
        id: info.insertId,
        nom: nom.trim(),
        description,
        adresse,
        telephone,
        email,
      });
    }
  );
});

// UPDATE société
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { nom, description, adresse, telephone, email } = req.body;

  if (!nom || !nom.trim()) {
    return res.status(400).json({ message: "Le nom de la société est requis" });
  }

  db.query(
    "UPDATE societes SET nom = ?, description = ?, adresse = ?, telephone = ?, email = ? WHERE id = ?",
    [nom.trim(), description || null, adresse || null, telephone || null, email || null, id],
    (err, result) => {
      if (err) {
        console.error("Erreur UPDATE societe:", err);
        return res
          .status(500)
          .json({ message: "Erreur lors de la mise à jour de la société", error: err.message });
      }
      const info = result as ResultSetHeader;
      if (info.affectedRows === 0) {
        return res.status(404).json({ message: "Société non trouvée" });
      }
      return res.json({
        id,
        nom: nom.trim(),
        description,
        adresse,
        telephone,
        email,
      });
    }
  );
});

// DELETE société
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM societes WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Erreur DELETE societe:", err);
      return res
        .status(500)
        .json({ message: "Erreur lors de la suppression de la société", error: err.message });
    }
    const info = result as ResultSetHeader;
    if (info.affectedRows === 0) {
      return res.status(404).json({ message: "Société non trouvée" });
    }
    return res.json({ message: "Société supprimée" });
  });
});

export default router;
