// "use strict";
// const justine = {
//     name: 'Justine',
//     age: 23,
// };
// function isAdult(user) {
//     return user.age >= 18;
// }
// console.log(`${justine.name} is an adult: ${isAdult(justine)}`);

const express = require("express");
const app = express();

// 1. On importe les connexions depuis ton dossier config
// Chemin corrigé : le fichier est dans ../config/config/db.js
const { mysqlPool, pgPool } = require("../config/config/db");

// (Optionnel) Tes middlewares habituels
app.use(express.json());

// 2. Route de test MySQL seule
app.get("/test-mysql", async (_req, res) => {
  try {
    const [rows] = await mysqlPool.query(
      'SELECT "MySQL est connecté !" AS message'
    );
    res.json({ status: "Succès", database_mysql: rows[0].message });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ status: "Erreur de connexion MySQL", error: err.message });
  }
});

// 3. Route de test combinée MySQL + PostgreSQL (le code que tu as copié)
app.get("/test-db", async (req, res) => {
  try {
    // Test MySQL
    const [mysqlResult] = await mysqlPool.query(
      'SELECT "MySQL est connecté !" AS message'
    );

    // Test PostgreSQL
    const pgResult = await pgPool.query(
      "SELECT 'PostgreSQL est connecté !' AS message"
    );

    res.json({
      status: "Succès",
      database_mysql: mysqlResult[0].message,
      database_pg: pgResult.rows[0].message,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "Erreur de connexion",
      error: err.message,
    });
  }
});

// 4. Le lancement du serveur (toujours à la fin)
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
