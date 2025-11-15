import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import propertyRouter from './routes/propertyRoutes';
import unitRouter from './routes/unitRoutes';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173', // Vite dev server
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// --- Health check ---
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'LeaseLink API' });
});

// --- My (Miguel's) Core stuff ---
app.use('/api/properties', propertyRouter);
app.use('/api/units', unitRouter);

// TODO (Shawn / Tristan): /api/auth, /api/tenants, /api/leases, /api/tickets, etc.

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
