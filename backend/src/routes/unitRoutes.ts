import { Router } from 'express';
import { prisma } from '../prismaClient';

const router = Router();

// GET /api/units?propertyId=1
router.get('/', async (req, res) => {
  const propertyId = req.query.propertyId
    ? Number(req.query.propertyId)
    : undefined;

  try {
    const units = await prisma.unit.findMany({
      where: propertyId ? { propertyId } : {},
    });
    res.json(units);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch units' });
  }
});

// POST /api/units
router.post('/', async (req, res) => {
  const { propertyId, unitNumber, beds, baths, sqft, status } = req.body;

  if (!propertyId || !unitNumber) {
    return res
      .status(400)
      .json({ message: 'propertyId and unitNumber are required' });
  }

  try {
    const unit = await prisma.unit.create({
      data: {
        propertyId: Number(propertyId),
        unitNumber,
        beds,
        baths,
        sqft,
        status, // VACANT/OCCUPIED/NOTICE
      },
    });
    res.status(201).json(unit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create unit' });
  }
});

export default router;
