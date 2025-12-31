import express, { Request, Response } from 'express';

const app = express();
const PORT = 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Serveur Node.js + TypeScript opérationnel !');
});

app.listen(PORT, () => {
  console.log(`[server]: Serveur démarré sur http://localhost:${PORT}`);
});
