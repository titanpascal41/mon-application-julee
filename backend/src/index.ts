import express from "express";
import cors from "cors";
import { config } from "dotenv";
import { requireDbReady } from "./db";
import profilsRoutes from "./routes/profils";
import societesRoutes from "./routes/societes";
import collaborateursRoutes from "./routes/collaborateurs";
import usersRoutes from "./routes/users";
import statutsRoutes from "./routes/statuts";

config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(requireDbReady);

app.get("/", (_req, res) => {
  res.send("Serveur Node.js + TypeScript opérationnel !");
});

app.use("/profils", profilsRoutes);
app.use("/societes", societesRoutes);
app.use("/collaborateurs", collaborateursRoutes);
app.use("/users", usersRoutes);
app.use("/statuts", statutsRoutes);

app.listen(PORT, () => {
  console.log(`[server]: Serveur démarré sur http://localhost:${PORT}`);
});
