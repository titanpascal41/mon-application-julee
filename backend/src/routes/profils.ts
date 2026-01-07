import { Router } from "express";
import { db } from "../db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

const router = Router();

// GET tous les profils
router.get("/", (_req, res) => {
  db.query("SELECT * FROM profils ORDER BY id ASC", (err, results) => {
    if (err) {
      console.error("Erreur SELECT profils:", err);
      return res
        .status(500)
        .json({ message: "Erreur lors de la récupération des profils", error: err.message });
    }
    const rows = results as RowDataPacket[];
    return res.json(rows);
  });
});

// GET un profil par id
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM profils WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error("Erreur SELECT profil:", err);
      return res
        .status(500)
        .json({ message: "Erreur lors de la récupération du profil", error: err.message });
    }
    const rows = results as RowDataPacket[];
    if (rows.length === 0) {
      return res.status(404).json({ message: "Profil non trouvé" });
    }
    return res.json(rows[0]);
  });
});

// CREATE profil
router.post("/", (req, res) => {
  const { nom } = req.body;
  if (!nom || !nom.trim()) {
    return res.status(400).json({ message: "Le nom du profil est requis" });
  }

  db.query("INSERT INTO profils (nom) VALUES (?)", [nom.trim()], (err, result) => {
    if (err) {
      console.error("Erreur INSERT profil:", err);
      return res
        .status(500)
        .json({ message: "Erreur lors de la création du profil", error: err.message });
    }
    const info = result as ResultSetHeader;
    return res.status(201).json({ id: info.insertId, nom: nom.trim() });
  });
});

// UPDATE profil
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { nom } = req.body;

  if (!nom || !nom.trim()) {
    return res.status(400).json({ message: "Le nom du profil est requis" });
  }

  db.query(
    "UPDATE profils SET nom = ? WHERE id = ?",
    [nom.trim(), id],
    (err, result) => {
      if (err) {
        console.error("Erreur UPDATE profil:", err);
        return res
          .status(500)
          .json({ message: "Erreur lors de la mise à jour du profil", error: err.message });
      }
      const info = result as ResultSetHeader;
      if (info.affectedRows === 0) {
        return res.status(404).json({ message: "Profil non trouvé" });
      }
      return res.json({ id, nom: nom.trim() });
    }
  );
});

// DELETE profil
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM profils WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Erreur DELETE profil:", err);
      return res
        .status(500)
        .json({ message: "Erreur lors de la suppression du profil", error: err.message });
    }
    const info = result as ResultSetHeader;
    if (info.affectedRows === 0) {
      return res.status(404).json({ message: "Profil non trouvé" });
    }
    return res.json({ message: "Profil supprimé" });
  });
});

export default router;
