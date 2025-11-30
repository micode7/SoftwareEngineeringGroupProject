import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import propertyRouter from './routes/propertyRoutes';
import unitRouter from './routes/unitRoutes';
import ticketRouter from './routes/ticketRoutes';
import authRouter from './routes/authRoutes';
import { authenticate } from './middleware/authMiddleware';

const app = express();

// --- Global middleware ---
app.use(
  cors({
    origin: 'http://localhost:5173', // Vite dev server
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// --- Public routes ---

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'LeaseLink API' });
});

// Auth (login / register / logout / me)
app.use('/api/auth', authRouter);

// --- Protected routes (must be logged in) ---
app.use('/api/properties', propertyRouter);
app.use('/api/units', unitRouter);
app.use('/api/tickets', ticketRouter);

// TODO: tenants, leases, reports, etc.

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

export default app;
