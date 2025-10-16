// src/services/reportService.js

// Mock data simulating hospital records
const mockVisits = [
  { date: '2025-10-01', department: 'cardiology', visits: 45, avgWaitTime: 22 },
  { date: '2025-10-01', department: 'pediatrics', visits: 60, avgWaitTime: 18 },
  { date: '2025-10-02', department: 'emergency', visits: 85, avgWaitTime: 30 },
  { date: '2025-10-02', department: 'cardiology', visits: 50, avgWaitTime: 25 },
  { date: '2025-10-03', department: 'pediatrics', visits: 55, avgWaitTime: 20 },
];

export const generateReportData = async ({ startDate, endDate, department }) => {
  // Filter by date range and department
  const filtered = mockVisits.filter(visit => {
    const visitDate = new Date(visit.date);
    const start = new Date(startDate);
    const end = new Date(endDate);

    const inDateRange = visitDate >= start && visitDate <= end;
    const inDepartment = department === 'all' || visit.department === department;

    return inDateRange && inDepartment;
  });

  return {
    dailyStats: filtered,
    summary: {
      totalVisits: filtered.reduce((sum, v) => sum + v.visits, 0),
      avgWaitTime: filtered.length
        ? (filtered.reduce((sum, v) => sum + v.avgWaitTime, 0) / filtered.length).toFixed(1)
        : 0
    }
  };
};