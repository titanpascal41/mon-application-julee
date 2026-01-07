import { Router } from "express";
import { db } from "../db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

const router = Router();

// GET tous les collaborateurs
router.get("/", (_req, res) => {
  db.query("SELECT * FROM collaborateurs ORDER BY id ASC", (err, results) => {
    if (err) {
      console.error("Erreur SELECT collaborateurs:", err);
      return res
        .status(500)
        .json({
          message: "Erreur lors de la récupération des collaborateurs",
          error: err.message,
        });
    }
    const rows = results as RowDataPacket[];
    return res.json(rows);
  });
});

// GET un collaborateur par id
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM collaborateurs WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error("Erreur SELECT collaborateur:", err);
      return res
        .status(500)
        .json({
          message: "Erreur lors de la récupération du collaborateur",
          error: err.message,
        });
    }
    const rows = results as RowDataPacket[];
    if (rows.length === 0) {
      return res.status(404).json({ message: "Collaborateur non trouvé" });
    }
    return res.json(rows[0]);
  });
});

// CREATE collaborateur
router.post("/", (req, res) => {
  const { nom, email, poste, telephone, actif } = req.body;

  if (!nom || !nom.trim()) {
    return res.status(400).json({ message: "Le nom du collaborateur est requis" });
  }
  if (!email || !email.trim()) {
    return res.status(400).json({ message: "L'email du collaborateur est requis" });
  }

  db.query(
    "INSERT INTO collaborateurs (nom, email, poste, telephone, actif) VALUES (?, ?, ?, ?, ?)",
    [nom.trim(), email.trim(), poste || null, telephone || null, actif ?? true],
    (err, result) => {
      if (err) {
        console.error("Erreur INSERT collaborateur:", err);
        return res
          .status(500)
          .json({
            message: "Erreur lors de la création du collaborateur",
            error: err.message,
          });
      }
      const info = result as ResultSetHeader;
      return res.status(201).json({
        id: info.insertId,
        nom: nom.trim(),
        email: email.trim(),
        poste,
        telephone,
        actif: actif ?? true,
      });
    }
  );
});

// UPDATE collaborateur
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { nom, email, poste, telephone, actif } = req.body;

  if (!nom || !nom.trim()) {
    return res.status(400).json({ message: "Le nom du collaborateur est requis" });
  }
  if (!email || !email.trim()) {
    return res.status(400).json({ message: "L'email du collaborateur est requis" });
  }

  db.query(
    "UPDATE collaborateurs SET nom = ?, email = ?, poste = ?, telephone = ?, actif = ? WHERE id = ?",
    [nom.trim(), email.trim(), poste || null, telephone || null, actif ?? true, id],
    (err, result) => {
      if (err) {
        console.error("Erreur UPDATE collaborateur:", err);
        return res
          .status(500)
          .json({
            message: "Erreur lors de la mise à jour du collaborateur",
            error: err.message,
          });
      }
      const info = result as ResultSetHeader;
      if (info.affectedRows === 0) {
        return res.status(404).json({ message: "Collaborateur non trouvé" });
      }
      return res.json({
        id,
        nom: nom.trim(),
        email: email.trim(),
        poste,
        telephone,
        actif: actif ?? true,
      });
    }
  );
});

// DELETE collaborateur
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM collaborateurs WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Erreur DELETE collaborateur:", err);
      return res
        .status(500)
        .json({
          message: "Erreur lors de la suppression du collaborateur",
          error: err.message,
        });
    }
    const info = result as ResultSetHeader;
    if (info.affectedRows === 0) {
      return res.status(404).json({ message: "Collaborateur non trouvé" });
    }
    return res.json({ message: "Collaborateur supprimé" });
  });
});

export default router;
