import { Router } from 'express';
import { prisma } from '../prismaClient';

const router = Router();

// GET /api/tickets - list tickets with optional filters
// Query params: status, propertyId, unitId, tenantId, assignedTo
router.get('/', async (req, res) => {
  const { status, propertyId, unitId, tenantId, assignedTo } = req.query;

  try {
    const where: any = {};

    if (status) {
      where.status = String(status);
    }

    if (unitId) {
      where.unitId = Number(unitId);
    }

    if (tenantId) {
      where.tenantId = Number(tenantId);
    }

    if (assignedTo) {
      where.assignedToId = Number(assignedTo);
    }

    // Filter by propertyId requires joining through unit
    if (propertyId) {
      where.unit = {
        propertyId: Number(propertyId),
      };
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        unit: {
          include: {
            property: true,
          },
        },
        tenant: true,
        assignedTo: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch tickets' });
  }
});

// GET /api/tickets/:id - get single ticket
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: 'Invalid ticket id' });
  }

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        unit: {
          include: {
            property: true,
          },
        },
        tenant: true,
        assignedTo: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch ticket' });
  }
});

// POST /api/tickets - create a new ticket
router.post('/', async (req, res) => {
  const { unitId, tenantId, title, description, priority, assignedToId } =
    req.body;

  // Validate required fields
  if (!unitId || !tenantId || !title || !description) {
    return res.status(400).json({
      message: 'unitId, tenantId, title, and description are required',
    });
  }

  // Validate priority if provided
  const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({
      message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}`,
    });
  }

  try {
    // Verify unit exists
    const unit = await prisma.unit.findUnique({
      where: { id: Number(unitId) },
    });
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    // Verify tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: Number(tenantId) },
    });
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    // Verify assigned user exists if provided
    if (assignedToId) {
      const user = await prisma.user.findUnique({
        where: { id: Number(assignedToId) },
      });
      if (!user) {
        return res.status(404).json({ message: 'Assigned user not found' });
      }
    }

    const ticket = await prisma.ticket.create({
      data: {
        unitId: Number(unitId),
        tenantId: Number(tenantId),
        title,
        description,
        priority: priority || 'MEDIUM',
        assignedToId: assignedToId ? Number(assignedToId) : null,
      },
      include: {
        unit: {
          include: {
            property: true,
          },
        },
        tenant: true,
        assignedTo: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.status(201).json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create ticket' });
  }
});

// PATCH /api/tickets/:id - update ticket status or assignment
router.patch('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: 'Invalid ticket id' });
  }

  const { status, assignedToId } = req.body;

  // Validate status if provided
  const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
    });
  }

  // Build update data object
  const updateData: any = {};
  if (status) {
    updateData.status = status;
  }
  if (assignedToId !== undefined) {
    // Verify assigned user exists if not null
    if (assignedToId !== null) {
      const user = await prisma.user.findUnique({
        where: { id: Number(assignedToId) },
      });
      if (!user) {
        return res.status(404).json({ message: 'Assigned user not found' });
      }
    }
    updateData.assignedToId = assignedToId ? Number(assignedToId) : null;
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({
      message: 'No valid fields provided for update (status, assignedToId)',
    });
  }

  try {
    const ticket = await prisma.ticket.update({
      where: { id },
      data: updateData,
      include: {
        unit: {
          include: {
            property: true,
          },
        },
        tenant: true,
        assignedTo: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update ticket' });
  }
});

// POST /api/tickets/:id/comments - add a comment to a ticket
router.post('/:id/comments', async (req, res) => {
  const ticketId = Number(req.params.id);
  if (Number.isNaN(ticketId)) {
    return res.status(400).json({ message: 'Invalid ticket id' });
  }

  const { authorId, body } = req.body;

  // Validate required fields
  if (!authorId || !body) {
    return res.status(400).json({
      message: 'authorId and body are required',
    });
  }

  if (!body.trim()) {
    return res.status(400).json({
      message: 'Comment body cannot be empty',
    });
  }

  try {
    // Verify ticket exists
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Verify author exists
    const author = await prisma.user.findUnique({
      where: { id: Number(authorId) },
    });
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    const comment = await prisma.comment.create({
      data: {
        ticketId,
        authorId: Number(authorId),
        body: body.trim(),
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create comment' });
  }
});

// DELETE /api/tickets/:id - delete a ticket
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: 'Invalid ticket id' });
  }

  try {
    // Delete associated comments first (cascade delete)
    await prisma.comment.deleteMany({
      where: { ticketId: id },
    });

    await prisma.ticket.delete({
      where: { id },
    });

    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete ticket' });
  }
});

export default router;
