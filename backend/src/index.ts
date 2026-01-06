import express, { Request, Response } from "express";
import cors from "cors";
import { config } from "dotenv";
import mysql, { ResultSetHeader, RowDataPacket } from "mysql2";

config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.MYSQL_HOST as string,
  user: process.env.MYSQL_USER as string,
  password: process.env.MYSQL_PASSWORD as string,
  database: process.env.MYSQL_DATABASE as string,
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connecté à la base de données MySQL!");
});

app.get("/", (_req: Request, res: Response) => {
  res.send("Serveur Node.js + TypeScript opérationnel !");
});

// =====================
// CRUD PROFILS
// =====================

// GET tous les profils
app.get("/profils", (_req: Request, res: Response) => {
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
app.get("/profils/:id", (req: Request, res: Response) => {
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
app.post("/profils", (req: Request, res: Response) => {
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
app.put("/profils/:id", (req: Request, res: Response) => {
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
app.delete("/profils/:id", (req: Request, res: Response) => {
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

// =====================
// CRUD SOCIETES
// =====================

// GET toutes les sociétés
app.get("/societes", (_req: Request, res: Response) => {
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
app.get("/societes/:id", (req: Request, res: Response) => {
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
app.post("/societes", (req: Request, res: Response) => {
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
app.put("/societes/:id", (req: Request, res: Response) => {
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
app.delete("/societes/:id", (req: Request, res: Response) => {
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

// =====================
// CRUD COLLABORATEURS
// =====================

// GET tous les collaborateurs
app.get("/collaborateurs", (_req: Request, res: Response) => {
  db.query("SELECT * FROM collaborateurs ORDER BY id ASC", (err, results) => {
    if (err) {
      console.error("Erreur SELECT collaborateurs:", err);
      return res
        .status(500)
        .json({ message: "Erreur lors de la récupération des collaborateurs", error: err.message });
    }
    const rows = results as RowDataPacket[];
    return res.json(rows);
  });
});

// GET un collaborateur par id
app.get("/collaborateurs/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  db.query("SELECT * FROM collaborateurs WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error("Erreur SELECT collaborateur:", err);
      return res
        .status(500)
        .json({ message: "Erreur lors de la récupération du collaborateur", error: err.message });
    }
    const rows = results as RowDataPacket[];
    if (rows.length === 0) {
      return res.status(404).json({ message: "Collaborateur non trouvé" });
    }
    return res.json(rows[0]);
  });
});

// CREATE collaborateur
app.post("/collaborateurs", (req: Request, res: Response) => {
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
          .json({ message: "Erreur lors de la création du collaborateur", error: err.message });
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
app.put("/collaborateurs/:id", (req: Request, res: Response) => {
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
          .json({ message: "Erreur lors de la mise à jour du collaborateur", error: err.message });
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
app.delete("/collaborateurs/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  db.query("DELETE FROM collaborateurs WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Erreur DELETE collaborateur:", err);
      return res
        .status(500)
        .json({ message: "Erreur lors de la suppression du collaborateur", error: err.message });
    }
    const info = result as ResultSetHeader;
    if (info.affectedRows === 0) {
      return res.status(404).json({ message: "Collaborateur non trouvé" });
    }
    return res.json({ message: "Collaborateur supprimé" });
  });
});

// =====================
// CRUD USERS
// =====================
// GET all
app.get("/users", (_req: Request, res: Response) => {
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
app.get("/users/:id", (req: Request, res: Response) => {
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
app.post("/users", (req: Request, res: Response) => {
  const { nom, prenom, email, motDePasse, profilId, description, name } = req.body;

  // Support ancien format (name) ou nouveau format (nom + prenom)
  const finalName =
    name || (prenom && nom ? `${prenom} ${nom}` : nom || prenom || name);

  if (!email)
    return res.status(400).json({ message: "Le champ email est requis" });
  if (!finalName)
    return res.status(400).json({ message: "Le nom ou prénom est requis" });

  // Construire la requête selon les colonnes disponibles
  // Si la table a les colonnes nom, prenom, motDePasse, profilId, description, on les utilise
  // Sinon on utilise seulement name et emal (nom de colonne actuel dans MySQL)
  const hasExtendedFields =
    req.body.nom !== undefined || req.body.prenom !== undefined;

  if (hasExtendedFields && nom && prenom) {
    // Format étendu avec toutes les colonnes
    db.query(
      "INSERT INTO users (name, emal, nom, prenom, motDePasse, profilId, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [finalName, email, nom, prenom, motDePasse || null, profilId || null, description || null],
      (err, result) => {
        if (err) {
          // Si erreur car colonnes n'existent pas, essayer avec seulement name et email
          if (err.code === "ER_BAD_FIELD_ERROR") {
            db.query(
              "INSERT INTO users (name, emal) VALUES (?, ?)",
              [finalName, email],
              (err2, result2) => {
              if (err2) {
                console.error("Erreur INSERT user:", err2);
                return res.status(500).json({ message: "Erreur lors de la création", error: err2.message });
              }
              const info = result2 as ResultSetHeader;
              return res.status(201).json({ 
                id: info.insertId, 
                name: finalName, 
                email,
                nom,
                prenom,
                profilId,
                description 
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
            description 
          });
        }
      }
    );
  } else {
    // Format simple (name + email seulement) -> colonne emal dans MySQL
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
        return res
          .status(201)
          .json({ id: info.insertId, name: finalName, email });
      }
    );
  }
});

// UPDATE
app.put("/users/:id", (req: Request, res: Response) => {
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
    // Colonne emal dans MySQL
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
app.delete("/users/:id", (req: Request, res: Response) => {
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

app.get("/close-db", (_req: Request, res: Response) => {
  // Si la connexion est déjà fermée, on répond immédiatement
  if (db.state === "disconnected") {
    return res.json({ message: "Connexion MySQL déjà fermée." });
  }

  db.end((err) => {
    if (err) {
      console.error("Erreur lors de la fermeture de MySQL:", err);
      return res
        .status(500)
        .json({ message: "Erreur lors de la fermeture de MySQL", error: err.message });
    }

    console.log("Connexion MySQL fermée proprement.");
    return res.json({ message: "Connexion MySQL fermée." });
  });
});

app.listen(PORT, () => {
  console.log(`[server]: Serveur démarré sur http://localhost:${PORT}`);
});
