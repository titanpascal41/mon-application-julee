import mysql from "mysql2";
import { config } from "dotenv";
import { Request, Response, NextFunction } from "express";

config();

export const db = mysql.createConnection({
  host: process.env.MYSQL_HOST as string,
  user: process.env.MYSQL_USER as string,
  password: process.env.MYSQL_PASSWORD as string,
  database: process.env.MYSQL_DATABASE as string,
  port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
});

export let dbReady = false;

db.connect((err) => {
  if (err) {
    console.error("Connexion MySQL échouée :", err.message);
    dbReady = false;
    return;
  }
  dbReady = true;
  console.log("Connecté à la base de données MySQL!");
});

export const requireDbReady = (_req: Request, res: Response, next: NextFunction) => {
  if (!dbReady) {
    return res
      .status(503)
      .json({ message: "Base MySQL non connectée. Vérifiez l'instance ou la configuration." });
  }
  next();
};
