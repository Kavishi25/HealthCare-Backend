import express from "express";
import cardRoutes from "./cardRoutes.js";
import paymentRoutes from "./paymentRoutes.js";

const router = express.Router();

import appointmentRoutes from "./appointmentRoutes.js";
import doctorRoutes from "./doctorRoutes.js";

router.use("/appointments", appointmentRoutes);
router.use("/doctors", doctorRoutes);

import appointmentRoutes from "./appointmentRoutes.js";
import doctorRoutes from "./doctorRoutes.js";

router.use("/appointments", appointmentRoutes);
router.use("/doctors", doctorRoutes);

// Health check route
router.get("/health", (req, res) => {
  res.json({ message: "Backend is running" });
});

// Card routes
router.use("/cards", cardRoutes);

// Payment routes
router.use("/payments", paymentRoutes);

export default router;
