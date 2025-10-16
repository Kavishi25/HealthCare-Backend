// src/controllers/dashboardController.js
import Patient from '../models/Patient.js';

export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    // 1. Total patients
    const totalPatients = await Patient.countDocuments();

    // 2. Active patients
    const activePatients = await Patient.countDocuments({ status: 'Active' });

    // 3. Today's appointments (patients who visited today)
    const todayAppointments = await Patient.countDocuments({
      lastVisit: { $gte: today, $lt: tomorrow }
    });

    // 4. Average wait time (mock for now — you'll replace with real logic later)
    // In real system, you'd have an Appointment model with `waitTime` field
    const avgWaitTime = 22.5; // placeholder

    res.json({
      totalPatients,
      activePatients,
      todayAppointments,
      avgWaitTime
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to load dashboard stats' });
  }
};