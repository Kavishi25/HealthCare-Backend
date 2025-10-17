// src/controllers/reportController.js
import { generateReportData } from '../services/reportService.js';

export const getReports = async (req, res) => {
  try {
    const { startDate, endDate, department = 'all' } = req.query;

    // Validate dates (basic)
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const reportData = await generateReportData({ startDate, endDate, department });

    res.json(reportData);
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};