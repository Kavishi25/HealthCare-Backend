import express from "express";
import { getAvailableSlots, bookAppointment, getPatientAppointments, cancelAppointment, getAllAppointments, deleteAppointment } from "../controllers/appointmentController.js";

const router = express.Router();

router.get("/slots", getAvailableSlots);                // GET /api/appointments/slots?doctorId=...&date=...
router.post("/book", bookAppointment);                 // POST /api/appointments/book
router.get("/patient/:patientId", getPatientAppointments); // GET /api/appointments/patient/:patientId
router.patch("/cancel/:appointmentId", cancelAppointment); // PATCH /api/appointments/cancel/:appointmentId
router.get("/all", getAllAppointments);
router.delete("/:appointmentId", deleteAppointment);

export default router;
