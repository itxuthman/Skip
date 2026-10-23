/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { School, User, UserRole } from '../types/index.ts';
import { fetchApi } from '../utils/api.ts';

interface AppContextType {
  currentSchool: School | null;
  currentUser: User | null;
  currentRole: UserRole;
  activeTab: string;
  darkMode: boolean;
  schools: School[];
  users: User[];
  isLoading: boolean;
  isCleanMode: boolean;
  notificationCount: number;
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  setCurrentSchool: (school: School) => void;
  setCurrentRole: (role: UserRole) => void;
  setCurrentUser: (user: User) => void;
  setActiveTab: (tab: string) => void;
  setDarkMode: (dark: boolean) => void;
  toggleDarkMode: () => void;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  refreshSchools: () => Promise<void>;
  switchPersona: (role: UserRole) => void;
  clearAllDemoData: () => Promise<void>;
  seedDemoData: () => Promise<void>;
  refreshSystemStatus: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('SCHOOL_ADMIN');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [darkMode, setDarkModeState] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('edunaija_theme');
      if (stored) return stored === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCleanMode, setIsCleanMode] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Synchronize darkMode with documentElement and localStorage
  const setDarkMode = (dark: boolean) => {
    setDarkModeState(dark);
    try {
      localStorage.setItem('edunaija_theme', dark ? 'dark' : 'light');
      if (dark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.warn('LocalStorage unavailable for theme', e);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    // Apply on initial mount
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  const refreshSystemStatus = async () => {
    try {
      const res = await fetchApi<{ isCleanMode: boolean; studentsCount: number }>(
        `/api/system/status?schoolId=${currentSchool?.id || 'sch-001'}`
      );
      setIsCleanMode(res.isCleanMode);
    } catch {
      // Fallback
    }
  };

  const clearAllDemoData = async () => {
    try {
      await fetchApi('/api/system/clear-demo', { method: 'POST' });
      setIsCleanMode(true);
      showToast('All demo records removed. System is in clean production mode.', 'success');
      // Trigger reload of active tab data
      window.dispatchEvent(new CustomEvent('edunaija_data_reset'));
    } catch (e) {
      showToast('Failed to clear demo data', 'error');
    }
  };

  const seedDemoData = async () => {
    try {
      await fetchApi('/api/system/seed-demo', { method: 'POST' });
      setIsCleanMode(false);
      showToast('Sample demo records loaded for demonstration.', 'info');
      // Trigger reload of active tab data
      window.dispatchEvent(new CustomEvent('edunaija_data_reset'));
    } catch (e) {
      showToast('Failed to seed demo data', 'error');
    }
  };

  const refreshSchools = async () => {
    try {
      const data = await fetchApi<School[]>('/api/schools');
      setSchools(data);
      if (!currentSchool && data.length > 0) {
        setCurrentSchool(data[0]);
      }
    } catch (e) {
      console.error('Failed to fetch schools', e);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        setIsLoading(true);
        const [schoolsData, usersData, statusData] = await Promise.all([
          fetchApi<School[]>('/api/schools'),
          fetchApi<User[]>('/api/auth/users'),
          fetchApi<{ isCleanMode: boolean }>('/api/system/status').catch(() => ({ isCleanMode: true })),
        ]);
        setSchools(schoolsData);
        if (schoolsData.length > 0) {
          setCurrentSchool(schoolsData[0]);
        }
        setUsers(usersData);
        setIsCleanMode(statusData.isCleanMode);

        // Default to School Admin user
        const adminUser = usersData.find((u) => u.role === 'SCHOOL_ADMIN') || usersData[0];
        setCurrentUser(adminUser);
        setCurrentRole(adminUser.role);
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  const switchPersona = (role: UserRole) => {
    const matchingUser = users.find((u) => u.role === role);
    if (matchingUser) {
      setCurrentUser(matchingUser);
      setCurrentRole(role);
      if (role === 'SUPER_ADMIN') {
        setActiveTab('saas');
      } else if (role === 'PARENT') {
        setActiveTab('parent-portal');
      } else if (role === 'STUDENT') {
        setActiveTab('student-portal');
      } else if (role === 'ACCOUNTANT') {
        setActiveTab('finance');
      } else if (role === 'TEACHER') {
        setActiveTab('attendance');
      } else {
        setActiveTab('dashboard');
      }
      showToast(`Switched active view to: ${role.replace('_', ' ')} (${matchingUser.name})`);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentSchool,
        currentUser,
        currentRole,
        activeTab,
        darkMode,
        schools,
        users,
        isLoading,
        isCleanMode,
        notificationCount: 3,
        toastMessage,
        setCurrentSchool,
        setCurrentRole,
        setCurrentUser,
        setActiveTab,
        setDarkMode,
        toggleDarkMode,
        showToast,
        refreshSchools,
        switchPersona,
        clearAllDemoData,
        seedDemoData,
        refreshSystemStatus,
      }}
    >
      <div className={darkMode ? 'dark' : ''}>{children}</div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
