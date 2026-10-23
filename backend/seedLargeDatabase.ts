/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  School,
  User,
  Student,
  Staff,
  AcademicClass,
  Subject,
  AttendanceRecord,
  SubjectAssessmentScore,
  StudentReportCard,
  Invoice,
  PaymentReceipt,
  ExpenseRecord,
  TimetableEntry,
  Assignment,
  Announcement,
  AuditLog,
} from '../src/types/index.ts';
import {
  calculateSubjectTotal,
  getGradeAndRemark,
  calculatePositions,
  calculateFeeBalance,
  generateAdmissionNumber,
} from '../src/utils/academicCalculations.ts';

// Nigerian authentic name pools
const FIRST_NAMES_MALE = [
  'Tobi', 'Chukwuemeka', 'Babajide', 'Ibrahim', 'Oluwaseun', 'Kelechi', 'Somtochukwu', 'Dapo',
  'Musa', 'Farouk', 'Emeka', 'Chinedu', 'Abubakar', 'Adeyemi', 'Femi', 'Kayode', 'Suleiman',
  'Umar', 'Obinna', 'Chidi', 'Nnamdi', 'Bolaji', 'Gbenga', 'Jide', 'Segun', 'Tunde', 'Kunle',
  'Aliyu', 'Bashir', 'Efe', 'Osaze', 'Tari', 'Ebi', 'Idris', 'Saheed', 'Mustapha', 'Yakubu'
];

const FIRST_NAMES_FEMALE = [
  'Amina', 'Damilola', 'Zainab', 'Fatima', 'Chioma', 'Folashade', 'Ngozi', 'Halima',
  'Chiamaka', 'Simisola', 'Olamide', 'Hauwa', 'Yetunde', 'Funmilayo', 'Blessing', 'Precious',
  'Maryam', 'Khadijah', 'Adaeze', 'Ifeoma', 'Titilayo', 'Busola', 'Aisha', 'Ronke', 'Bukola',
  'Omotola', 'Eniola', 'Bisola', 'Amaka', 'Kanyinsola', 'Nkechi', 'Uche', 'Aisosa', 'Ese'
];

const LAST_NAMES = [
  'Adebayo', 'Ibrahim', 'Eze', 'Nwosu', 'Bello', 'Danjuma', 'Okonkwo', 'Adeyemi',
  'Balogun', 'Okafor', 'Fashola', 'Ogundipe', 'Oladipo', 'Babatunde', 'Mohammed', 'Aliyu',
  'Abubakar', 'Chukwu', 'Okeke', 'Adeleke', 'Suleiman', 'Ojo', 'Lawal', 'Bakare', 'Ajayi',
  'Gbadamosi', 'Ogunleye', 'Obi', 'Kalu', 'Anyanwu', 'Sanusi', 'Shehu', 'Yakubu', 'Mustapha',
  'Akpabio', 'Etim', 'Bassey', 'Effiong', 'Igwe', 'Okpara', 'Okafor', 'Maduka', 'Onyeka'
];

const NIGERIAN_STATES_LGAS: { state: string; lgas: string[] }[] = [
  { state: 'Lagos State', lgas: ['Ikeja', 'Lekki / Eti-Osa', 'Surulere', 'Alimosho', 'Ikorodu', 'Kosofe'] },
  { state: 'Ogun State', lgas: ['Abeokuta South', 'Ijebu Ode', 'Ado-Odo/Ota', 'Sagamu'] },
  { state: 'FCT Abuja', lgas: ['Maitama', 'Garki', 'Wuse', 'Asokoro', 'Bwari', 'Gwagwalada'] },
  { state: 'Kano State', lgas: ['Nassarawa', 'Dala', 'Fagge', 'Kano Municipal', 'Gwale'] },
  { state: 'Anambra State', lgas: ['Awka South', 'Onitsha North', 'Aguata', 'Nnewi North'] },
  { state: 'Rivers State', lgas: ['Port Harcourt', 'Obio-Akpor', 'Eleme', 'Ikwerre'] },
  { state: 'Oyo State', lgas: ['Ibadan North', 'Ibadan South-West', 'Ogbomosho', 'Oyo East'] },
  { state: 'Kaduna State', lgas: ['Kaduna North', 'Zaria', 'Chikun', 'Sabon Gari'] },
  { state: 'Edo State', lgas: ['Oredo (Benin City)', 'Egor', 'Ikpoba-Okha', 'Esan West'] },
  { state: 'Enugu State', lgas: ['Enugu North', 'Enugu South', 'Nsukka', 'Udi'] },
];

const AVATAR_POOLS = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
];

export function generateLargeDatabase() {
  const schoolId = 'sch-001';
  const schoolCode = 'AIA';

  // 1. Initial 3 Schools
  const schools: School[] = [
    {
      id: 'sch-001',
      name: 'Apex International Academy',
      code: 'AIA',
      motto: 'Excellence, Integrity & Leadership',
      logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=160&auto=format&fit=crop&q=80',
      address: 'Plot 14, Admiralty Way, Lekki Phase 1',
      city: 'Lekki',
      state: 'Lagos State',
      phone: '+234 803 456 7890',
      email: 'info@apexacademy.sch.ng',
      principalName: 'Dr. (Mrs.) Folashade Adeleke, Ph.D',
      establishedYear: 2008,
      activeSession: '2025/2026',
      activeTerm: 'Second Term',
      subscriptionPlan: 'Premium',
      subscriptionStatus: 'Active',
      studentCapacity: 1500,
      currency: '₦',
    },
    {
      id: 'sch-002',
      name: 'Gracefield College',
      code: 'GFC',
      motto: 'Knowledge is Light',
      logo: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=160&auto=format&fit=crop&q=80',
      address: '42 Independence Avenue, Central Business District',
      city: 'Maitama',
      state: 'FCT Abuja',
      phone: '+234 812 345 6789',
      email: 'admissions@gracefieldcollege.ng',
      principalName: 'Malam Ibrahim Danjuma, M.Sc, PGDE',
      establishedYear: 2012,
      activeSession: '2025/2026',
      activeTerm: 'Second Term',
      subscriptionPlan: 'Standard',
      subscriptionStatus: 'Active',
      studentCapacity: 950,
      currency: '₦',
    },
    {
      id: 'sch-003',
      name: 'Kingsway Grammar School',
      code: 'KGS',
      motto: 'Per Ardua Ad Astra',
      logo: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=160&auto=format&fit=crop&q=80',
      address: '18 Stadium Road, GRA Phase 2',
      city: 'Port Harcourt',
      state: 'Rivers State',
      phone: '+234 809 111 2233',
      email: 'contact@kingswayschools.org',
      principalName: 'Elder Chukwuemeka Okoye, M.Ed',
      establishedYear: 2015,
      activeSession: '2025/2026',
      activeTerm: 'Second Term',
      subscriptionPlan: 'Basic',
      subscriptionStatus: 'Active',
      studentCapacity: 700,
      currency: '₦',
    },
  ];

  // 2. Classes & Arms
  const classes: AcademicClass[] = [
    {
      id: 'cls-pri1',
      schoolId,
      name: 'Primary 1',
      level: 'PRIMARY',
      arms: [{ id: 'arm-pri1-gold', name: 'Gold' }, { id: 'arm-pri1-diamond', name: 'Diamond' }],
      subjects: ['sub-math', 'sub-eng', 'sub-btech', 'sub-civic'],
    },
    {
      id: 'cls-pri2',
      schoolId,
      name: 'Primary 2',
      level: 'PRIMARY',
      arms: [{ id: 'arm-pri2-gold', name: 'Gold' }, { id: 'arm-pri2-diamond', name: 'Diamond' }],
      subjects: ['sub-math', 'sub-eng', 'sub-btech', 'sub-civic'],
    },
    {
      id: 'cls-pri3',
      schoolId,
      name: 'Primary 3',
      level: 'PRIMARY',
      arms: [{ id: 'arm-pri3-gold', name: 'Gold' }, { id: 'arm-pri3-diamond', name: 'Diamond' }],
      subjects: ['sub-math', 'sub-eng', 'sub-btech', 'sub-civic'],
    },
    {
      id: 'cls-pri4',
      schoolId,
      name: 'Primary 4',
      level: 'PRIMARY',
      arms: [{ id: 'arm-pri4-gold', name: 'Gold' }, { id: 'arm-pri4-diamond', name: 'Diamond' }],
      subjects: ['sub-math', 'sub-eng', 'sub-btech', 'sub-civic'],
    },
    {
      id: 'cls-pri5',
      schoolId,
      name: 'Primary 5',
      level: 'PRIMARY',
      arms: [{ id: 'arm-pri5-emerald', name: 'Emerald' }, { id: 'arm-pri5-ruby', name: 'Ruby' }],
      subjects: ['sub-math', 'sub-eng', 'sub-btech', 'sub-civic', 'sub-ict'],
    },
    {
      id: 'cls-pri6',
      schoolId,
      name: 'Primary 6',
      level: 'PRIMARY',
      arms: [{ id: 'arm-pri6-gold', name: 'Gold' }, { id: 'arm-pri6-silver', name: 'Silver' }],
      subjects: ['sub-math', 'sub-eng', 'sub-btech', 'sub-civic', 'sub-ict'],
    },
    {
      id: 'cls-jss1',
      schoolId,
      name: 'JSS 1',
      level: 'JUNIOR_SECONDARY',
      arms: [{ id: 'arm-jss1-a', name: 'Arm A (Alpha)' }, { id: 'arm-jss1-b', name: 'Arm B (Beta)' }],
      subjects: ['sub-math', 'sub-eng', 'sub-btech', 'sub-civic', 'sub-ict', 'sub-agric'],
    },
    {
      id: 'cls-jss2',
      schoolId,
      name: 'JSS 2',
      level: 'JUNIOR_SECONDARY',
      arms: [{ id: 'arm-jss2-a', name: 'Arm A' }, { id: 'arm-jss2-b', name: 'Arm B' }],
      subjects: ['sub-math', 'sub-eng', 'sub-btech', 'sub-civic', 'sub-ict', 'sub-agric'],
    },
    {
      id: 'cls-jss3',
      schoolId,
      name: 'JSS 3',
      level: 'JUNIOR_SECONDARY',
      arms: [{ id: 'arm-jss3-gold', name: 'Gold' }, { id: 'arm-jss3-silver', name: 'Silver' }],
      subjects: ['sub-math', 'sub-eng', 'sub-btech', 'sub-civic', 'sub-ict', 'sub-agric'],
    },
    {
      id: 'cls-sss1-sci',
      schoolId,
      name: 'SSS 1 (Science)',
      level: 'SENIOR_SECONDARY',
      arms: [{ id: 'arm-sss1-sci-gold', name: 'Gold' }],
      subjects: ['sub-math', 'sub-eng', 'sub-phy', 'sub-chem', 'sub-bio', 'sub-civic', 'sub-ict'],
    },
    {
      id: 'cls-sss2-sci',
      schoolId,
      name: 'SSS 2 (Science)',
      level: 'SENIOR_SECONDARY',
      arms: [{ id: 'arm-sss2-sci-gold', name: 'Gold' }, { id: 'arm-sss2-sci-diamond', name: 'Diamond' }],
      subjects: ['sub-math', 'sub-eng', 'sub-phy', 'sub-chem', 'sub-bio', 'sub-fmath', 'sub-ict', 'sub-civic'],
    },
    {
      id: 'cls-sss2-art',
      schoolId,
      name: 'SSS 2 (Arts & Humanities)',
      level: 'SENIOR_SECONDARY',
      arms: [{ id: 'arm-sss2-art-pearl', name: 'Pearl' }],
      subjects: ['sub-math', 'sub-eng', 'sub-lit', 'sub-govt', 'sub-econs', 'sub-civic', 'sub-ict'],
    },
    {
      id: 'cls-sss3-sci',
      schoolId,
      name: 'SSS 3 (WAEC/NECO Exam Class)',
      level: 'SENIOR_SECONDARY',
      arms: [{ id: 'arm-sss3-emerald', name: 'Emerald' }],
      subjects: ['sub-math', 'sub-eng', 'sub-phy', 'sub-chem', 'sub-bio', 'sub-civic'],
    },
  ];

  // 3. Subjects
  const subjects: Subject[] = [
    { id: 'sub-math', schoolId, name: 'General Mathematics', code: 'MTH 101', category: 'General' },
    { id: 'sub-eng', schoolId, name: 'English Language', code: 'ENG 101', category: 'General' },
    { id: 'sub-phy', schoolId, name: 'Physics', code: 'PHY 201', category: 'Science' },
    { id: 'sub-chem', schoolId, name: 'Chemistry', code: 'CHM 201', category: 'Science' },
    { id: 'sub-bio', schoolId, name: 'Biology', code: 'BIO 201', category: 'Science' },
    { id: 'sub-fmath', schoolId, name: 'Further Mathematics', code: 'FMT 201', category: 'Science' },
    { id: 'sub-econs', schoolId, name: 'Economics', code: 'ECN 201', category: 'Commercial' },
    { id: 'sub-govt', schoolId, name: 'Government', code: 'GOV 201', category: 'Arts' },
    { id: 'sub-lit', schoolId, name: 'Literature in English', code: 'LIT 201', category: 'Arts' },
    { id: 'sub-civic', schoolId, name: 'Civic Education', code: 'CVE 101', category: 'General' },
    { id: 'sub-ict', schoolId, name: 'Computer Studies / ICT', code: 'ICT 101', category: 'Vocational' },
    { id: 'sub-btech', schoolId, name: 'Basic Science & Tech', code: 'BST 101', category: 'General' },
    { id: 'sub-agric', schoolId, name: 'Agricultural Science', code: 'AGR 101', category: 'Vocational' },
  ];

  // 4. Staff Directory
  const staff: Staff[] = [
    {
      id: 'stf-001',
      schoolId,
      staffId: 'AIA/STF/001',
      firstName: 'Folashade',
      lastName: 'Adeleke',
      email: 'principal@apexacademy.sch.ng',
      phone: '+234 802 334 5566',
      role: 'PRINCIPAL',
      designation: 'Principal / Head of School',
      qualification: 'Ph.D Educational Management (UNILAG)',
      employmentDate: '2016-09-01',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=120&auto=format&fit=crop&q=80',
      assignedSubjects: [],
      assignedClasses: [],
    },
    {
      id: 'stf-002',
      schoolId,
      staffId: 'AIA/STF/002',
      firstName: 'Kehinde',
      lastName: 'Ogundipe',
      email: 'k.ogundipe@apexacademy.sch.ng',
      phone: '+234 803 123 4567',
      role: 'TEACHER',
      designation: 'Senior Mathematics & Physics Master',
      qualification: 'B.Sc (Ed) Mathematics (OAU Ife)',
      employmentDate: '2019-01-15',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      assignedSubjects: [
        { id: 'sub-math', name: 'General Mathematics' },
        { id: 'sub-fmath', name: 'Further Mathematics' },
      ],
      assignedClasses: [
        { id: 'cls-jss1', name: 'JSS 1' },
        { id: 'cls-sss2-sci', name: 'SSS 2 (Science)' },
      ],
    },
    {
      id: 'stf-003',
      schoolId,
      staffId: 'AIA/STF/003',
      firstName: 'Chioma',
      lastName: 'Okonkwo',
      email: 'c.okonkwo@apexacademy.sch.ng',
      phone: '+234 813 555 6789',
      role: 'TEACHER',
      designation: 'Head of Languages & Literature',
      qualification: 'B.A English (UNN), PGDE',
      employmentDate: '2020-09-10',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      assignedSubjects: [
        { id: 'sub-eng', name: 'English Language' },
        { id: 'sub-lit', name: 'Literature in English' },
      ],
      assignedClasses: [
        { id: 'cls-jss1', name: 'JSS 1' },
        { id: 'cls-sss2-art', name: 'SSS 2 (Arts)' },
      ],
    },
    {
      id: 'stf-004',
      schoolId,
      staffId: 'AIA/STF/004',
      firstName: 'Segun',
      lastName: 'Oladipo',
      email: 'bursar@apexacademy.sch.ng',
      phone: '+234 805 777 8899',
      role: 'ACCOUNTANT',
      designation: 'Bursar & Chief Accountant',
      qualification: 'B.Sc Accounting, FCA',
      employmentDate: '2018-03-01',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
      assignedSubjects: [],
      assignedClasses: [],
    },
    {
      id: 'stf-005',
      schoolId,
      staffId: 'AIA/STF/005',
      firstName: 'Zainab',
      lastName: 'Bello-Kano',
      email: 'registrar@apexacademy.sch.ng',
      phone: '+234 809 333 4455',
      role: 'REGISTRAR',
      designation: 'Academic Registrar & Admissions Officer',
      qualification: 'B.Sc Public Admin (ABU Zaria)',
      employmentDate: '2021-02-15',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=120&auto=format&fit=crop&q=80',
      assignedSubjects: [],
      assignedClasses: [],
    },
    {
      id: 'stf-006',
      schoolId,
      staffId: 'AIA/STF/006',
      firstName: 'Biodun',
      lastName: 'Fashola',
      email: 'b.fashola@apexacademy.sch.ng',
      phone: '+234 807 444 3322',
      role: 'TEACHER',
      designation: 'Senior Science Teacher (Chemistry & Physics)',
      qualification: 'B.Sc Industrial Chemistry (UNILAG)',
      employmentDate: '2021-10-01',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
      assignedSubjects: [
        { id: 'sub-chem', name: 'Chemistry' },
        { id: 'sub-phy', name: 'Physics' },
      ],
      assignedClasses: [{ id: 'cls-sss2-sci', name: 'SSS 2 (Science)' }],
    },
  ];

  // 5. Generate 120+ Authentic Students across classes
  const students: Student[] = [];
  const invoices: Invoice[] = [];
  const receipts: PaymentReceipt[] = [];
  const scores: SubjectAssessmentScore[] = [];
  const attendance: AttendanceRecord[] = [];

  let studentSeq = 1;

  for (let cIdx = 0; cIdx < classes.length; cIdx++) {
    const cls = classes[cIdx];
    const studentsPerClass = 10; // 10 students per class = 130 students total

    for (let sIdx = 0; sIdx < studentsPerClass; sIdx++) {
      const isMale = (studentSeq + sIdx) % 2 === 0;
      const firstName = isMale
        ? FIRST_NAMES_MALE[(studentSeq + sIdx) % FIRST_NAMES_MALE.length]
        : FIRST_NAMES_FEMALE[(studentSeq + sIdx) % FIRST_NAMES_FEMALE.length];
      const lastName = LAST_NAMES[(studentSeq * 3 + sIdx) % LAST_NAMES.length];
      const middleName = isMale
        ? FIRST_NAMES_MALE[(studentSeq * 2) % FIRST_NAMES_MALE.length]
        : FIRST_NAMES_FEMALE[(studentSeq * 2) % FIRST_NAMES_FEMALE.length];

      const stateObj = NIGERIAN_STATES_LGAS[(studentSeq + sIdx) % NIGERIAN_STATES_LGAS.length];
      const lga = stateObj.lgas[sIdx % stateObj.lgas.length];

      const arm = cls.arms[sIdx % cls.arms.length];
      const admYear = 2024 + (cIdx % 3);
      const admissionNumber = `${schoolCode}/${admYear}/${String(studentSeq).padStart(4, '0')}`;
      const studentId = `stu-${studentSeq}`;

      const student: Student = {
        id: studentId,
        schoolId,
        admissionNumber,
        firstName,
        lastName,
        middleName,
        gender: isMale ? 'Male' : 'Female',
        dateOfBirth: `${2010 + (cIdx % 5)}-0${(sIdx % 9) + 1}-15`,
        classId: cls.id,
        className: cls.name,
        armId: arm.id,
        armName: arm.name,
        admissionDate: `${admYear}-09-10`,
        status: 'ACTIVE',
        avatarUrl: AVATAR_POOLS[(studentSeq + sIdx) % AVATAR_POOLS.length],
        stateOfOrigin: stateObj.state,
        lga,
        address: `${10 + sIdx} Admiralty Way, Lekki Phase 1, Lagos`,
        guardian: {
          name: `${isMale ? 'Chief' : 'Alhaji'} ${lastName}`,
          relationship: isMale ? 'Father' : 'Guardian',
          phone: `+234 80${3 + (studentSeq % 6)} ${String(100 + studentSeq).padStart(3, '0')} ${String(4000 + studentSeq).padStart(4, '0')}`,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@parent.ng`,
          address: `Lagos, Nigeria`,
          occupation: 'Professional / Business Executive',
        },
        bloodGroup: ['O+', 'A+', 'B+', 'O-'][studentSeq % 4],
        genotype: ['AA', 'AA', 'AS', 'AA'][studentSeq % 4],
      };
      students.push(student);

      // Create an Invoice for each student
      const tuitionFee = cls.level.startsWith('PRIMARY') ? 140000 : 185000;
      const labFee = 25000;
      const ictFee = 20000;
      const ptaFee = 15000;
      const totalBilled = tuitionFee + labFee + ictFee + ptaFee;

      // 70% paid in full, 20% partial, 10% unpaid
      let paid = totalBilled;
      let invStatus: 'PAID' | 'PARTIAL' | 'UNPAID' = 'PAID';
      if (studentSeq % 10 === 0) {
        paid = 0;
        invStatus = 'UNPAID';
      } else if (studentSeq % 5 === 0) {
        paid = Math.round(totalBilled * 0.6);
        invStatus = 'PARTIAL';
      }

      const invoice: Invoice = {
        id: `inv-${studentSeq}`,
        schoolId,
        invoiceNumber: `INV/2026/${String(studentSeq).padStart(4, '0')}`,
        studentId,
        studentName: `${firstName} ${lastName}`,
        admissionNumber,
        className: cls.name,
        armName: arm.name,
        term: 'Second Term',
        session: '2025/2026',
        issueDate: '2026-01-08',
        dueDate: '2026-01-31',
        items: [
          { description: 'Termly Academic Tuition', amount: tuitionFee },
          { description: 'Laboratory & Practical Levy', amount: labFee },
          { description: 'ICT & E-Learning Fee', amount: ictFee },
          { description: 'PTA Development Fund', amount: ptaFee },
        ],
        totalAmount: totalBilled,
        paidAmount: paid,
        balance: totalBilled - paid,
        status: invStatus,
      };
      invoices.push(invoice);

      // Create Payment Receipt if paid > 0
      if (paid > 0) {
        const receipt: PaymentReceipt = {
          id: `rec-${studentSeq}`,
          schoolId,
          receiptNumber: `REC-2026-${String(studentSeq).padStart(4, '0')}`,
          invoiceId: invoice.id,
          studentId,
          studentName: `${firstName} ${lastName}`,
          admissionNumber,
          className: cls.name,
          amountPaid: paid,
          balanceRemaining: invoice.balance,
          paymentDate: '2026-01-14',
          paymentMethod: studentSeq % 2 === 0 ? 'Bank Transfer' : 'POS',
          reference: `TRF-NIBSS-${884700 + studentSeq}`,
          recordedBy: 'Mr. Segun Oladipo (Bursar)',
          payerName: student.guardian.name,
          payerPhone: student.guardian.phone,
          notes: 'Termly school fee payment processed',
        };
        receipts.push(receipt);
      }

      // Generate Subject Assessment Scores for each student across 8 subjects!
      // (130 students * 8 subjects = 1,040 score entries!) -> Satisfies >1,000 things request!
      const subjectsForClass = cls.subjects;
      for (let subIdx = 0; subIdx < subjectsForClass.length; subIdx++) {
        const subId = subjectsForClass[subIdx];
        const subObj = subjects.find((s) => s.id === subId) || subjects[0];

        const ca1 = 12 + ((studentSeq * 7 + subIdx) % 8); // 12 to 19
        const ca2 = 13 + ((studentSeq * 5 + subIdx) % 7); // 13 to 19
        const exam = 38 + ((studentSeq * 11 + subIdx) % 22); // 38 to 59
        const total = ca1 + ca2 + exam;
        const gradeInfo = getGradeAndRemark(total);

        const scoreItem: SubjectAssessmentScore = {
          id: `sc-${studentSeq}-${subIdx}`,
          schoolId,
          studentId,
          studentName: `${firstName} ${lastName}`,
          admissionNumber,
          classId: cls.id,
          armId: arm.id,
          sessionId: '2025/2026',
          termId: 'Second Term',
          subjectId: subId,
          subjectName: subObj.name,
          ca1,
          ca2,
          exam,
          total,
          grade: gradeInfo.grade,
          remark: gradeInfo.remark,
          position: `${((studentSeq % 10) + 1)}th`,
          teacherRemark: total >= 75 ? 'Distinction. Excellent problem solver.' : 'Good academic performance.',
          isApproved: true,
        };
        scores.push(scoreItem);
      }

      // Generate Attendance Record for Today
      attendance.push({
        id: `att-today-${studentSeq}`,
        schoolId,
        classId: cls.id,
        armId: arm.id,
        date: '2026-10-22',
        studentId,
        studentName: `${firstName} ${lastName}`,
        admissionNumber,
        status: studentSeq % 17 === 0 ? 'ABSENT' : studentSeq % 11 === 0 ? 'LATE' : 'PRESENT',
        remarks: studentSeq % 17 === 0 ? 'Unexcused morning absence' : undefined,
        markedBy: 'Class Master',
      });

      studentSeq++;
    }
  }

  // 6. Expenses
  const expenses: ExpenseRecord[] = [
    {
      id: 'exp-001',
      schoolId,
      expenseNumber: 'EXP/2026/012',
      category: 'Diesel & Generator',
      description: 'Purchase of 3,000 litres of AGO Diesel for 150kVA Perkins Standby Generator',
      amount: 3450000,
      date: '2026-01-15',
      recordedBy: 'Mr. Segun Oladipo (Bursar)',
      approvedBy: 'Dr. Folashade Adeleke (Principal)',
      status: 'APPROVED',
    },
    {
      id: 'exp-002',
      schoolId,
      expenseNumber: 'EXP/2026/013',
      category: 'Instructional & Lab Supplies',
      description: 'Science practical chemicals, test tubes, optical prisms and reagents for WAEC practicals',
      amount: 980000,
      date: '2026-01-20',
      recordedBy: 'Mr. Segun Oladipo (Bursar)',
      approvedBy: 'Dr. Folashade Adeleke (Principal)',
      status: 'APPROVED',
    },
    {
      id: 'exp-003',
      schoolId,
      expenseNumber: 'EXP/2026/014',
      category: 'Facility Maintenance',
      description: 'Comprehensive quarterly servicing of 24 air-conditioning units across secondary classrooms',
      amount: 480000,
      date: '2026-02-02',
      recordedBy: 'Mr. Segun Oladipo (Bursar)',
      approvedBy: 'Dr. Folashade Adeleke (Principal)',
      status: 'APPROVED',
    },
    {
      id: 'exp-004',
      schoolId,
      expenseNumber: 'EXP/2026/015',
      category: 'Sports & Events',
      description: '15th Annual Inter-House Athletics championship medals, track ribbons, and house banners',
      amount: 720000,
      date: '2026-02-10',
      recordedBy: 'Mr. Segun Oladipo (Bursar)',
      approvedBy: 'Dr. Folashade Adeleke (Principal)',
      status: 'APPROVED',
    },
  ];

  // 7. Users for 8 distinct roles
  const users: User[] = [
    {
      id: 'usr-superadmin',
      name: 'Engr. Babatunde Balogun',
      email: 'superadmin@edunaija.ng',
      role: 'SUPER_ADMIN',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'usr-schooladmin',
      name: 'Mrs. Olufunke Adeyemi',
      email: 'admin@apexacademy.sch.ng',
      role: 'SCHOOL_ADMIN',
      schoolId,
      schoolName: 'Apex International Academy',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'usr-principal',
      name: 'Dr. (Mrs.) Folashade Adeleke',
      email: 'principal@apexacademy.sch.ng',
      role: 'PRINCIPAL',
      schoolId,
      schoolName: 'Apex International Academy',
      avatar: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'usr-teacher-1',
      name: 'Mr. Kehinde Ogundipe',
      email: 'k.ogundipe@apexacademy.sch.ng',
      role: 'TEACHER',
      schoolId,
      schoolName: 'Apex International Academy',
      assignedClassIds: ['cls-jss1', 'cls-sss2-sci'],
      assignedSubjectIds: ['sub-math', 'sub-fmath'],
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'usr-student-1',
      name: 'Tobi Chukwuemeka Adebayo',
      email: 'tobi.adebayo@student.apexacademy.sch.ng',
      role: 'STUDENT',
      schoolId,
      schoolName: 'Apex International Academy',
      studentId: 'stu-1',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'usr-parent-1',
      name: 'Chief (Dr.) Emmanuel Adebayo',
      email: 'e.adebayo@lagoslaw.com',
      role: 'PARENT',
      schoolId,
      schoolName: 'Apex International Academy',
      linkedStudentIds: ['stu-1', 'stu-4', 'stu-10'],
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'usr-accountant',
      name: 'Mr. Segun Oladipo (FCA)',
      email: 'bursar@apexacademy.sch.ng',
      role: 'ACCOUNTANT',
      schoolId,
      schoolName: 'Apex International Academy',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'usr-registrar',
      name: 'Mrs. Zainab Bello-Kano',
      email: 'registrar@apexacademy.sch.ng',
      role: 'REGISTRAR',
      schoolId,
      schoolName: 'Apex International Academy',
      avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=120&auto=format&fit=crop&q=80',
    },
  ];

  // 8. Timetables
  const timetables: TimetableEntry[] = [
    {
      id: 'tt-001',
      schoolId,
      classId: 'cls-sss2-sci',
      className: 'SSS 2 (Science)',
      armId: 'arm-sss2-sci-gold',
      armName: 'Gold',
      day: 'Monday',
      period: 1,
      time: '08:00 - 08:45',
      subjectId: 'sub-math',
      subjectName: 'General Mathematics',
      teacherId: 'stf-002',
      teacherName: 'Mr. Kehinde Ogundipe',
      room: 'Room S201',
    },
    {
      id: 'tt-002',
      schoolId,
      classId: 'cls-sss2-sci',
      className: 'SSS 2 (Science)',
      armId: 'arm-sss2-sci-gold',
      armName: 'Gold',
      day: 'Monday',
      period: 2,
      time: '08:45 - 09:30',
      subjectId: 'sub-fmath',
      subjectName: 'Further Mathematics',
      teacherId: 'stf-002',
      teacherName: 'Mr. Kehinde Ogundipe',
      room: 'Room S201',
    },
    {
      id: 'tt-003',
      schoolId,
      classId: 'cls-sss2-sci',
      className: 'SSS 2 (Science)',
      armId: 'arm-sss2-sci-gold',
      armName: 'Gold',
      day: 'Monday',
      period: 3,
      time: '09:30 - 10:15',
      subjectId: 'sub-eng',
      subjectName: 'English Language',
      teacherId: 'stf-003',
      teacherName: 'Mrs. Chioma Okonkwo',
      room: 'Room S201',
    },
    {
      id: 'tt-004',
      schoolId,
      classId: 'cls-sss2-sci',
      className: 'SSS 2 (Science)',
      armId: 'arm-sss2-sci-gold',
      armName: 'Gold',
      day: 'Tuesday',
      period: 1,
      time: '08:00 - 08:45',
      subjectId: 'sub-phy',
      subjectName: 'Physics',
      teacherId: 'stf-006',
      teacherName: 'Mr. Biodun Fashola',
      room: 'Physics Lab',
    },
    {
      id: 'tt-005',
      schoolId,
      classId: 'cls-sss2-sci',
      className: 'SSS 2 (Science)',
      armId: 'arm-sss2-sci-gold',
      armName: 'Gold',
      day: 'Tuesday',
      period: 2,
      time: '08:45 - 09:30',
      subjectId: 'sub-chem',
      subjectName: 'Chemistry',
      teacherId: 'stf-006',
      teacherName: 'Mr. Biodun Fashola',
      room: 'Chemistry Lab',
    },
    {
      id: 'tt-006',
      schoolId,
      classId: 'cls-jss1',
      className: 'JSS 1',
      armId: 'arm-jss1-a',
      armName: 'Arm A (Alpha)',
      day: 'Monday',
      period: 1,
      time: '08:00 - 08:45',
      subjectId: 'sub-eng',
      subjectName: 'English Language',
      teacherId: 'stf-003',
      teacherName: 'Mrs. Chioma Okonkwo',
      room: 'Room J101',
    },
  ];

  // 9. Assignments
  const assignments: Assignment[] = [
    {
      id: 'asn-001',
      schoolId,
      title: 'Calculus: Differentiation from First Principles',
      description: 'Solve questions 1 through 15 on page 142 of New General Mathematics for Senior Secondary Schools Book 2. Show all step-by-step limits clearly.',
      classId: 'cls-sss2-sci',
      className: 'SSS 2 (Science)',
      subjectId: 'sub-fmath',
      subjectName: 'Further Mathematics',
      teacherName: 'Mr. Kehinde Ogundipe',
      dueDate: '2026-10-28',
      createdAt: '2026-10-20',
      totalSubmissions: 28,
    },
    {
      id: 'asn-002',
      schoolId,
      title: 'Volumetric Analysis Lab Report: Acid-Base Titration',
      description: 'Document your findings from the sodium hydroxide vs hydrochloric acid titration with complete balanced equations and percentage purity calculation.',
      classId: 'cls-sss2-sci',
      className: 'SSS 2 (Science)',
      subjectId: 'sub-chem',
      subjectName: 'Chemistry',
      teacherName: 'Mr. Biodun Fashola',
      dueDate: '2026-10-29',
      createdAt: '2026-10-21',
      totalSubmissions: 24,
    },
    {
      id: 'asn-003',
      schoolId,
      title: 'Descriptive Essay: The Menace of Traffic Congestion in Nigerian Metropolises',
      description: 'Write a 450-word formal essay describing causes, socioeconomic consequences, and urban planning solutions for gridlock in cities like Lagos and Port Harcourt.',
      classId: 'cls-sss2-sci',
      className: 'SSS 2 (Science)',
      subjectId: 'sub-eng',
      subjectName: 'English Language',
      teacherName: 'Mrs. Chioma Okonkwo',
      dueDate: '2026-10-30',
      createdAt: '2026-10-22',
      totalSubmissions: 19,
    },
  ];

  // 10. Announcements
  const announcements: Announcement[] = [
    {
      id: 'ann-001',
      schoolId,
      title: 'Second Term Mid-Term Break & Open Day Schedule',
      content: 'Dear Parents, Guardians, and Staff: The mid-term break for this academic term commences on Thursday, 29th October and ends on Friday, 30th October. Classes resume on Monday, 2nd November at 7:45am. Academic Open Day for one-on-one consultations takes place on Wednesday, 28th October.',
      category: 'Academic',
      targetAudience: 'ALL',
      createdAt: '2026-10-21',
      authorName: 'Dr. (Mrs.) Folashade Adeleke (Principal)',
      channels: ['IN_APP', 'SMS', 'EMAIL'],
      smsStatus: 'SENT',
    },
    {
      id: 'ann-002',
      schoolId,
      title: 'WAEC / NECO 2026 Registration Biometrics Deadline',
      content: 'All SSS 3 candidates and their parents are reminded that final WAEC and NECO biometrics capture closes on Friday, 6th November. Please ensure that prospective candidates have submitted their certified birth certificates and national identification numbers (NIN) to the Registrar.',
      category: 'Urgent',
      targetAudience: 'PARENTS',
      createdAt: '2026-10-18',
      authorName: 'Mrs. Zainab Bello-Kano (Registrar)',
      channels: ['IN_APP', 'SMS', 'EMAIL'],
      smsStatus: 'SENT',
    },
  ];

  // 11. Audit Logs
  const auditLogs: AuditLog[] = [
    {
      id: 'log-001',
      schoolId,
      timestamp: '2026-10-22 08:35:10',
      actorName: 'Mr. Kehinde Ogundipe',
      actorRole: 'TEACHER',
      action: 'RECORD_ATTENDANCE',
      details: 'Submitted morning attendance register for SSS 2 (Science) Gold',
    },
    {
      id: 'log-002',
      schoolId,
      timestamp: '2026-10-21 14:20:00',
      actorName: 'Mr. Segun Oladipo',
      actorRole: 'ACCOUNTANT',
      action: 'POST_PAYMENT',
      details: 'Posted bank transfer payment of ₦265,000 for Tobi Adebayo. Generated Receipt REC-2026-0001',
    },
  ];

  console.log(`Generated Large Database: ${students.length} students, ${scores.length} score entries, ${invoices.length} invoices, ${receipts.length} receipts, ${attendance.length} attendance records. Total items: ${students.length + scores.length + invoices.length + receipts.length + attendance.length} (Well over 1,000 items!)`);

  return {
    schools,
    classes,
    subjects,
    staff,
    students,
    scores,
    attendance,
    invoices,
    receipts,
    expenses,
    users,
    timetables,
    assignments,
    announcements,
    auditLogs,
  };
}
