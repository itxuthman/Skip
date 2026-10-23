/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StudentPortalView } from '../components/portals/StudentPortalView.tsx';

export const StudentDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center justify-between text-xs">
        <span className="font-semibold uppercase tracking-wider text-blue-400">
          Student Portal
        </span>
        <span className="text-slate-400">Personalized Academic Hub</span>
      </div>
      <StudentPortalView />
    </div>
  );
};
