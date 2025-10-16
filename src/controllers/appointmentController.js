import Appointment from "../models/appointmentModel.js";
import Doctor from "../models/doctorModel.js";
import Patient from "../models/patientModel.js";

// 1. Get available slots for a doctor
export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const daySlots = doctor.availableSlots.find(s => s.date.toISOString().split("T")[0] === new Date(date).toISOString().split("T")[0]);

    // Check booked slots
    const bookedAppointments = await Appointment.find({ doctor: doctorId, date: new Date(date) });
    const bookedSlots = bookedAppointments.map(a => a.slot);

    const available = daySlots?.slots.filter(slot => !bookedSlots.includes(slot)) || [];
    res.json({ available });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2. Book appointment
export const bookAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, date, slot } = req.body;

    // Check if slot already booked (Concurrency control)
    const existing = await Appointment.findOne({ doctor: doctorId, date, slot });
    if (existing) return res.status(400).json({ message: "Slot already booked, please choose another" });

    const appointment = new Appointment({ patient: patientId, doctor: doctorId, date, slot });
    await appointment.save();

    res.status(201).json({ message: "Appointment booked successfully", appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3. Get patient appointments
export const getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;
    const appointments = await Appointment.find({ patient: patientId }).populate("doctor", "name specialty");
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 4. Cancel appointment
export const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const appointment = await Appointment.findByIdAndUpdate(appointmentId, { status: "Cancelled" }, { new: true });
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    res.json({ message: "Appointment cancelled", appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("doctor", "name specialty email")
      .populate("patient", "name email")
      .sort({ date: -1 }); // Sort latest first

    res.status(200).json({
      total: appointments.length,
      appointments,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const deletedAppointment = await Appointment.findByIdAndDelete(appointmentId);

    if (!deletedAppointment)
      return res.status(404).json({ message: "Appointment not found" });

    res.status(200).json({
      message: "Appointment deleted successfully",
      deletedAppointment,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};