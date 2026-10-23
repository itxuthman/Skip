/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FinanceView } from '../components/finance/FinanceView.tsx';

export const AccountantDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center justify-between text-xs">
        <span className="font-semibold uppercase tracking-wider text-emerald-400">
          Bursar & Accountant Financial Desk
        </span>
        <span className="text-slate-400">School Fee Invoicing, Receipts, & Expenses</span>
      </div>
      <FinanceView />
    </div>
  );
};
