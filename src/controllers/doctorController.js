import Doctor from "../models/doctorModel.js";

// Add new doctor
export const addDoctor = async (req, res) => {
  try {
    const { name, specialty, availableSlots } = req.body;
    const doctor = new Doctor({ name, specialty, availableSlots });
    await doctor.save();
    res.status(201).json({ message: "Doctor added successfully", doctor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all doctors
export const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single doctor by ID
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update doctor
export const updateDoctor = async (req, res) => {
  try {
    const { name, specialty, availableSlots } = req.body;
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { name, specialty, availableSlots },
      { new: true }
    );
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json({ message: "Doctor updated", doctor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete doctor
export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json({ message: "Doctor deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
