// src/app.js (your version — recommended)
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import reportRoutes from './routes/reportRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

const app = express();

app.use(helmet());        // ✅ Security
app.use(cors());          // ✅ Allow frontend
app.use(morgan('dev'));   // ✅ Logging (dev only)
app.use(express.json());  // ✅ Parse JSON

app.use('/api/reports', reportRoutes); // ✅ Clear, specific route
app.use('/api/dashboard', dashboardRoutes);

// Health check (great for DevOps!)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Healthcare Backend is running!' });
});

export default app;












