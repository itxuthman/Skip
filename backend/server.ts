/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.ts';

import authRoutes from './routes/auth.ts';
import schoolRoutes from './routes/schools.ts';
import studentRoutes from './routes/students.ts';
import staffRoutes from './routes/staff.ts';
import academicRoutes from './routes/academics.ts';
import attendanceRoutes from './routes/attendance.ts';
import resultRoutes from './routes/results.ts';
import financeRoutes from './routes/finance.ts';
import timetableRoutes from './routes/timetables.ts';
import assignmentRoutes from './routes/assignments.ts';
import announcementRoutes from './routes/announcements.ts';
import dashboardRoutes from './routes/dashboard.ts';
import systemRoutes from './routes/system.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createBackendApp() {
  const app = express();

  app.use(express.json({ limit: '15mb' }));

  // REST API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/schools', schoolRoutes);
  app.use('/api/students', studentRoutes);
  app.use('/api/staff', staffRoutes);
  app.use('/api/academics', academicRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/results', resultRoutes);
  app.use('/api/finance', financeRoutes);
  app.use('/api/timetables', timetableRoutes);
  app.use('/api/assignments', assignmentRoutes);
  app.use('/api/announcements', announcementRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/system', systemRoutes);

  // Health and System Audit
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      databaseItems: {
        studentsCount: db.students.length,
        scoresCount: db.scores.length,
        invoicesCount: db.invoices.length,
        receiptsCount: db.receipts.length,
        attendanceCount: db.attendance.length,
        totalItems: db.students.length + db.scores.length + db.invoices.length + db.receipts.length + db.attendance.length,
      },
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/audit-logs', (req, res) => {
    const { schoolId = 'sch-001' } = req.query;
    res.json(db.auditLogs.filter((a) => a.schoolId === schoolId || !a.schoolId));
  });

  return app;
}
