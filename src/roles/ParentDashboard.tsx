/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ParentPortalView } from '../components/portals/ParentPortalView.tsx';

export const ParentDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-indigo-950 text-white px-4 py-2 rounded-xl flex items-center justify-between text-xs">
        <span className="font-semibold uppercase tracking-wider text-indigo-300">
          Parent & Guardian Dashboard
        </span>
        <span className="text-slate-400">Child Academic & Fee Monitoring</span>
      </div>
      <ParentPortalView />
    </div>
  );
};
