const prisma = require("../prismaClient");

const list = async (_req, res) => {
  const data = await prisma.demande.findMany({
    orderBy: { id: "asc" },
    include: { societe: true, interlocuteur: true },
  });
  res.json(data);
};

const create = async (req, res, next) => {
  try {
    const {
      dateReception,
      description,
      priorite,
      statut,
      societeId,
      interlocuteurId,
      interlocuteurNom,
    } = req.body;

    if (!dateReception || !societeId) {
      return res
        .status(400)
        .json({ message: "dateReception et societeId sont obligatoires" });
    }

    const demande = await prisma.demande.create({
      data: {
        dateReception: new Date(dateReception),
        dateEnregistrement: new Date(),
        description: description || null,
        priorite: priorite || null,
        statut: statut || null,
        societeId: Number(societeId),
        interlocuteurId: interlocuteurId ? Number(interlocuteurId) : null,
        interlocuteurNom: interlocuteurNom || null,
      },
    });
    res.status(201).json(demande);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const {
      dateReception,
      description,
      priorite,
      statut,
      societeId,
      interlocuteurId,
      interlocuteurNom,
    } = req.body;
    const demande = await prisma.demande.update({
      where: { id },
      data: {
        ...(dateReception && { dateReception: new Date(dateReception) }),
        description,
        priorite,
        statut,
        societeId: societeId ? Number(societeId) : undefined,
        interlocuteurId: interlocuteurId ? Number(interlocuteurId) : null,
        interlocuteurNom: interlocuteurNom ?? undefined,
        dateModification: new Date(),
      },
    });
    res.json(demande);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.demande.delete({ where: { id } });
    res.json({ message: "Supprimé" });
  } catch (err) {
    next(err);
  }
};

module.exports = { list, create, update, remove };

