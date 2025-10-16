import express from "express";
import { addDoctor, getDoctors, getDoctorById, updateDoctor, deleteDoctor } from "../controllers/doctorController.js";

const router = express.Router();

// Admin routes
router.post("/", addDoctor);          // Add new doctor
router.get("/", getDoctors);          // List all doctors
router.get("/:id", getDoctorById);    // Get single doctor
router.put("/:id", updateDoctor);     // Update doctor
router.delete("/:id", deleteDoctor);  // Delete doctor

export default router;
