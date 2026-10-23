/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  CreditCard,
  AlertCircle,
  TrendingUp,
  UserPlus,
  PlusCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  School as SchoolIcon,
  Calendar,
  DollarSign,
  Activity,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { fetchApi } from '../../utils/api.ts';
import { Naira } from '../common/Naira.tsx';

interface DashboardStats {
  totalStudents: number;
  totalStaff: number;
  totalClasses: number;
  todayAttendanceRate: number;
  attendanceCounts: {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
  };
  outstandingFees: number;
  totalFeesCollected: number;
  totalExpenses: number;
  netFinancialBalance: number;
  populationByClass: { className: string; count: number }[];
  recentAdmissions: any[];
  recentTransactions: any[];
  recentActivities: any[];
  feeChartData: { term: string; collected: number; target: number }[];
  attendanceWeeklyTrend: { day: string; rate: number; present: number; absent: number }[];
}

export const DashboardView: React.FC = () => {
  const { currentSchool, setActiveTab } = useApp();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await fetchApi<DashboardStats>(`/api/dashboard/stats?schoolId=${currentSchool?.id || 'sch-001'}`);
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [currentSchool?.id]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-blue-900 text-white p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold uppercase tracking-wider">
              <span>{currentSchool?.name}</span>
              <span>·</span>
              <span>{currentSchool?.activeSession} ({currentSchool?.activeTerm})</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight mt-1">
              School Operations Center
            </h1>
            <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-2xl">
              Real-time academic records, biometric daily attendance, WAEC/NECO grading, and automated fee collections for Nigerian primary & secondary education.
            </p>
          </div>

          {/* Quick Actions (Master Prompt Requirement) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('students')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-xs"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>New Admission</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('finance')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-xs"
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Record Fee Payment</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('attendance')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-xs"
            >
              <CalendarCheck className="h-3.5 w-3.5" />
              <span>Take Attendance</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('results')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-xs"
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Enter Results</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Statistic Cards (Real data from DB) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Students */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Enrolled Students</span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {stats?.totalStudents || 0}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5">active learners</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500 dark:text-slate-400">
            <span>Primary & Secondary</span>
            <span className="mx-1.5">·</span>
            <button
              type="button"
              onClick={() => setActiveTab('students')}
              className="text-blue-600 hover:underline dark:text-blue-400 font-medium"
            >
              View directory
            </button>
          </div>
        </div>

        {/* Card 2: Attendance Rate */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Today's Attendance Rate</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              <CalendarCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {stats?.todayAttendanceRate || 95}%
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 ml-2 font-medium">Excellent</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span>{stats?.attendanceCounts.present || 0} Present</span>
            <span className="mx-1.5">·</span>
            <span>{stats?.attendanceCounts.late || 0} Late</span>
            <span className="mx-1.5">·</span>
            <span>{stats?.attendanceCounts.absent || 0} Absent</span>
          </div>
        </div>

        {/* Card 3: School Fees Collected */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Fees Collected</span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
              <Naira className="mr-1" />
              {(stats?.totalFeesCollected || 0).toLocaleString()}
            </span>
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500 dark:text-slate-400">
            <span>Bank transfers & POS</span>
            <span className="mx-1.5">·</span>
            <button
              type="button"
              onClick={() => setActiveTab('finance')}
              className="text-blue-600 hover:underline dark:text-blue-400 font-medium"
            >
              Receipts
            </button>
          </div>
        </div>

        {/* Card 4: Outstanding Arrears */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Outstanding Fee Arrears</span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
              <Naira className="mr-1" />
              {(stats?.outstandingFees || 0).toLocaleString()}
            </span>
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500 dark:text-slate-400">
            <span>Second Term balance</span>
            <span className="mx-1.5">·</span>
            <button
              type="button"
              onClick={() => setActiveTab('finance')}
              className="text-blue-600 hover:underline dark:text-blue-400 font-medium"
            >
              Send reminders
            </button>
          </div>
        </div>
      </div>

      {/* Charts Row: Attendance Weekly Overview & Fee Collections Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend Chart */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Weekly Attendance Performance</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Daily presence rate across all arms this week</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('attendance')}
              className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              Open Register
            </button>
          </div>

          <div className="mt-4 flex items-end justify-between h-44 pt-6 px-2">
            {stats?.attendanceWeeklyTrend.map((item) => (
              <div key={item.day} className="flex flex-col items-center gap-2 w-12">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">{item.rate}%</span>
                <div className="w-8 bg-slate-100 dark:bg-slate-800 rounded-t-md h-32 flex items-end">
                  <div
                    style={{ height: `${item.rate}%` }}
                    className="w-full bg-blue-700 dark:bg-blue-600 rounded-t-md transition-all duration-500"
                  />
                </div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fee Collection Progress Chart */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Termly Fee Collections vs Target</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Revenue realization across academic terms (in Millions)</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('finance')}
              className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              Finance Ledger
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {stats?.feeChartData.map((f) => {
              const pct = Math.min(100, Math.round((f.collected / f.target) * 100));
              return (
                <div key={f.term} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{f.term}</span>
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-0.5">
                      <Naira size="0.75em" />
                      {(f.collected / 1000000).toFixed(1)}M / <Naira size="0.75em" />
                      {(f.target / 1000000).toFixed(1)}M ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-full transition-all ${
                        pct >= 90 ? 'bg-emerald-600' : 'bg-blue-600'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two Column Grid: Population by Class + Recent Admissions + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Distribution */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Class Population</h3>
            <button
              type="button"
              onClick={() => setActiveTab('academics')}
              className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              All Classes
            </button>
          </div>
          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            {stats?.populationByClass.map((c) => (
              <div key={c.className} className="py-2.5 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-800 dark:text-slate-200">{c.className}</span>
                <span className="font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  {c.count} students
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Admissions */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Enrolments</h3>
            <button
              type="button"
              onClick={() => setActiveTab('students')}
              className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              Admissions
            </button>
          </div>
          <div className="mt-3 space-y-3">
            {stats?.recentAdmissions.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <img
                  src={s.avatarUrl}
                  alt={s.firstName}
                  className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                />
                <div className="truncate flex-1">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {s.firstName} {s.lastName}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {s.admissionNumber} · {s.className} ({s.armName})
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bursary Transactions */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Fee Receipts</h3>
            <button
              type="button"
              onClick={() => setActiveTab('finance')}
              className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              All Receipts
            </button>
          </div>
          <div className="mt-3 space-y-3">
            {stats?.recentTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <div className="truncate">
                  <p className="font-semibold text-slate-900 dark:text-white truncate">{t.studentName}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t.receiptNumber} · {t.paymentMethod}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-end">
                    +<Naira className="mr-0.5" />
                    {t.amountPaid.toLocaleString()}
                  </span>
                  <p className="text-[10px] text-slate-400">{t.paymentDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Audit Activities Bar */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent School Audit Activities</h3>
          </div>
          <span className="text-[11px] text-slate-500">Live school operation log</span>
        </div>
        <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
          {stats?.recentActivities.map((act) => (
            <div key={act.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 dark:text-white">{act.actorName}</span>
                <span className="text-slate-400">({act.actorRole})</span>
                <span className="text-slate-600 dark:text-slate-300">· {act.details}</span>
              </div>
              <span className="text-[11px] text-slate-400 shrink-0">{act.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
