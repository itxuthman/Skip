/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { db } from '../db.ts';
import { calculateAttendanceMetrics } from '../../src/utils/academicCalculations.ts';

const router = Router();

router.get('/stats', (req, res) => {
  const schoolId = (req.query.schoolId as string) || 'sch-001';
  const schoolStudents = db.students.filter((s) => s.schoolId === schoolId && s.status === 'ACTIVE');
  const schoolStaff = db.staff.filter((s) => s.schoolId === schoolId && s.status === 'ACTIVE');
  const schoolClasses = db.classes.filter((c) => c.schoolId === schoolId);

  // Invoices & fees
  const schoolInvoices = db.invoices.filter((i) => i.schoolId === schoolId);
  const totalInvoiced = schoolInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalFeesCollected = schoolInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const outstandingFees = schoolInvoices.reduce((sum, inv) => sum + inv.balance, 0);

  // Expenses
  const schoolExpenses = db.expenses.filter((e) => e.schoolId === schoolId && e.status === 'APPROVED');
  const totalExpenses = schoolExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Today's attendance
  const today = '2026-10-22';
  const todayAttendance = db.attendance.filter((a) => a.schoolId === schoolId && a.date === today);
  const attendanceMetrics = calculateAttendanceMetrics(todayAttendance as any);

  // Student population by class
  const populationByClass = schoolClasses.map((c) => {
    const count = schoolStudents.filter((s) => s.classId === c.id).length;
    return { className: c.name, count };
  });

  // Recent admissions
  const recentAdmissions = [...schoolStudents]
    .sort((a, b) => new Date(b.admissionDate).getTime() - new Date(a.admissionDate).getTime())
    .slice(0, 5);

  // Recent transactions
  const recentTransactions = db.receipts
    .filter((r) => r.schoolId === schoolId)
    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
    .slice(0, 5);

  // Recent audit activity
  const recentActivities = db.auditLogs
    .filter((a) => a.schoolId === schoolId || !a.schoolId)
    .slice(0, 6);

  // Fee collection chart data
  const feeChartData = [
    { term: '1st Term 24/25', collected: 28400000, target: 30000000 },
    { term: '2nd Term 24/25', collected: 29100000, target: 30000000 },
    { term: '3rd Term 24/25', collected: 31200000, target: 32000000 },
    { term: '1st Term 25/26', collected: 34500000, target: 35000000 },
    { term: '2nd Term 25/26 (Current)', collected: totalFeesCollected, target: totalInvoiced },
  ];

  // Attendance overview weekly trend
  const attendanceWeeklyTrend = [
    { day: 'Mon', rate: 96, present: 480, absent: 20 },
    { day: 'Tue', rate: 98, present: 490, absent: 10 },
    { day: 'Wed', rate: 95, present: 475, absent: 25 },
    { day: 'Thu', rate: 97, present: 485, absent: 15 },
    { day: 'Fri', rate: 93, present: 465, absent: 35 },
  ];

  res.json({
    totalStudents: schoolStudents.length,
    totalStaff: schoolStaff.length,
    totalClasses: schoolClasses.length,
    todayAttendanceRate: attendanceMetrics.attendanceRate,
    attendanceCounts: attendanceMetrics,
    outstandingFees,
    totalFeesCollected,
    totalExpenses,
    netFinancialBalance: totalFeesCollected - totalExpenses,
    populationByClass,
    recentAdmissions,
    recentTransactions,
    recentActivities,
    feeChartData,
    attendanceWeeklyTrend,
  });
});

export default router;
