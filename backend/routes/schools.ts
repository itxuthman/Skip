/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { db } from '../db.ts';
import { School } from '../../src/types/index.ts';

const router = Router();

router.get('/', (req, res) => {
  res.json(db.schools);
});

router.post('/', (req, res) => {
  const { name, code, address, city, state, phone, email, principalName, subscriptionPlan } = req.body;
  if (!name || !code) {
    return res.status(400).json({ error: 'School name and code are required' });
  }

  const newSchool: School = {
    id: `sch-${Date.now()}`,
    name,
    code: code.toUpperCase(),
    motto: req.body.motto || 'Knowledge, Faith and Character',
    logo: req.body.logo || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=160&auto=format&fit=crop&q=80',
    address: address || 'Lagos, Nigeria',
    city: city || 'Lagos',
    state: state || 'Lagos State',
    phone: phone || '+234 800 000 0000',
    email: email || 'contact@school.ng',
    principalName: principalName || 'Principal',
    establishedYear: new Date().getFullYear(),
    activeSession: '2025/2026',
    activeTerm: 'Second Term',
    subscriptionPlan: subscriptionPlan || 'Standard',
    subscriptionStatus: 'Active',
    studentCapacity: 1000,
    currency: '₦',
  };

  db.schools.push(newSchool);
  db.addAuditLog(newSchool.id, 'Platform Admin', 'SUPER_ADMIN', 'CREATE_SCHOOL', `Registered new school: ${name} (${code})`);
  res.status(201).json(newSchool);
});

router.patch('/:id', (req, res) => {
  const school = db.schools.find((s) => s.id === req.params.id);
  if (!school) return res.status(404).json({ error: 'School not found' });

  Object.assign(school, req.body);
  db.addAuditLog(school.id, 'Admin', 'SCHOOL_ADMIN', 'UPDATE_SCHOOL_SETTINGS', `Updated settings for ${school.name}`);
  res.json(school);
});

export default router;
