const prisma = require("../prismaClient");

const list = async (_req, res) => {
  const data = await prisma.collaborateur.findMany({ orderBy: { id: "asc" } });
  res.json(data);
};

const create = async (req, res, next) => {
  try {
    const { nom, email, poste, telephone, actif = true } = req.body;
    if (!nom || !email) {
      return res.status(400).json({ message: "nom et email sont obligatoires" });
    }
    const collab = await prisma.collaborateur.create({
      data: { nom, email, poste: poste || null, telephone: telephone || null, actif },
    });
    res.status(201).json(collab);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { nom, email, poste, telephone, actif } = req.body;
    const collab = await prisma.collaborateur.update({
      where: { id },
      data: { nom, email, poste, telephone, actif },
    });
    res.json(collab);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.collaborateur.delete({ where: { id } });
    res.json({ message: "Supprimé" });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, create, update, remove };

