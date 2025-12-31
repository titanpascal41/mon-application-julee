const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const societeRoutes = require("./routes/societesRoutes");
const demandeRoutes = require("./routes/demandesRoutes");
const collaborateurRoutes = require("./routes/collaborateursRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/societes", societeRoutes);
app.use("/api/demandes", demandeRoutes);
app.use("/api/collaborateurs", collaborateurRoutes);

// Middleware d'erreur
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Erreur serveur", detail: err.message });
});

const PORT = process.env.PORT || 4000;

if (require.main === module) {
  app.listen(PORT, () => console.log(`API démarrée sur le port ${PORT}`));
}

module.exports = app;

