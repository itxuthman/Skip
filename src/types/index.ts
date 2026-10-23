/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole =
  | 'SUPER_ADMIN'
  | 'SCHOOL_ADMIN'
  | 'PRINCIPAL'
  | 'TEACHER'
  | 'STUDENT'
  | 'PARENT'
  | 'ACCOUNTANT'
  | 'REGISTRAR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId?: string;
  schoolName?: string;
  avatar?: string;
  studentId?: string; // If role is STUDENT
  linkedStudentIds?: string[]; // If role is PARENT
  assignedClassIds?: string[]; // If role is TEACHER
  assignedSubjectIds?: string[]; // If role is TEACHER
}

export interface School {
  id: string;
  name: string;
  code: string;
  motto: string;
  logo: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  principalName: string;
  establishedYear: number;
  activeSession: string; // e.g. "2025/2026"
  activeTerm: string; // e.g. "Second Term"
  subscriptionPlan: 'Basic' | 'Standard' | 'Premium';
  subscriptionStatus: 'Active' | 'Trial' | 'Suspended';
  studentCapacity: number;
  currency: string; // "₦"
}

export interface Student {
  id: string;
  schoolId: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  gender: 'Male' | 'Female';
  dateOfBirth: string;
  classId: string;
  className: string;
  armId: string;
  armName: string;
  admissionDate: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'GRADUATED' | 'TRANSFERRED';
  avatarUrl: string;
  stateOfOrigin: string;
  lga: string;
  address: string;
  guardian: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
    address: string;
    occupation: string;
  };
  bloodGroup?: string;
  genotype?: string;
  allergies?: string;
}

export interface Staff {
  id: string;
  schoolId: string;
  staffId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  designation: string;
  qualification: string;
  employmentDate: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED';
  avatarUrl: string;
  assignedSubjects: { id: string; name: string }[];
  assignedClasses: { id: string; name: string }[];
}

export interface AcademicClass {
  id: string;
  schoolId: string;
  name: string; // "JSS 1", "SSS 2 (Science)", "Primary 4"
  level: 'NURSERY' | 'PRIMARY' | 'JUNIOR_SECONDARY' | 'SENIOR_SECONDARY';
  arms: { id: string; name: string; classTeacherId?: string }[];
  subjects: string[]; // subjectIds
}

export interface Subject {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  category: 'General' | 'Science' | 'Arts' | 'Commercial' | 'Vocational';
}

export interface AttendanceRecord {
  id: string;
  schoolId: string;
  classId: string;
  armId?: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  studentName: string;
  admissionNumber: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
  markedBy: string;
}

export interface SubjectAssessmentScore {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  classId: string;
  armId?: string;
  sessionId: string;
  termId: string;
  subjectId: string;
  subjectName: string;
  ca1: number; // max 20
  ca2: number; // max 20
  exam: number; // max 60
  total: number; // calculated 100
  grade: string;
  remark: string;
  position?: string;
  teacherRemark?: string;
  isApproved: boolean;
}

export interface StudentReportCard {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  className: string;
  armName: string;
  sessionId: string;
  termId: string;
  avatarUrl: string;
  scores: SubjectAssessmentScore[];
  attendance: {
    totalDays: number;
    daysPresent: number;
    daysAbsent: number;
    daysLate: number;
  };
  totalMarksObtained: number;
  totalMarksPossible: number;
  averageScore: number;
  classPosition: string;
  totalStudentsInClass: number;
  affectiveDomain: { trait: string; rating: number }[]; // 1 to 5 scale
  psychomotorDomain: { skill: string; rating: number }[]; // 1 to 5 scale
  classTeacherRemarks: string;
  principalRemarks: string;
  nextTermBegins: string;
  isPublished: boolean;
  publishedDate?: string;
}

export interface Invoice {
  id: string;
  schoolId: string;
  invoiceNumber: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  className: string;
  armName: string;
  term: string;
  session: string;
  issueDate: string;
  dueDate: string;
  items: { description: string; amount: number }[];
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: 'PAID' | 'PARTIAL' | 'UNPAID';
}

export interface PaymentReceipt {
  id: string;
  schoolId: string;
  receiptNumber: string;
  invoiceId: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  className: string;
  amountPaid: number;
  balanceRemaining: number;
  paymentDate: string;
  paymentMethod: 'Bank Transfer' | 'POS' | 'Cash' | 'Card Online' | 'Cheque';
  reference: string;
  recordedBy: string;
  payerName: string;
  payerPhone: string;
  notes?: string;
}

export interface ExpenseRecord {
  id: string;
  schoolId: string;
  expenseNumber: string;
  category: 'Salaries & Wages' | 'Diesel & Generator' | 'Facility Maintenance' | 'Instructional & Lab Supplies' | 'Sports & Events' | 'Government Levies & Tax';
  description: string;
  amount: number;
  date: string;
  recordedBy: string;
  approvedBy: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
}

export interface TimetableEntry {
  id: string;
  schoolId: string;
  classId: string;
  className: string;
  armId: string;
  armName: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  period: number; // 1 to 8
  time: string; // e.g. "08:00 - 08:45"
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  room: string;
}

export interface Assignment {
  id: string;
  schoolId: string;
  title: string;
  description: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  teacherName: string;
  dueDate: string;
  createdAt: string;
  totalSubmissions: number;
  resources?: string[];
}

export interface Announcement {
  id: string;
  schoolId: string;
  title: string;
  content: string;
  category: 'General' | 'Academic' | 'PTA' | 'Urgent' | 'Sports';
  targetAudience: 'ALL' | 'PARENTS' | 'STAFF' | 'STUDENTS' | 'CLASS';
  targetClassId?: string;
  createdAt: string;
  authorName: string;
  channels: ('IN_APP' | 'SMS' | 'EMAIL')[];
  smsStatus?: 'SENT' | 'PENDING' | 'CONFIGURED_SIMULATION';
}

export interface AuditLog {
  id: string;
  schoolId: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  details: string;
}
