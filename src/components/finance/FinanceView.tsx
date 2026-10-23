/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  CreditCard,
  FileText,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Plus,
  Printer,
  Download,
  CheckCircle,
  X,
  AlertCircle,
  Search,
  Filter,
  Check,
  Receipt,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { Invoice, PaymentReceipt, ExpenseRecord, Student } from '../../types/index.ts';
import { fetchApi } from '../../utils/api.ts';
import { Naira } from '../common/Naira.tsx';

export const FinanceView: React.FC = () => {
  const { currentSchool, currentUser, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'invoices' | 'receipts' | 'expenses' | 'statement'>('invoices');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isReceiptPrintModalOpen, setIsReceiptPrintModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);

  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Bank Transfer' | 'POS' | 'Cash' | 'Card Online'>('Bank Transfer');
  const [paymentRef, setPaymentRef] = useState('');
  const [payerName, setPayerName] = useState('');
  const [payerPhone, setPayerPhone] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Expense Form State
  const [expenseCategory, setExpenseCategory] = useState<any>('Diesel & Generator');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState<number>(0);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invData, recData, expData, stuData] = await Promise.all([
        fetchApi<Invoice[]>(`/api/finance/invoices?schoolId=${currentSchool?.id || 'sch-001'}`),
        fetchApi<PaymentReceipt[]>(`/api/finance/receipts?schoolId=${currentSchool?.id || 'sch-001'}`),
        fetchApi<ExpenseRecord[]>(`/api/finance/expenses?schoolId=${currentSchool?.id || 'sch-001'}`),
        fetchApi<Student[]>(`/api/students?schoolId=${currentSchool?.id || 'sch-001'}`),
      ]);
      setInvoices(invData);
      setReceipts(recData);
      setExpenses(expData);
      setStudents(stuData);
    } catch (e) {
      console.error(e);
      showToast('Failed to load financial records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentSchool?.id]);

  const handleOpenPayment = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setPaymentAmount(inv.balance);
    setPaymentRef(`TRF-GTB-${Date.now().toString().slice(-6)}`);
    setPayerName(inv.studentName);
    setPayerPhone('+234 803 000 0000');
    setPaymentNotes(`Payment for ${inv.term} fees`);
    setIsPaymentModalOpen(true);
  };

  const handlePostPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    if (paymentAmount <= 0) {
      showToast('Payment amount must be greater than zero', 'error');
      return;
    }

    if (paymentAmount > selectedInvoice.balance) {
      showToast(`Amount cannot exceed invoice balance of ₦${selectedInvoice.balance.toLocaleString()}`, 'error');
      return;
    }

    try {
      const res = await fetchApi<{ receipt: PaymentReceipt; invoice: Invoice }>('/api/finance/payments', {
        method: 'POST',
        body: JSON.stringify({
          schoolId: currentSchool?.id || 'sch-001',
          invoiceId: selectedInvoice.id,
          amountPaid: paymentAmount,
          paymentMethod,
          reference: paymentRef,
          payerName,
          payerPhone,
          notes: paymentNotes,
          recordedBy: currentUser?.name || 'Bursar',
        }),
      });

      showToast(`Payment of ₦${paymentAmount.toLocaleString()} recorded! Receipt: ${res.receipt.receiptNumber}`, 'success');
      setIsPaymentModalOpen(false);
      setSelectedReceipt(res.receipt);
      setIsReceiptPrintModalOpen(true);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Payment recording failed', 'error');
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseDescription || expenseAmount <= 0) {
      showToast('Please enter valid expense description and amount', 'error');
      return;
    }

    try {
      await fetchApi('/api/finance/expenses', {
        method: 'POST',
        body: JSON.stringify({
          schoolId: currentSchool?.id || 'sch-001',
          category: expenseCategory,
          description: expenseDescription,
          amount: expenseAmount,
          recordedBy: currentUser?.name || 'Bursar',
          approvedBy: currentSchool?.principalName || 'Principal',
        }),
      });

      showToast('Expense voucher approved and posted', 'success');
      setIsExpenseModalOpen(false);
      setExpenseDescription('');
      setExpenseAmount(0);
      loadData();
    } catch (e: any) {
      showToast(e.message || 'Failed to record expense', 'error');
    }
  };

  // Aggregates
  const totalBilled = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalCollected = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const totalArrears = invoices.reduce((sum, i) => sum + i.balance, 0);
  const totalExpenditure = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netBalance = totalCollected - totalExpenditure;

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Bursary & Financial Management</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Student fee invoices, partial/full payment receipts, operational expenses, and Nigerian Naira (₦) accounts.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('invoices')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'invoices'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Invoices & Arrears
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('receipts')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'receipts'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Payment Receipts ({receipts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('expenses')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'expenses'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            School Expenses
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('statement')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'statement'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Cashflow Statement
          </button>
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Total Billed (Term Fees)</span>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1 flex items-center">
            <Naira className="mr-0.5" />
            {totalBilled.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400">Current Session Active Term</span>
        </div>

        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 shadow-xs">
          <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Total Fees Realized</span>
          <p className="text-xl font-bold text-emerald-800 dark:text-emerald-200 mt-1 flex items-center">
            <Naira className="mr-0.5" />
            {totalCollected.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
            {totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 100}% collection rate
          </span>
        </div>

        <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 p-4 shadow-xs">
          <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">Outstanding Arrears</span>
          <p className="text-xl font-bold text-amber-800 dark:text-amber-200 mt-1 flex items-center">
            <Naira className="mr-0.5" />
            {totalArrears.toLocaleString()}
          </p>
          <span className="text-[10px] text-amber-600 dark:text-amber-400">Unpaid / partial student balances</span>
        </div>

        <div className="rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 p-4 shadow-xs">
          <span className="text-[11px] font-medium text-blue-700 dark:text-blue-400">Net Operating Surplus</span>
          <p className="text-xl font-bold text-blue-800 dark:text-blue-200 mt-1 flex items-center">
            <Naira className="mr-0.5" />
            {netBalance.toLocaleString()}
          </p>
          <span className="text-[10px] text-blue-600 dark:text-blue-400">After all school expenditures</span>
        </div>
      </div>

      {/* TAB 1: INVOICES & ARREARS */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Student Term Fee Invoices</h3>
            <span className="text-xs text-slate-500">{invoices.length} Active Invoices</span>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 font-semibold text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="py-3 px-4">Invoice No</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4 text-right">Total Fee (₦)</th>
                    <th className="py-3 px-4 text-right">Paid (₦)</th>
                    <th className="py-3 px-4 text-right">Balance Due (₦)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-medium text-blue-700 dark:text-blue-400">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white">{inv.studentName}</p>
                        <p className="text-[11px] text-slate-400">{inv.admissionNumber}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        {inv.className} ({inv.armName})
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium">
                        {inv.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-emerald-600 dark:text-emerald-400">
                        {inv.paidAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {inv.balance.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                            inv.status === 'PAID'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : inv.status === 'PARTIAL'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {inv.balance > 0 ? (
                          <button
                            type="button"
                            onClick={() => handleOpenPayment(inv)}
                            className="px-2.5 py-1 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-md shadow-xs transition-colors"
                          >
                            Record Payment
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-medium">Settled in Full</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENT RECEIPTS */}
      {activeTab === 'receipts' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Issued Bursary Receipts</h3>
            <span className="text-xs text-slate-500">Official proof of payment archive</span>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 font-semibold text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="py-3 px-4">Receipt No</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Method & Ref</th>
                    <th className="py-3 px-4 text-right">Amount Paid</th>
                    <th className="py-3 px-4 text-right">Remaining Balance</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {receipts.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-blue-700 dark:text-blue-400">
                        {r.receiptNumber}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white">{r.studentName}</p>
                        <p className="text-[11px] text-slate-400">{r.admissionNumber}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{r.paymentDate}</td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{r.paymentMethod}</span>
                        <p className="text-[10px] text-slate-400 font-mono">{r.reference}</p>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ₦{r.amountPaid.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">₦{r.balanceRemaining.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedReceipt(r);
                            setIsReceiptPrintModalOpen(true);
                          }}
                          className="flex items-center gap-1 ml-auto px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-md"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          <span>View Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SCHOOL EXPENSES */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">School Operational Expenses</h3>
              <p className="text-xs text-slate-500">Generator fuel, laboratory supplies, facility upkeep</p>
            </div>
            <button
              type="button"
              onClick={() => setIsExpenseModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Record Expense Voucher</span>
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 font-semibold text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="py-3 px-4">Voucher No</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Amount (₦)</th>
                    <th className="py-3 px-4">Approved By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                        {exp.expenseNumber}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200 max-w-xs">{exp.description}</td>
                      <td className="py-3 px-4 text-slate-500">{exp.date}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                        -₦{exp.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{exp.approvedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FINANCIAL STATEMENT */}
      {activeTab === 'statement' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 max-w-3xl mx-auto">
            <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {currentSchool?.name}
              </h3>
              <p className="text-xs text-slate-500 font-medium">Bursary Income & Expenditure Statement</p>
              <p className="text-[11px] text-slate-400">
                Session: {currentSchool?.activeSession} ({currentSchool?.activeTerm})
              </p>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Income Section */}
              <div>
                <h4 className="font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider pb-1 border-b border-emerald-200 dark:border-emerald-800">
                  A. Inflow / Collections (Tuition & Levies)
                </h4>
                <div className="mt-2 space-y-1.5">
                  <div className="flex justify-between py-1">
                    <span>Termly Tuition Collections</span>
                    <span className="font-mono font-bold">₦{(totalCollected * 0.75).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Laboratory, ICT & Workshop Levies</span>
                    <span className="font-mono font-bold">₦{(totalCollected * 0.15).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>PTA Development Fund</span>
                    <span className="font-mono font-bold">₦{(totalCollected * 0.1).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-slate-200 dark:border-slate-700 font-bold text-emerald-700">
                    <span>TOTAL INFLOW</span>
                    <span className="font-mono text-sm">+₦{totalCollected.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Expenditure Section */}
              <div className="pt-2">
                <h4 className="font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider pb-1 border-b border-rose-200 dark:border-rose-800">
                  B. Outflow / Operational Expenditures
                </h4>
                <div className="mt-2 space-y-1.5">
                  {expenses.map((e) => (
                    <div key={e.id} className="flex justify-between py-1">
                      <span>{e.category} ({e.description.slice(0, 35)}...)</span>
                      <span className="font-mono text-rose-600">-₦{e.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 border-t border-slate-200 dark:border-slate-700 font-bold text-rose-700">
                    <span>TOTAL OUTFLOW</span>
                    <span className="font-mono text-sm">-₦{totalExpenditure.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Net Position */}
              <div className="mt-4 pt-3 border-t-2 border-slate-300 dark:border-slate-700 flex justify-between items-center text-sm font-black">
                <span className="text-slate-900 dark:text-white uppercase">NET CASH POSITION</span>
                <span className="font-mono text-base text-blue-700 dark:text-blue-400">
                  ₦{netBalance.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Record Fee Payment */}
      {isPaymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Record Fee Payment</h3>
                <p className="text-xs text-slate-500 font-mono">Invoice: {selectedInvoice.invoiceNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePostPayment} className="mt-4 space-y-3.5">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Student:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedInvoice.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Total Billed:</span>
                  <span className="font-mono">₦{selectedInvoice.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Outstanding Balance:</span>
                  <span className="font-mono font-bold text-rose-600">₦{selectedInvoice.balance.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Payment Amount (₦) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedInvoice.balance}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-bold font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Bank Transfer">Bank Transfer (Instant / NIBSS)</option>
                    <option value="POS">POS Terminal</option>
                    <option value="Cash">Cash at Bursary</option>
                    <option value="Card Online">Online Card Webhook</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Bank Reference / Session ID
                  </label>
                  <input
                    type="text"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Payer Full Name
                  </label>
                  <input
                    type="text"
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Payer Phone Number
                  </label>
                  <input
                    type="text"
                    value={payerPhone}
                    onChange={(e) => setPayerPhone(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Bursar Remarks / Notes
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-3 py-2 text-xs text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs"
                >
                  <Check className="h-4 w-4" />
                  <span>Confirm & Generate Receipt</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Official Printable Nigerian School Receipt */}
      {isReceiptPrintModalOpen && selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 print:p-0 print:border-0">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 print:hidden">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Official Bursary Receipt</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-blue-700 text-white rounded-lg hover:bg-blue-800"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsReceiptPrintModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Receipt Letterhead Body */}
            <div className="mt-3 p-4 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 text-xs space-y-3">
              <div className="text-center pb-2 border-b border-slate-300 dark:border-slate-700">
                <h3 className="font-bold text-sm uppercase text-slate-900 dark:text-white">
                  {currentSchool?.name}
                </h3>
                <p className="text-[10px] text-slate-500 italic">BURSARY & ACCOUNTS DEPARTMENT</p>
                <p className="text-[10px] text-slate-500">{currentSchool?.address}, {currentSchool?.state}</p>
                <div className="mt-1 inline-block bg-blue-900 text-white px-3 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                  OFFICIAL PAYMENT RECEIPT
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Receipt Number:</span>
                  <span className="font-mono font-bold text-blue-700 dark:text-blue-400">
                    {selectedReceipt.receiptNumber}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">Payment Date:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedReceipt.paymentDate}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student Name:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedReceipt.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Admission No:</span>
                  <span className="font-mono">{selectedReceipt.admissionNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Class:</span>
                  <span>{selectedReceipt.className}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Method:</span>
                  <span>{selectedReceipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction Ref:</span>
                  <span className="font-mono text-[10px]">{selectedReceipt.reference}</span>
                </div>
              </div>

              {/* Amount Box */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">
                  Amount Received in Nigerian Naira:
                </span>
                <span className="text-xl font-bold font-mono text-emerald-800 dark:text-emerald-200">
                  ₦{selectedReceipt.amountPaid.toLocaleString()}
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Remaining Outstanding Balance: ₦{selectedReceipt.balanceRemaining.toLocaleString()}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-300 dark:border-slate-700 flex justify-between items-end text-[10px] text-slate-500">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedReceipt.recordedBy}</p>
                  <p>Authorized Bursar Signature</p>
                </div>
                <div className="border border-emerald-600 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">
                  PAID & VERIFIED
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Record Expense Voucher */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Record School Expense Voucher</h3>
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Expense Category *
                </label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Diesel & Generator">Diesel & Generator Fuel</option>
                  <option value="Facility Maintenance">Facility & AC Maintenance</option>
                  <option value="Instructional & Lab Supplies">Instructional & Science Lab Supplies</option>
                  <option value="Salaries & Wages">Staff Wages / Overtime</option>
                  <option value="Sports & Events">Sports & Inter-House Events</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description / Justification *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Purchase of diesel for 150kVA generator"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Amount in Naira (₦) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="250000"
                  value={expenseAmount || ''}
                  onChange={(e) => setExpenseAmount(Number(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-xs"
                >
                  Approve & Post Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
