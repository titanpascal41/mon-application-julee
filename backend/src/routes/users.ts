import { Router } from "express";
import { db } from "../db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

const router = Router();

// GET all
router.get("/", (_req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) {
      console.error("Erreur SELECT users:", err);
      return res.status(500).json({ message: "Erreur lors de la récupération", error: err.message });
    }
    const rows = results as RowDataPacket[];
    return res.json(rows);
  });
});

// GET by id
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM users WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error("Erreur SELECT user:", err);
      return res.status(500).json({ message: "Erreur lors de la récupération", error: err.message });
    }
    const rows = results as RowDataPacket[];
    if (rows.length === 0) return res.status(404).json({ message: "Utilisateur non trouvé" });
    return res.json(rows[0]);
  });
});

// CREATE
router.post("/", (req, res) => {
  const { nom, prenom, email, motDePasse, profilId, description, name } = req.body;

  // Support ancien format (name) ou nouveau format (nom + prenom)
  const finalName = name || (prenom && nom ? `${prenom} ${nom}` : nom || prenom || name);

  if (!email) return res.status(400).json({ message: "Le champ email est requis" });
  if (!finalName) return res.status(400).json({ message: "Le nom ou prénom est requis" });

  const hasExtendedFields = req.body.nom !== undefined || req.body.prenom !== undefined;

  if (hasExtendedFields && nom && prenom) {
    db.query(
      "INSERT INTO users (name, emal, nom, prenom, motDePasse, profilId, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [finalName, email, nom, prenom, motDePasse || null, profilId || null, description || null],
      (err, result) => {
        if (err) {
          if (err.code === "ER_BAD_FIELD_ERROR") {
            db.query(
              "INSERT INTO users (name, emal) VALUES (?, ?)",
              [finalName, email],
              (err2, result2) => {
                if (err2) {
                  console.error("Erreur INSERT user:", err2);
                  return res
                    .status(500)
                    .json({ message: "Erreur lors de la création", error: err2.message });
                }
                const info = result2 as ResultSetHeader;
                return res.status(201).json({
                  id: info.insertId,
                  name: finalName,
                  email,
                  nom,
                  prenom,
                  profilId,
                  description,
                });
              }
            );
          } else {
            console.error("Erreur INSERT user:", err);
            return res.status(500).json({ message: "Erreur lors de la création", error: err.message });
          }
        } else {
          const info = result as ResultSetHeader;
          return res.status(201).json({
            id: info.insertId,
            name: finalName,
            email,
            nom,
            prenom,
            profilId,
            description,
          });
        }
      }
    );
  } else {
    db.query(
      "INSERT INTO users (name, emal) VALUES (?, ?)",
      [finalName, email],
      (err, result) => {
        if (err) {
          console.error("Erreur INSERT user:", err);
          return res
            .status(500)
            .json({ message: "Erreur lors de la création", error: err.message });
        }
        const info = result as ResultSetHeader;
        return res.status(201).json({ id: info.insertId, name: finalName, email });
      }
    );
  }
});

// UPDATE
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  if (!name && !email) return res.status(400).json({ message: "Aucun champ à mettre à jour" });

  const fields: string[] = [];
  const values: any[] = [];
  if (name) {
    fields.push("name = ?");
    values.push(name);
  }
  if (email) {
    fields.push("emal = ?");
    values.push(email);
  }
  values.push(id);

  db.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values, (err, result) => {
    if (err) {
      console.error("Erreur UPDATE user:", err);
      return res.status(500).json({ message: "Erreur lors de la mise à jour", error: err.message });
    }
    const info = result as ResultSetHeader;
    if (info.affectedRows === 0) return res.status(404).json({ message: "Utilisateur non trouvé" });
    return res.json({ id, name, email });
  });
});

// DELETE
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM users WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Erreur DELETE user:", err);
      return res.status(500).json({ message: "Erreur lors de la suppression", error: err.message });
    }
    const info = result as ResultSetHeader;
    if (info.affectedRows === 0) return res.status(404).json({ message: "Utilisateur non trouvé" });
    return res.json({ message: "Utilisateur supprimé" });
  });
});

export default router;
