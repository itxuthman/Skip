/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SuperAdminView } from '../components/saas/SuperAdminView.tsx';

export const SuperAdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center justify-between text-xs">
        <span className="font-semibold uppercase tracking-wider text-blue-400">
          Super Admin Management Console
        </span>
        <span className="text-slate-400">Multi-Institution SaaS Authority</span>
      </div>
      <SuperAdminView />
    </div>
  );
};
