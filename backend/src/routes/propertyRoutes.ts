import { Router } from 'express';
import { prisma } from '../prismaClient';

const router = Router();

// GET /api/properties - list all properties (with units)
router.get('/', async (_req, res) => {
  try {
    const properties = await prisma.property.findMany({
      include: { units: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json(properties);
  } catch (err) {
    console.error('Error fetching properties', err);
    res.status(500).json({ message: 'Failed to fetch properties' });
  }
});

// GET /api/properties/:id - single property
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: 'Invalid id' });
  }

  try {
    const property = await prisma.property.findUnique({
      where: { id },
      include: { units: true },
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json(property);
  } catch (err) {
    console.error('Error fetching property', err);
    res.status(500).json({ message: 'Failed to fetch property' });
  }
});

// POST /api/properties - create
router.post('/', async (req, res) => {
  const { name, address, city, state, zip, beds, baths } = req.body;

  if (!name || !address) {
    return res.status(400).json({ message: 'name and address are required' });
  }

  // convert optional beds/baths to numbers or undefined
  const bedsNum =
    beds === undefined || beds === null || beds === ''
      ? undefined
      : Number(beds);
  const bathsNum =
    baths === undefined || baths === null || baths === ''
      ? undefined
      : Number(baths);

  try {
    const property = await prisma.property.create({
      data: {
        name,
        address,
        city,
        state,
        zip,
        beds: bedsNum,
        baths: bathsNum,
      },
    }as any);
    res.status(201).json(property);
  } catch (err) {
    console.error('Error creating property', err);
    res.status(500).json({ message: 'Failed to create property' });
  }
});

// PUT /api/properties/:id - update basic fields
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: 'Invalid id' });
  }

  const { name, address, city, state, zip, beds, baths } = req.body;

  const bedsNum =
    beds === undefined || beds === null || beds === ''
      ? undefined
      : Number(beds);
  const bathsNum =
    baths === undefined || baths === null || baths === ''
      ? undefined
      : Number(baths);

  try {
    const property = await prisma.property.update({
      where: { id },
      data: {
        name,
        address,
        city,
        state,
        zip,
        beds: bedsNum,
        baths: bathsNum,
      },
    } as any);

    res.json(property);
  } catch (err) {
    console.error('Error updating property', err);
    res.status(500).json({ message: 'Failed to update property' });
  }
});

// DELETE /api/properties/:id
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: 'Invalid id' });
  }

  try {
    await prisma.property.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    console.error('Error deleting property', err);
    res.status(500).json({ message: 'Failed to delete property' });
  }
});

export default router;
