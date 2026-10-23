/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { db } from '../db.ts';
import { Invoice, PaymentReceipt, ExpenseRecord } from '../../src/types/index.ts';
import { calculateFeeBalance } from '../../src/utils/academicCalculations.ts';

const router = Router();

router.get('/invoices', (req, res) => {
  const { schoolId = 'sch-001', studentId, status } = req.query;
  let list = db.invoices.filter((i) => i.schoolId === schoolId);

  if (studentId) list = list.filter((i) => i.studentId === studentId);
  if (status) list = list.filter((i) => i.status === status);

  res.json(list);
});

router.get('/receipts', (req, res) => {
  const { schoolId = 'sch-001', studentId } = req.query;
  let list = db.receipts.filter((r) => r.schoolId === schoolId);

  if (studentId) list = list.filter((r) => r.studentId === studentId);

  res.json(list);
});

router.post('/payments', (req, res) => {
  const { schoolId = 'sch-001', invoiceId, amountPaid, paymentMethod, reference, payerName, payerPhone, notes, recordedBy = 'Bursar' } = req.body;

  const invoice = db.invoices.find((i) => i.id === invoiceId);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

  const numAmount = Number(amountPaid);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Valid payment amount is required' });
  }

  if (numAmount > invoice.balance) {
    return res.status(400).json({ error: `Amount cannot exceed outstanding balance of ₦${invoice.balance.toLocaleString()}` });
  }

  invoice.paidAmount += numAmount;
  const feeCalc = calculateFeeBalance(invoice.totalAmount, invoice.paidAmount);
  invoice.balance = feeCalc.balance;
  invoice.status = feeCalc.status;

  const receiptNumber = `REC-2026-${String(db.receipts.length + 1).padStart(4, '0')}`;
  const receipt: PaymentReceipt = {
    id: `rec-${Date.now()}`,
    schoolId,
    receiptNumber,
    invoiceId: invoice.id,
    studentId: invoice.studentId,
    studentName: invoice.studentName,
    admissionNumber: invoice.admissionNumber,
    className: invoice.className,
    amountPaid: numAmount,
    balanceRemaining: invoice.balance,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: paymentMethod || 'Bank Transfer',
    reference: reference || `TRF-${Date.now()}`,
    recordedBy,
    payerName: payerName || invoice.studentName,
    payerPhone: payerPhone || '+234 800 000 0000',
    notes: notes || 'School fee payment processed',
  };

  db.receipts.unshift(receipt);
  db.addAuditLog(
    schoolId,
    recordedBy,
    'ACCOUNTANT',
    'POST_PAYMENT',
    `Recorded payment of ₦${numAmount.toLocaleString()} for ${invoice.studentName} (${invoice.admissionNumber}). Receipt: ${receiptNumber}`
  );

  res.status(201).json({ receipt, invoice });
});

router.get('/expenses', (req, res) => {
  const { schoolId = 'sch-001' } = req.query;
  res.json(db.expenses.filter((e) => e.schoolId === schoolId));
});

router.post('/expenses', (req, res) => {
  const { schoolId = 'sch-001', category, description, amount, recordedBy = 'Bursar', approvedBy = 'Principal' } = req.body;
  if (!category || !description || !amount) {
    return res.status(400).json({ error: 'Category, description, and amount are required' });
  }

  const numAmount = Number(amount);
  const expenseNumber = `EXP/2026/${String(db.expenses.length + 1).padStart(3, '0')}`;

  const expense: ExpenseRecord = {
    id: `exp-${Date.now()}`,
    schoolId,
    expenseNumber,
    category,
    description,
    amount: numAmount,
    date: new Date().toISOString().split('T')[0],
    recordedBy,
    approvedBy,
    status: 'APPROVED',
  };

  db.expenses.unshift(expense);
  db.addAuditLog(schoolId, recordedBy, 'ACCOUNTANT', 'RECORD_EXPENSE', `Recorded expense of ₦${numAmount.toLocaleString()} for ${description}`);
  res.status(201).json(expense);
});

export default router;
