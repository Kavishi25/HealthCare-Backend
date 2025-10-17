import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";
import patientRoutes from "./routes/patientRoutes.js";
import helmet from 'helmet';
import morgan from 'morgan';
import reportRoutes from './routes/reportRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';


dotenv.config();
connectDB();


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

// --- Main API Routes ---
// Mount main routes (appointments, doctors, cards, payments)
app.use('/api', routes);

// --- Specific API Routes ---
// Mounting specific route modules under /api
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/patients', patientRoutes);

// --- Health Check Route ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Healthcare Backend is running!' });
});

app.get("/", (req, res) => {
  res.send("HealthCare API is running");
});

app.use("/api/patients", patientRoutes);


export default app;

