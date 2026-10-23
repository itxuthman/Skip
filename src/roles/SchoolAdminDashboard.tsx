/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DashboardView } from '../components/dashboard/DashboardView.tsx';

export const SchoolAdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-900 text-white px-4 py-2 rounded-xl flex items-center justify-between text-xs">
        <span className="font-semibold uppercase tracking-wider text-blue-200">
          School Administrator Operational Workspace
        </span>
        <span className="text-slate-300">Complete School Oversight & Configuration</span>
      </div>
      <DashboardView />
    </div>
  );
};
