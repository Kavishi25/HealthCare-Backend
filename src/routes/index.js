import express from "express";
const router = express.Router();

import appointmentRoutes from "./appointmentRoutes.js";
import doctorRoutes from "./doctorRoutes.js";

router.use("/appointments", appointmentRoutes);
router.use("/doctors", doctorRoutes);

// Example test route
router.get("/health", (req, res) => {
  res.json({ message: "Backend is running" });
});

export default router;
