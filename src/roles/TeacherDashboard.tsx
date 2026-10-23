/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CalendarCheck,
  FileSpreadsheet,
  ClipboardList,
  Calendar,
  Users,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { AttendanceView } from '../components/attendance/AttendanceView.tsx';
import { ResultsView } from '../components/results/ResultsView.tsx';
import { TimetableView } from '../components/timetables/TimetableView.tsx';
import { AssignmentsView } from '../components/assignments/AssignmentsView.tsx';

export const TeacherDashboard: React.FC = () => {
  const { currentSchool, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'attendance' | 'results' | 'timetable' | 'assignments'>('attendance');

  return (
    <div className="space-y-6">
      {/* Teacher Workspace Header */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900 to-slate-900 text-white p-6 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold uppercase tracking-wider">
              <span>Teacher Academic Console</span>
              <span>·</span>
              <span>{currentSchool?.name}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight mt-1">
              Welcome, {currentUser?.name || 'Class Master'}
            </h1>
            <p className="text-slate-300 text-xs mt-1">
              Assigned Subjects: <strong>General Mathematics</strong> & <strong>Further Mathematics</strong> · Classes: <strong>SSS 2 (Science)</strong> & <strong>JSS 1</strong>.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-white/10 p-1.5 rounded-xl backdrop-blur-xs text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('attendance')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'attendance' ? 'bg-white text-slate-900 font-bold' : 'text-white'
              }`}
            >
              Roll Call
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('results')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'results' ? 'bg-white text-slate-900 font-bold' : 'text-white'
              }`}
            >
              Enter Scores
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('assignments')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'assignments' ? 'bg-white text-slate-900 font-bold' : 'text-white'
              }`}
            >
              Assignments
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('timetable')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'timetable' ? 'bg-white text-slate-900 font-bold' : 'text-white'
              }`}
            >
              Timetable
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'attendance' && <AttendanceView />}
      {activeTab === 'results' && <ResultsView />}
      {activeTab === 'assignments' && <AssignmentsView />}
      {activeTab === 'timetable' && <TimetableView />}
    </div>
  );
};
