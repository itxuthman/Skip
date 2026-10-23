/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  GraduationCap,
  Award,
  CheckCircle2,
  FileCheck,
  Megaphone,
  CalendarCheck,
  Users,
  Eye,
  Printer,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { ResultsView } from '../components/results/ResultsView.tsx';
import { CommunicationsView } from '../components/communications/CommunicationsView.tsx';

export const PrincipalDashboard: React.FC = () => {
  const { currentSchool, currentUser, setActiveTab } = useApp();
  const [activeSubView, setActiveSubView] = useState<'overview' | 'results' | 'circulars'>('overview');

  return (
    <div className="space-y-6">
      {/* Principal Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-6 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold uppercase tracking-wider">
              <GraduationCap className="h-4 w-4" />
              <span>Head of School & Principal Console</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight mt-1">
              {currentUser?.name || currentSchool?.principalName}
            </h1>
            <p className="text-slate-300 text-xs mt-1">
              Academic supervision, report sheet approvals, faculty oversight, and parent communications for {currentSchool?.name}.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-xl backdrop-blur-xs text-xs">
            <button
              type="button"
              onClick={() => setActiveSubView('overview')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeSubView === 'overview' ? 'bg-white text-slate-900 font-bold' : 'text-white'
              }`}
            >
              Supervisory Audit
            </button>
            <button
              type="button"
              onClick={() => setActiveSubView('results')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeSubView === 'results' ? 'bg-white text-slate-900 font-bold' : 'text-white'
              }`}
            >
              Approve Results
            </button>
            <button
              type="button"
              onClick={() => setActiveSubView('circulars')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeSubView === 'circulars' ? 'bg-white text-slate-900 font-bold' : 'text-white'
              }`}
            >
              School Circulars
            </button>
          </div>
        </div>
      </div>

      {activeSubView === 'overview' && (
        <div className="space-y-6">
          {/* Supervisory Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <span className="text-[11px] font-medium text-slate-500">Academic Standing</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">84.2%</p>
              <span className="text-[10px] text-emerald-600 font-semibold">School Term Average</span>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <span className="text-[11px] font-medium text-slate-500">Continuous Assessments</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">100%</p>
              <span className="text-[10px] text-blue-600 font-semibold">1st & 2nd CA Submitted</span>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <span className="text-[11px] font-medium text-slate-500">Student Attendance</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">96.8%</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Punctual presence</span>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <span className="text-[11px] font-medium text-slate-500">Exam Clearance</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">130 / 130</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Candidates Cleared</span>
            </div>
          </div>

          {/* Academic Broad Inspection Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Faculty Continuous Assessment Status
                </h3>
                <span className="text-xs text-emerald-600 font-semibold">All Departments In Order</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Senior Science Department</p>
                    <p className="text-[11px] text-slate-400">Physics, Chemistry, Biology & Further Math</p>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                    APPROVED
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Languages & Humanities</p>
                    <p className="text-[11px] text-slate-400">English Language, Literature & Government</p>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                    APPROVED
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Junior Secondary Academic Arm</p>
                    <p className="text-[11px] text-slate-400">Basic Science & Tech, Agric, Civic & ICT</p>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                    APPROVED
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Principal Quick Actions</h3>
                <span className="text-xs text-blue-600 font-mono">Session 2025/2026</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveSubView('results')}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-left transition-colors"
                >
                  <FileCheck className="h-4 w-4 text-blue-600 mb-1" />
                  <p className="font-bold text-slate-900 dark:text-white">Sign Terminal Report Cards</p>
                  <p className="text-[10px] text-slate-500">Review teacher remarks & stamps</p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubView('circulars')}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-left transition-colors"
                >
                  <Megaphone className="h-4 w-4 text-emerald-600 mb-1" />
                  <p className="font-bold text-slate-900 dark:text-white">Send Principal's Circular</p>
                  <p className="text-[10px] text-slate-500">Broadcast to parents via SMS</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubView === 'results' && <ResultsView />}
      {activeSubView === 'circulars' && <CommunicationsView />}
    </div>
  );
};
