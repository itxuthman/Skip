# EduNaija — Premium Nigerian School Management System

A comprehensive, modern SaaS school management system specifically tailored for Nigerian primary and secondary schools. Built with a premium SaaS administration aesthetic, full REST backend, multi-school tenant data isolation, role-based access control, Nigerian WAEC/NECO assessment grading, and printable terminal report sheets.

---

## 1. System Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React Icons.
- **Backend**: Express.js REST API running via `tsx server.ts` with Vite development middleware integration.
- **Database & Data Store**: Relational in-memory and persistent data store supporting multi-tenant isolation by `schoolId`.
- **Styling & Design System**: Modern SaaS dashboard aesthetic inspired by deep navy (`#0f172a`), royal blue (`#1d4ed8`), clean white cards, Inter typography, and responsive mobile reflow.

---

## 2. Supported User Roles & Permissions

EduNaija supports 8 distinct authenticated user personas with specialized role-based views and actions:

1. **Super Admin**: Platform SaaS management across multiple Nigerian institutions (Apex Academy Lagos, Gracefield College Abuja, Kingsway Grammar School Port Harcourt), subscription tiers (Basic, Standard, Premium), tenant isolation, and revenue metrics.
2. **School Admin**: Complete day-to-day operations for an individual school.
3. **Head Teacher / Principal**: Academic supervisor, result review and publication approval, attendance monitoring, and official signing of report cards.
4. **Teachers**: Assigned classes & subjects, morning roll call attendance register, continuous assessment (1st CA & 2nd CA) and examination score entry.
5. **Students**: Dedicated student portal with personalized timetable, published terminal results, homework assignments, and attendance punctuality tracking.
6. **Parents / Guardians**: Family portal with linked children switcher, termly academic performance, printable terminal report cards, fee invoice settlement, and school circulars.
7. **Accountant / Bursar**: Termly tuition invoices, recording full and partial payments, generating unique receipts (`REC-2026-0042`), operational expense vouchers (e.g. generator diesel, lab supplies), and financial statements.
8. **Registrar**: Student admissions, automatic sequential admission number generation (`AIA/2026/0001`), official admission dossier letterhead, and class transfers.

---

## 3. Nigerian Academic Grading & Assessment Standards

- **Assessment Weighting**:
  - **1st Continuous Assessment (CA1)**: Maximum 20 Marks
  - **2nd Continuous Assessment (CA2)**: Maximum 20 Marks
  - **Terminal Examination**: Maximum 60 Marks
  - **Subject Total**: 100 Marks
- **WAEC / NECO Standard Scale**:
  - `75% - 100%`: **A1** (Distinction / Excellent)
  - `70% - 74%`: **B2** (Very Good)
  - `65% - 69%`: **B3** (Good)
  - `60% - 64%`: **C4** (Credit)
  - `55% - 59%`: **C5** (Credit)
  - `50% - 54%`: **C6** (Credit)
  - `45% - 49%`: **D7** (Pass)
  - `40% - 44%`: **E8** (Fair Pass)
  - `0% - 39%`: **F9** (Fail)
- **Position Ranking**:
  - Automated ordinal subject positions (1st, 2nd, 3rd...) with proper tie handling.
  - Overall class position computation based on total marks obtained across all registered subjects.
- **Terminal Report Card**:
  - Printable official Nigerian report sheet with school letterhead, student passport photograph, attendance statistics, cognitive scores table, affective domain ratings (1-5), psychomotor practical skills ratings (1-5), teacher remarks, principal's signature, and next term resumption date.

---

## 4. School Fees & Bursary Accounting (₦ Nigerian Naira)

- Termly invoice generation per student with itemized breakdown (Tuition, Laboratory & Science Levy, ICT/E-Library, PTA Development Fund).
- Partial and full payment processing with real-time balance reduction.
- Automatic issuance of numbered bursary receipts (`REC-2026-0042`) with payment method verification (Bank Transfer, POS, Cash).
- School operational expense tracking (Generator diesel fuel, maintenance, teaching supplies).
- Income and expenditure cashflow statement.

---

## 5. Automated Tests & Verification

- Unit tests written with `node:test` and `node:assert/strict` covering:
  - CA and exam score boundary validation
  - WAEC/NECO grading scale conversion
  - Ordinal position ranking algorithm
  - Fee balance & payment status calculations
  - Admission number generation format
  - Attendance rate percentage calculations
- Run tests at any time via:
  ```bash
  npx tsx --test src/utils/academicCalculations.test.ts
  ```

---

## 6. How to Run

```bash
# 1. Install dependencies
npm install

# 2. Start full-stack development server (Express REST API + Vite client)
npm run dev

# 3. Access in browser
http://localhost:3000
```
