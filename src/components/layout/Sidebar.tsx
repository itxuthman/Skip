/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  FileSpreadsheet,
  Wallet,
  Calendar,
  ClipboardList,
  Megaphone,
  FileText,
  Globe2,
  ShieldCheck,
  UserCheck,
  X,
  CreditCard,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, currentRole, currentSchool } = useApp();

  // Define navigation sections
  const getNavItems = () => {
    if (currentRole === 'SUPER_ADMIN') {
      return [
        { id: 'saas', label: 'Multi-School SaaS', icon: Globe2 },
        { id: 'dashboard', label: 'Platform Analytics', icon: LayoutDashboard },
        { id: 'reports', label: 'System Reports', icon: FileText },
      ];
    }

    if (currentRole === 'PARENT') {
      return [
        { id: 'parent-portal', label: 'My Children', icon: Users },
        { id: 'results', label: 'Terminal Report Cards', icon: FileSpreadsheet },
        { id: 'finance', label: 'Fee Payments & Receipts', icon: CreditCard },
        { id: 'attendance', label: 'Attendance Records', icon: CalendarCheck },
        { id: 'communications', label: 'School Circulars', icon: Megaphone },
      ];
    }

    if (currentRole === 'STUDENT') {
      return [
        { id: 'student-portal', label: 'Student Dashboard', icon: LayoutDashboard },
        { id: 'results', label: 'My Terminal Results', icon: FileSpreadsheet },
        { id: 'timetables', label: 'Class Timetable', icon: Calendar },
        { id: 'assignments', label: 'Homework & Tasks', icon: ClipboardList },
        { id: 'communications', label: 'Announcements', icon: Megaphone },
      ];
    }

    if (currentRole === 'ACCOUNTANT') {
      return [
        { id: 'dashboard', label: 'Financial Overview', icon: LayoutDashboard },
        { id: 'finance', label: 'Fees & Invoices', icon: Wallet },
        { id: 'reports', label: 'Financial Reports', icon: FileText },
        { id: 'communications', label: 'Announcements', icon: Megaphone },
      ];
    }

    if (currentRole === 'TEACHER') {
      return [
        { id: 'dashboard', label: 'Teacher Dashboard', icon: LayoutDashboard },
        { id: 'attendance', label: 'Daily Attendance', icon: CalendarCheck },
        { id: 'results', label: 'Enter Scores & Results', icon: FileSpreadsheet },
        { id: 'timetables', label: 'My Class Timetable', icon: Calendar },
        { id: 'assignments', label: 'Assignments', icon: ClipboardList },
        { id: 'students', label: 'Class Students', icon: Users },
        { id: 'communications', label: 'Notices', icon: Megaphone },
      ];
    }

    // Default for School Admin, Principal, Registrar
    return [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'students', label: 'Students', icon: Users },
      { id: 'staff', label: 'Teachers & Staff', icon: GraduationCap },
      { id: 'academics', label: 'Classes & Subjects', icon: BookOpen },
      { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
      { id: 'results', label: 'Examinations & Results', icon: FileSpreadsheet },
      { id: 'finance', label: 'Fees & Accounting', icon: Wallet },
      { id: 'timetables', label: 'Timetable & Events', icon: Calendar },
      { id: 'assignments', label: 'Assignments', icon: ClipboardList },
      { id: 'communications', label: 'Communications', icon: Megaphone },
      { id: 'reports', label: 'Official Reports', icon: FileText },
    ];
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header in drawer */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 lg:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">EduNaija Navigation</span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* School Info Header Card */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-2.5">
              <img
                src={currentSchool?.logo || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=80&auto=format&fit=crop&q=80'}
                alt={currentSchool?.name}
                className="h-9 w-9 rounded-lg object-cover ring-1 ring-slate-300 dark:ring-slate-700"
              />
              <div className="truncate">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {currentSchool?.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {currentSchool?.motto || 'Motto'}
                </p>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>{currentSchool?.code}</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                {currentSchool?.subscriptionPlan} Tier
              </span>
            </div>
          </div>
        </div>

        {/* Navigation items list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {currentRole === 'SUPER_ADMIN' ? 'Platform Administration' : 'School Workspace'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  onCloseMobile();
                }}
                className={`flex w-full items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-700 text-white shadow-xs dark:bg-blue-600'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Current Role Indicator & Quick Reassurance */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="truncate">
              <span className="font-medium text-slate-900 dark:text-white">Role: </span>
              <span>{currentRole.replace('_', ' ')}</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
            Data isolated for {currentSchool?.code}
          </p>
        </div>
      </aside>
    </>
  );
};
