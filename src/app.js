import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Specific API route imports (from the second file)
import reportRoutes from './routes/reportRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import patientRoutes from './routes/patientRoutes.js';

// Note: The generic 'routes' import from the first file is omitted 
// in favor of the more specific, explicit route imports above.

const app = express();

// --- Core Middleware Setup (Leveraging the best from the second file) ---
app.use(helmet());        // Essential security headers
app.use(cors());          // Allows cross-origin requests
app.use(morgan('dev'));   // Request logging (helpful in development)
app.use(express.json());  // Parses incoming JSON payloads

// --- Root Route (from the first file) ---
app.get("/", (req, res) => {
  res.send("Healthcare API Backend is running and ready for specific routes at /api/*");
});

// --- Specific API Routes (from the second file) ---
// Mounting specific route modules under /api
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/patients', patientRoutes);

// --- Health Check Route (from the second file) ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Healthcare Backend is running!' });
});

export default app;