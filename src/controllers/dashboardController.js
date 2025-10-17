// src/controllers/dashboardController.js
import Patient from '../models/patientModel.js';

export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    // Start of the inner logic block, which was missing its closing brace '}' 
    // and was incorrectly wrapped in a redundant second 'try' block.

    console.log('Fetching total patients...');
    const totalPatients = await Patient.countDocuments();

    console.log('Fetching active patients...');
    const activePatients = await Patient.countDocuments({ status: 'Active' });

    console.log('Fetching today appointments...');
    const todayAppointments = await Patient.countDocuments({
      lastVisit: { $exists: true, $gte: today, $lt: tomorrow }
    });

    const avgWaitTime = 22.5;

    res.json({ totalPatients, activePatients, todayAppointments, avgWaitTime });

  } catch (error) { // This 'catch' block now handles all logic within the single 'try'
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to load dashboard stats' });
  }
}; 
// The missing closing brace '}' for the 'getDashboardStats' function is added here.