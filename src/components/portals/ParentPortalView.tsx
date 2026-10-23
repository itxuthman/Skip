/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  CreditCard,
  FileSpreadsheet,
  Megaphone,
  Download,
  Printer,
  ChevronRight,
  Sparkles,
  Heart,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { Student, Invoice, StudentReportCard, AttendanceRecord } from '../../types/index.ts';
import { fetchApi } from '../../utils/api.ts';
import { Naira } from '../common/Naira.tsx';

export const ParentPortalView: React.FC = () => {
  const { currentSchool, currentUser, showToast, setActiveTab } = useApp();
  const [children, setChildren] = useState<Student[]>([]);
  const [selectedChild, setSelectedChild] = useState<Student | null>(null);
  const [childInvoices, setChildInvoices] = useState<Invoice[]>([]);
  const [childReportCard, setChildReportCard] = useState<StudentReportCard | null>(null);
  const [childAttendance, setChildAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFamilyData() {
      try {
        setLoading(true);
        // Load students linked to parent (e.g. stu-001 Tobi Adebayo and stu-004 Damilola Adebayo)
        const allStudents = await fetchApi<Student[]>(`/api/students?schoolId=${currentSchool?.id || 'sch-001'}`);
        const linkedIds = currentUser?.linkedStudentIds || ['stu-001', 'stu-004'];
        const myChildren = allStudents.filter((s) => linkedIds.includes(s.id));
        setChildren(myChildren);
        if (myChildren.length > 0) {
          setSelectedChild(myChildren[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadFamilyData();
  }, [currentSchool?.id, currentUser]);

  useEffect(() => {
    if (!selectedChild) return;

    async function loadChildDetails() {
      try {
        const [invoicesData, reportCardData, attendanceData] = await Promise.all([
          fetchApi<Invoice[]>(`/api/finance/invoices?schoolId=${currentSchool?.id || 'sch-001'}&studentId=${selectedChild?.id}`),
          fetchApi<StudentReportCard>(`/api/results/report-card/${selectedChild?.id}?termId=Second Term`),
          fetchApi<AttendanceRecord[]>(`/api/attendance?schoolId=${currentSchool?.id || 'sch-001'}`),
        ]);

        setChildInvoices(invoicesData);
        setChildReportCard(reportCardData);
        setChildAttendance(attendanceData.filter((a) => a.studentId === selectedChild?.id));
      } catch (e) {
        console.error(e);
      }
    }
    loadChildDetails();
  }, [selectedChild?.id]);

  const totalFeesDue = childInvoices.reduce((sum, inv) => sum + inv.balance, 0);

  return (
    <div className="space-y-6">
      {/* Top Welcome Card */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold uppercase tracking-wider">
              <span>Parent / Guardian Portal</span>
              <span>·</span>
              <span>{currentSchool?.name}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight mt-1">
              Welcome, {currentUser?.name || 'Guardian'}
            </h1>
            <p className="text-slate-300 text-xs md:text-sm mt-1">
              Monitor your children's academic progress, attendance punctuality, terminal report cards, and fee receipts.
            </p>
          </div>

          {/* Child Switcher Selector */}
          <div className="flex items-center gap-2 bg-white/10 p-2 rounded-xl backdrop-blur-xs">
            <span className="text-xs text-blue-200">Viewing Child:</span>
            <div className="flex gap-1.5">
              {children.map((child) => (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => setSelectedChild(child)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedChild?.id === child.id
                      ? 'bg-white text-blue-900 shadow-xs'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {child.firstName} ({child.className})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Child Summary Strip */}
      {selectedChild && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Child Bio */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 md:col-span-2">
            <div className="flex items-center gap-4">
              <img
                src={selectedChild.avatarUrl}
                alt={selectedChild.firstName}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-blue-700/20"
              />
              <div className="truncate">
                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {selectedChild.firstName} {selectedChild.middleName} {selectedChild.lastName}
                </h3>
                <p className="text-xs font-mono font-medium text-blue-700 dark:text-blue-400">
                  {selectedChild.admissionNumber}
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  <span>Class: <strong>{selectedChild.className}</strong> ({selectedChild.armName})</span>
                  <span>·</span>
                  <span>Admitted: {selectedChild.admissionDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance KPI */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-[11px] font-medium text-slate-500 block">Attendance Rate</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">96%</span>
              <span className="text-xs text-emerald-600 font-semibold">Punctual</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">58 days present · 1 late arrival</p>
          </div>

          {/* Fee Balance KPI */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-[11px] font-medium text-slate-500 block">Outstanding School Fees</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
                <Naira className="mr-0.5" />
                {totalFeesDue.toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {totalFeesDue === 0 ? 'All fees settled for current term' : 'Balance due before exam clearance'}
            </p>
          </div>
        </div>
      )}

      {/* Two Column Layout: Latest Terminal Result & Fee Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Child Terminal Academic Results */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Latest Terminal Academic Report Card
              </h3>
              <p className="text-xs text-slate-500">
                Second Term 2025/2026 · Class Position: <strong>{childReportCard?.classPosition || '1st'}</strong>
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('results')}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Full Report Sheet</span>
            </button>
          </div>

          {childReportCard && (
            <div className="mt-4 space-y-3">
              <div className="p-3 bg-blue-50/60 dark:bg-slate-800 rounded-xl flex items-center justify-between text-xs">
                <span>Term Average Score:</span>
                <span className="font-bold text-sm text-blue-900 dark:text-blue-300">
                  {childReportCard.averageScore}%
                </span>
              </div>

              {/* Subject Scores Sample Table */}
              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="py-2.5 px-3">Subject</th>
                      <th className="py-2.5 px-2 text-center">Score</th>
                      <th className="py-2.5 px-2 text-center">Grade</th>
                      <th className="py-2.5 px-3">Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {childReportCard.scores.slice(0, 5).map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">
                          {s.subjectName}
                        </td>
                        <td className="py-2 px-2 text-center font-mono font-bold">{s.total}</td>
                        <td className="py-2 px-2 text-center font-bold text-blue-700 dark:text-blue-400">
                          {s.grade}
                        </td>
                        <td className="py-2 px-3 text-slate-500 text-[11px]">{s.remark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Principal Remark Preview */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Principal's Remark:</span>
                <p className="italic text-slate-700 dark:text-slate-300 mt-0.5">
                  "{childReportCard.principalRemarks}"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Child Fee Invoices & Receipts */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Fee Statements & Invoices</h3>
              <p className="text-xs text-slate-500">Official termly billings and bank payment confirmation</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('finance')}
              className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              All Invoices
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {childInvoices.map((inv) => (
              <div
                key={inv.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-2"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-mono font-bold text-blue-700 dark:text-blue-400">
                      {inv.invoiceNumber}
                    </span>
                    <p className="text-[11px] text-slate-500">{inv.term} {inv.session}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inv.status === 'PAID'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    {inv.status}
                  </span>
                </div>

                <div className="space-y-1 py-1 border-y border-slate-200/60 dark:border-slate-700/60">
                  {inv.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[11px] text-slate-600 dark:text-slate-300">
                      <span>{item.description}</span>
                      <span className="font-mono flex items-center">
                        <Naira size="0.75em" />
                        {item.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 flex items-center">
                      Total Billed: <Naira size="0.7em" className="mx-0.5" />
                      {inv.totalAmount.toLocaleString()}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white flex items-center">
                      Balance Due: <Naira size="0.8em" className="mx-0.5" />
                      {inv.balance.toLocaleString()}
                    </span>
                  </div>

                  {inv.balance > 0 ? (
                    <button
                      type="button"
                      onClick={() => setActiveTab('finance')}
                      className="px-3 py-1.5 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-xs"
                    >
                      Pay Now
                    </button>
                  ) : (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>Receipt Cleared</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
