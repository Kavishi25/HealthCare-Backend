import express from "express";
import cardRoutes from "./cardRoutes.js";
import paymentRoutes from "./paymentRoutes.js";

const router = express.Router();

// Health check route
router.get("/health", (req, res) => {
  res.json({ message: "Backend is running" });
});

// Card routes
router.use("/cards", cardRoutes);

// Payment routes
router.use("/payments", paymentRoutes);

export default router;
