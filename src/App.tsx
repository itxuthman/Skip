/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Header } from './components/layout/Header.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { DashboardView } from './components/dashboard/DashboardView.tsx';
import { StudentsView } from './components/students/StudentsView.tsx';
import { StaffView } from './components/staff/StaffView.tsx';
import { AcademicsView } from './components/academics/AcademicsView.tsx';
import { AttendanceView } from './components/attendance/AttendanceView.tsx';
import { ResultsView } from './components/results/ResultsView.tsx';
import { FinanceView } from './components/finance/FinanceView.tsx';
import { TimetableView } from './components/timetables/TimetableView.tsx';
import { AssignmentsView } from './components/assignments/AssignmentsView.tsx';
import { CommunicationsView } from './components/communications/CommunicationsView.tsx';
import { ReportsView } from './components/reports/ReportsView.tsx';
import { SuperAdminView } from './components/saas/SuperAdminView.tsx';
import { ParentPortalView } from './components/portals/ParentPortalView.tsx';
import { StudentPortalView } from './components/portals/StudentPortalView.tsx';

// 8 Separated Role Dashboards
import { SuperAdminDashboard } from './roles/SuperAdminDashboard.tsx';
import { SchoolAdminDashboard } from './roles/SchoolAdminDashboard.tsx';
import { PrincipalDashboard } from './roles/PrincipalDashboard.tsx';
import { TeacherDashboard } from './roles/TeacherDashboard.tsx';
import { StudentDashboard } from './roles/StudentDashboard.tsx';
import { ParentDashboard } from './roles/ParentDashboard.tsx';
import { AccountantDashboard } from './roles/AccountantDashboard.tsx';
import { RegistrarDashboard } from './roles/RegistrarDashboard.tsx';

import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, currentRole, toastMessage } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Render role-specific dashboard when on dashboard tab, or individual module tabs
  const renderActiveView = () => {
    if (activeTab === 'dashboard') {
      switch (currentRole) {
        case 'SUPER_ADMIN':
          return <SuperAdminDashboard />;
        case 'SCHOOL_ADMIN':
          return <SchoolAdminDashboard />;
        case 'PRINCIPAL':
          return <PrincipalDashboard />;
        case 'TEACHER':
          return <TeacherDashboard />;
        case 'STUDENT':
          return <StudentDashboard />;
        case 'PARENT':
          return <ParentDashboard />;
        case 'ACCOUNTANT':
          return <AccountantDashboard />;
        case 'REGISTRAR':
          return <RegistrarDashboard />;
        default:
          return <DashboardView />;
      }
    }

    switch (activeTab) {
      case 'students':
        return <StudentsView />;
      case 'staff':
        return <StaffView />;
      case 'academics':
        return <AcademicsView />;
      case 'attendance':
        return <AttendanceView />;
      case 'results':
        return <ResultsView />;
      case 'finance':
        return <FinanceView />;
      case 'timetables':
        return <TimetableView />;
      case 'assignments':
        return <AssignmentsView />;
      case 'communications':
        return <CommunicationsView />;
      case 'reports':
        return <ReportsView />;
      case 'saas':
        return <SuperAdminView />;
      case 'parent-portal':
        return <ParentDashboard />;
      case 'student-portal':
        return <StudentDashboard />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Header */}
      <Header onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {renderActiveView()}
        </main>
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white shadow-xl text-xs font-medium dark:bg-white dark:text-slate-900 animate-fade-in border border-slate-700 dark:border-slate-300">
          {toastMessage.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />}
          {toastMessage.type === 'error' && <AlertCircle className="h-4 w-4 text-rose-400 dark:text-rose-600" />}
          {toastMessage.type === 'info' && <Info className="h-4 w-4 text-blue-400 dark:text-blue-600" />}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
