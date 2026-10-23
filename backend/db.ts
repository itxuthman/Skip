/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { generateLargeDatabase } from './seedLargeDatabase.ts';
import {
  School,
  User,
  Student,
  Staff,
  AcademicClass,
  Subject,
  AttendanceRecord,
  SubjectAssessmentScore,
  StudentReportCard,
  Invoice,
  PaymentReceipt,
  ExpenseRecord,
  TimetableEntry,
  Assignment,
  Announcement,
  AuditLog,
} from '../src/types/index.ts';

class CentralDatabaseStore {
  schools: School[] = [];
  classes: AcademicClass[] = [];
  subjects: Subject[] = [];
  staff: Staff[] = [];
  students: Student[] = [];
  scores: SubjectAssessmentScore[] = [];
  invoices: Invoice[] = [];
  receipts: PaymentReceipt[] = [];
  expenses: ExpenseRecord[] = [];
  users: User[] = [];
  timetables: TimetableEntry[] = [];
  assignments: Assignment[] = [];
  announcements: Announcement[] = [];
  auditLogs: AuditLog[] = [];
  attendance: AttendanceRecord[] = [];
  reportCards: StudentReportCard[] = [];

  constructor() {
    this.initCleanDatabase();
  }

  /**
   * Initializes clean school instance without demo students, dummy scores, or fake receipts.
   * Preserves authentic school definitions, class hierarchy, national subjects, and role logins.
   */
  initCleanDatabase() {
    const fullSeed = generateLargeDatabase();
    this.schools = fullSeed.schools;
    this.classes = fullSeed.classes;
    this.subjects = fullSeed.subjects;
    this.staff = fullSeed.staff;
    this.users = fullSeed.users;
    this.timetables = [];

    // All operational records wiped clean as requested
    this.students = [];
    this.scores = [];
    this.attendance = [];
    this.invoices = [];
    this.receipts = [];
    this.expenses = [];
    this.assignments = [];
    this.announcements = [];
    this.reportCards = [];

    this.auditLogs = [
      {
        id: `log-init-${Date.now()}`,
        schoolId: 'sch-001',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        actorName: 'System Administrator',
        actorRole: 'SUPER_ADMIN',
        action: 'SYSTEM_CLEAN_INIT',
        details: 'School database initialized in clean production mode with zero demo student records.',
      },
    ];
  }

  clearAllData() {
    this.students = [];
    this.scores = [];
    this.attendance = [];
    this.invoices = [];
    this.receipts = [];
    this.expenses = [];
    this.assignments = [];
    this.announcements = [];
    this.reportCards = [];
    this.timetables = [];
    this.addAuditLog('sch-001', 'Administrator', 'SUPER_ADMIN', 'DATA_PURGE', 'All demo data cleared successfully.');
  }

  seedDemoRecords() {
    const data = generateLargeDatabase();
    this.schools = data.schools;
    this.classes = data.classes;
    this.subjects = data.subjects;
    this.staff = data.staff;
    this.students = data.students;
    this.scores = data.scores;
    this.attendance = data.attendance;
    this.invoices = data.invoices;
    this.receipts = data.receipts;
    this.expenses = data.expenses;
    this.users = data.users;
    this.timetables = data.timetables;
    this.assignments = data.assignments;
    this.announcements = data.announcements;
    this.auditLogs = data.auditLogs;
    this.addAuditLog('sch-001', 'Administrator', 'SUPER_ADMIN', 'DEMO_SEED', 'Loaded sample demographic and academic records.');
  }

  addAuditLog(schoolId: string, actorName: string, actorRole: any, action: string, details: string) {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      schoolId,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName,
      actorRole,
      action,
      details,
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 300) this.auditLogs.pop();
  }
}

export const db = new CentralDatabaseStore();
