import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";
import patientRoutes from "./routes/patientRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("API is running");
});

// Mount all API routes under /api
app.use("/api", routes);

app.get("/", (req, res) => {
  res.send("HealthCare API is running");
});

app.use("/api/patients", patientRoutes);


export default app;
