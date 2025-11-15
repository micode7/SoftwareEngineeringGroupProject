import express from 'express';
import { Router } from 'express';
import { prisma } from '../prismaClient';

const router = Router();

// GET /api/properties - list all properties (with units)
router.get('/', async (_req, res) => {
  try {
    const properties = await prisma.property.findMany({
      include: { units: true },
    });
    res.json(properties);
  } catch (err) {
    console.error(err);
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
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch property' });
  }
});

// POST /api/properties - create
router.post('/', async (req, res) => {
  const { name, address, city, state, zip } = req.body;

  if (!name || !address) {
    return res.status(400).json({ message: 'name and address are required' });
  }

  try {
    const property = await prisma.property.create({
      data: {
        name,
        address,
        city,
        state,
        zip,
      },
    });
    res.status(201).json(property);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create property' });
  }
});

// PUT /api/properties/:id - update basic fields
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: 'Invalid id' });
  }

  const { name, address, city, state, zip } = req.body;

  try {
    const property = await prisma.property.update({
      where: { id },
      data: { name, address, city, state, zip },
    });

    res.json(property);
  } catch (err) {
    console.error(err);
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
    console.error(err);
    res.status(500).json({ message: 'Failed to delete property' });
  }
});

export default router;
