import express from "express";
const router = express.Router();

// Example test route
router.get("/health", (req, res) => {
  res.json({ message: "Backend is running" });
});

export default router;
