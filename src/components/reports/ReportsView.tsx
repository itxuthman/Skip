/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  Users,
  GraduationCap,
  CreditCard,
  FileSpreadsheet,
  CheckCircle,
  Eye,
  Award,
  IdCard,
  Scroll,
  Layers,
  Sparkles,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { Student, AcademicClass, PaymentReceipt, StudentReportCard, Staff } from '../../types/index.ts';
import { fetchApi } from '../../utils/api.ts';
import { exportElementAsPdf } from '../../utils/pdfExport.ts';

import { AdmissionLetterPrint } from './AdmissionLetterPrint.tsx';
import { TerminalReportCardPrint } from './TerminalReportCardPrint.tsx';
import { BursaryReceiptPrint } from './BursaryReceiptPrint.tsx';
import { IdCardsPrint } from './IdCardsPrint.tsx';
import { TestimonialPrint } from './TestimonialPrint.tsx';

type DocumentType = 'admission' | 'report-card' | 'receipt' | 'id-card' | 'testimonial' | 'catalog';

export const ReportsView: React.FC = () => {
  const { currentSchool, showToast, setActiveTab, seedDemoData } = useApp();
  const [activeDocType, setActiveDocType] = useState<DocumentType>('admission');
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);
  const [reportCardData, setReportCardData] = useState<StudentReportCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const schoolId = currentSchool?.id || 'sch-001';
      const [stuData, clsData, recData, stfData] = await Promise.all([
        fetchApi<Student[]>(`/api/students?schoolId=${schoolId}`),
        fetchApi<AcademicClass[]>(`/api/academics/classes?schoolId=${schoolId}`),
        fetchApi<PaymentReceipt[]>(`/api/finance/receipts?schoolId=${schoolId}`),
        fetchApi<Staff[]>(`/api/staff?schoolId=${schoolId}`),
      ]);

      setStudents(stuData);
      setClasses(clsData);
      setReceipts(recData);
      setStaffList(stfData);

      if (stuData.length > 0) {
        setSelectedStudent(stuData[0]);
      } else {
        setSelectedStudent(null);
      }

      if (recData.length > 0) {
        setSelectedReceipt(recData[0]);
      } else {
        setSelectedReceipt(null);
      }
    } catch (e) {
      console.error('Error fetching reports data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleReset = () => loadData();
    window.addEventListener('edunaija_data_reset', handleReset);
    return () => window.removeEventListener('edunaija_data_reset', handleReset);
  }, [currentSchool?.id]);

  useEffect(() => {
    if (!selectedStudent || activeDocType !== 'report-card') return;

    async function fetchStudentReport() {
      try {
        const data = await fetchApi<StudentReportCard>(
          `/api/results/report-card?schoolId=${currentSchool?.id || 'sch-001'}&studentId=${selectedStudent?.id}&termId=${currentSchool?.activeTerm || 'Second Term'}`
        );
        setReportCardData(data);
      } catch (err) {
        console.error('Failed to load report card', err);
      }
    }
    fetchStudentReport();
  }, [selectedStudent, activeDocType, currentSchool?.id]);

  const handleDownloadPdf = async () => {
    setExportingPdf(true);
    showToast('Generating official PDF document...', 'info');
    try {
      const filename = `${currentSchool?.code || 'EduNaija'}_${activeDocType}_${selectedStudent?.admissionNumber?.replace(/\//g, '_') || 'document'}.pdf`;
      await exportElementAsPdf('official-print-document', filename);
      showToast('PDF document downloaded successfully!', 'success');
    } catch (e) {
      showToast('PDF export failed, opening browser print dialog', 'error');
      window.print();
    } finally {
      setExportingPdf(false);
    }
  };

  const handleDownloadCsv = (type: string) => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (type === 'students') {
      headers = ['Admission No', 'Student Name', 'Class', 'Arm', 'Gender', 'State of Origin', 'Guardian Phone', 'Status'];
      rows = students.map((s) => [
        s.admissionNumber,
        `${s.firstName} ${s.lastName}`,
        s.className,
        s.armName,
        s.gender,
        s.stateOfOrigin,
        s.guardian.phone,
        s.status,
      ]);
    } else if (type === 'fees') {
      headers = ['Receipt No', 'Student Name', 'Admission No', 'Class', 'Amount Paid (₦)', 'Balance (₦)', 'Payment Method', 'Date'];
      rows = receipts.map((r) => [
        r.receiptNumber,
        r.studentName,
        r.admissionNumber,
        r.className,
        r.amountPaid.toString(),
        r.balanceRemaining.toString(),
        r.paymentMethod,
        r.paymentDate,
      ]);
    }

    if (rows.length === 0) {
      showToast('No records available to export', 'error');
      return;
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentSchool?.code || 'EduNaija'}_${type}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${type} records to CSV`, 'success');
  };

  const currentSchoolData = currentSchool || {
    id: 'sch-001',
    name: 'Apex International Academy',
    code: 'AIA',
    motto: 'Knowledge, Excellence and Integrity',
    address: 'Plot 12, Admiralty Way, Lekki Phase 1',
    city: 'Lagos',
    state: 'Lagos State',
    phone: '+234 803 123 4567',
    email: 'info@apexacademy.edu.ng',
    activeSession: '2025/2026',
    activeTerm: 'Second Term',
    logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80',
    currentTermBegins: '2026-01-12',
    currentTermEnds: '2026-04-03',
    nextTermBegins: '2026-04-27',
  };

  return (
    <div className="space-y-6">
      {/* Header (Hidden in Print) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Official Documents & PDF Print Center
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
              WAEC / NECO / SUBEB Compliant
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Download authenticated PDF documents or print admission letters, terminal report cards, bursary receipts, and ID cards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeDocType !== 'catalog' && (
            <>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={exportingPdf}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>{exportingPdf ? 'Exporting PDF...' : 'Download as PDF'}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Print Document</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Document Category Tabs (Hidden in Print) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 print:hidden">
        <button
          type="button"
          onClick={() => setActiveDocType('admission')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeDocType === 'admission'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Scroll className="h-3.5 w-3.5" />
          <span>Admission Letter</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDocType('report-card')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeDocType === 'report-card'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="h-3.5 w-3.5" />
          <span>Terminal Report Card</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDocType('receipt')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeDocType === 'receipt'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CreditCard className="h-3.5 w-3.5" />
          <span>Bursary Receipt & Exam Pass</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDocType('id-card')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeDocType === 'id-card'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <IdCard className="h-3.5 w-3.5" />
          <span>PVC Identity Cards</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDocType('testimonial')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeDocType === 'testimonial'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <GraduationCap className="h-3.5 w-3.5" />
          <span>Testimonial & Certificate</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDocType('catalog')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeDocType === 'catalog'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          <span>Data Exports & Registers</span>
        </button>
      </div>

      {/* Target Student / Receipt Selector Bar (Hidden in Print) */}
      {activeDocType !== 'catalog' && (
        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
              Select Candidate:
            </label>
            <select
              value={selectedStudent?.id || ''}
              onChange={(e) => {
                const s = students.find((st) => st.id === e.target.value);
                if (s) setSelectedStudent(s);
              }}
              disabled={students.length === 0}
              className="w-full sm:w-72 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {students.length > 0 ? (
                students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} ({s.admissionNumber}) — {s.className}
                  </option>
                ))
              ) : (
                <option value="">No enrolled students</option>
              )}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Institution: <strong>{currentSchoolData.name}</strong></span>
            <span>·</span>
            <span>Session: <strong>{currentSchoolData.activeSession}</strong></span>
          </div>
        </div>
      )}

      {/* EMPTY STATE IF CLEAN MODE AND NO STUDENTS */}
      {students.length === 0 && activeDocType !== 'catalog' ? (
        <div className="p-10 text-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-4">
          <div className="h-14 w-14 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 mx-auto flex items-center justify-center">
            <Users className="h-7 w-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No Student Enrolled in Clean Mode
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              You are running the school system with a clean slate. Enroll your first student to automatically generate and download PDF Admission Letters, Identity Cards, and Academic Dossiers.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('students')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Enroll New Student</span>
            </button>
            <button
              type="button"
              onClick={seedDemoData}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Load Sample Demo Data</span>
            </button>
          </div>
        </div>
      ) : (
        /* PRINTABLE & PDF EXPORT CONTAINER WITH ID */
        <div id="official-print-document">
          {activeDocType === 'admission' && selectedStudent && (
            <AdmissionLetterPrint school={currentSchoolData as any} student={selectedStudent} />
          )}

          {activeDocType === 'report-card' && (
            reportCardData ? (
              <TerminalReportCardPrint school={currentSchoolData as any} report={reportCardData} />
            ) : selectedStudent ? (
              <TerminalReportCardPrint
                school={currentSchoolData as any}
                report={{
                  id: 'rep-fallback',
                  schoolId: currentSchoolData.id,
                  studentId: selectedStudent.id,
                  studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
                  admissionNumber: selectedStudent.admissionNumber,
                  className: selectedStudent.className,
                  armName: selectedStudent.armName,
                  sessionId: currentSchoolData.activeSession,
                  termId: currentSchoolData.activeTerm,
                  avatarUrl: selectedStudent.avatarUrl,
                  scores: [],
                  attendance: { totalDays: 65, daysPresent: 63, daysAbsent: 2, daysLate: 0 },
                  totalMarksObtained: 0,
                  totalMarksPossible: 1000,
                  averageScore: 0,
                  classPosition: 'Pending',
                  totalStudentsInClass: 40,
                  affectiveDomain: [],
                  psychomotorDomain: [],
                  classTeacherRemarks: 'Diligently preparing for upcoming terminal examinations.',
                  principalRemarks: 'Keep up the focused discipline and hard work.',
                  nextTermBegins: '11th January, 2027',
                  isPublished: true,
                }}
              />
            ) : null
          )}

          {activeDocType === 'receipt' && (
            selectedReceipt ? (
              <BursaryReceiptPrint school={currentSchoolData as any} receipt={selectedReceipt} />
            ) : (
              <div className="p-8 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <CreditCard className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No payment receipt recorded yet.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('finance')}
                  className="mt-3 px-3.5 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg"
                >
                  Go to Bursary & Post Payment
                </button>
              </div>
            )
          )}

          {activeDocType === 'id-card' && selectedStudent && (
            <IdCardsPrint
              school={currentSchoolData as any}
              student={selectedStudent}
              staff={staffList[0] || null}
              cardType="student"
            />
          )}

          {activeDocType === 'testimonial' && selectedStudent && (
            <TestimonialPrint school={currentSchoolData as any} student={selectedStudent} />
          )}

          {/* Export Catalog */}
          {activeDocType === 'catalog' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Student Biodata & Enrollment Register
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Total {students.length} students enrolled
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Official student roll with admission numbers, state of origin, gender, class arms, and emergency contact details for ministry inspection.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-[11px] font-semibold text-emerald-600">CSV Export Ready</span>
                  <button
                    type="button"
                    onClick={() => handleDownloadCsv('students')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Bursary Collections & Arrears Ledger
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Total {receipts.length} payment receipts posted
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Financial audit breakdown detailing payment methods, references, term fees paid, and outstanding balances.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-[11px] font-semibold text-emerald-600">Financial Ledger</span>
                  <button
                    type="button"
                    onClick={() => handleDownloadCsv('fees')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Ledger</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
