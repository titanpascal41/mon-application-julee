const prisma = require("../prismaClient");

const list = async (_req, res) => {
  const data = await prisma.societe.findMany({
    orderBy: { id: "asc" },
  });
  res.json(data);
};

const create = async (req, res, next) => {
  try {
    const { nom, description, adresse, telephone, email } = req.body;
    if (!nom) return res.status(400).json({ message: "Le nom est obligatoire" });
    const societe = await prisma.societe.create({
      data: { nom, description: description || null, adresse, telephone, email },
    });
    res.status(201).json(societe);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { nom, description, adresse, telephone, email } = req.body;
    const societe = await prisma.societe.update({
      where: { id },
      data: { nom, description, adresse, telephone, email },
    });
    res.json(societe);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.societe.delete({ where: { id } });
    res.json({ message: "Supprimé" });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, create, update, remove };

