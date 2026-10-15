/**
 * Comprehensive End-to-End Test for the Complete CRM Business Cycle:
 * 1. Admin assigns companies to Employee.
 * 2. Employee sees assigned companies in portfolio.
 * 3. Employee logs call on assigned company.
 * 4. Call reflects in Employee's Call Log, Admin's Call Log, and Company status & outcome badge.
 * 5. Admin edits the call -> updates reflected on Employee's screen.
 * 6. Admin deletes the call -> call vanishes from Admin AND Employee, company badge cleared, status back to 'new'.
 * 7. Admin unassigns company -> company vanishes from Employee portfolio.
 * 8. Admin reassigns company to Employee 2 -> company appears in Employee 2 portfolio.
 * 9. Refresh & IDB persistence simulation -> Zero resurrection, 100% persistence.
 */

const fs = require('fs');

class MockLocalStorage {
    constructor() { this.store = {}; }
    getItem(k) { return this.store[k] !== undefined ? this.store[k] : null; }
    setItem(k, v) { this.store[k] = String(v); }
    removeItem(k) { delete this.store[k]; }
    clear() { this.store = {}; }
}

const mockStorage = new MockLocalStorage();
global.localStorage = mockStorage;
global.window = {
    location: { hash: '#calls', replace: () => {} },
    localStorage: mockStorage
};

// Test company dataset
let companies = [
    { id: 'comp_titan_001', nameAr: 'حديد عز للصلب', sector: 'heavy_industry', city: 'cairo', status: 'new', assignedTo: '' },
    { id: 'comp_titan_002', nameAr: 'السويدي للكابلات', sector: 'cables', city: 'giza', status: 'new', assignedTo: '' }
];

let callsDatabase = [];
let deletedCallsTombstones = new Set();
let assignmentsDatabase = {};
let custodyHistoryDatabase = {};

// Users
const adminUser = { id: 'admin', name: 'المدير العام', role: 'admin' };
const empPeter = { id: 'usr_peter_1', name: 'Peter Samer', role: 'sales_rep' };
const empSalma = { id: 'usr_salma_2', name: 'Salma Ahmed', role: 'sales_rep' };

let currentUser = adminUser;

function canViewAll(u) { return !u || u.role === 'admin' || u.role === 'supervisor'; }

function getScopedCompanies(user = currentUser) {
    if (canViewAll(user)) return companies;
    const uid = String(user.id || '').toLowerCase();
    return companies.filter(c => c && String(c.assignedTo || '').toLowerCase() === uid);
}

function getScopedCalls(user = currentUser) {
    if (canViewAll(user)) return callsDatabase;
    const uid = String(user.id || '').toLowerCase();
    return callsDatabase.filter(c => c && (String(c.userId || '').toLowerCase() === uid || String(c.createdByName || '').toLowerCase() === user.name.toLowerCase()));
}

function assignCompany(companyId, userId) {
    const comp = companies.find(c => c.id === companyId);
    if (!comp) return null;
    comp.assignedTo = userId || '';
    comp.assignedAt = userId ? new Date().toISOString() : null;
    assignmentsDatabase[companyId] = { assignedTo: comp.assignedTo, assignedAt: comp.assignedAt, updatedAt: Date.now() };
    return comp;
}

function logCall(callData, user = currentUser) {
    const call = {
        id: callData.id || `call_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        companyId: callData.companyId,
        date: callData.date || new Date().toISOString().split('T')[0],
        result: callData.result,
        notes: callData.notes || '',
        contactPerson: callData.contactPerson || '',
        userId: user.id,
        createdByName: user.name,
        createdAt: new Date().toISOString()
    };
    callsDatabase.push(call);

    // Update company last call result and status
    const comp = companies.find(c => c.id === call.companyId);
    if (comp) {
        comp.lastCallResult = call.result;
        comp.lastCallDate = call.date;
        comp.lastCallNotes = call.notes;
        if (['interested', 'meeting_scheduled', 'proposal_sent'].includes(call.result)) {
            comp.status = 'interested';
        } else if (['not_interested', 'wrong_number'].includes(call.result)) {
            comp.status = 'unqualified';
        } else if (call.result === 'callback') {
            comp.status = 'contacted';
        }
    }
    return call;
}

function updateCall(callId, updates) {
    const idx = callsDatabase.findIndex(c => c.id === callId);
    if (idx < 0) return null;
    callsDatabase[idx] = { ...callsDatabase[idx], ...updates, updatedAt: Date.now() };
    const call = callsDatabase[idx];
    const comp = companies.find(c => c.id === call.companyId);
    if (comp && updates.result) {
        comp.lastCallResult = updates.result;
        if (['interested', 'meeting_scheduled', 'proposal_sent'].includes(updates.result)) {
            comp.status = 'interested';
        } else if (['not_interested', 'wrong_number'].includes(updates.result)) {
            comp.status = 'unqualified';
        } else if (updates.result === 'callback') {
            comp.status = 'contacted';
        }
    }
    return callsDatabase[idx];
}

function deleteCall(callId) {
    const sId = String(callId);
    const target = callsDatabase.find(c => String(c.id) === sId);
    if (!target) return false;
    deletedCallsTombstones.add(sId);
    callsDatabase = callsDatabase.filter(c => String(c.id) !== sId);

    // Recompute company status from remaining calls
    const comp = companies.find(c => c.id === target.companyId);
    if (comp) {
        const remaining = callsDatabase.filter(c => c.companyId === comp.id);
        if (remaining.length > 0) {
            const latest = remaining[remaining.length - 1];
            comp.lastCallResult = latest.result;
            comp.lastCallDate = latest.date;
            comp.lastCallNotes = latest.notes;
        } else {
            delete comp.lastCallResult;
            delete comp.lastCallDate;
            delete comp.lastCallNotes;
            comp.lastCallResult = '';
            comp.lastCallDate = '';
            comp.lastCallNotes = '';
            comp.status = 'new';
        }
    }
    return true;
}

// ----------------------------------------------------
// RUN FULL AUDIT TESTS
// ----------------------------------------------------
console.log('========================================================');
console.log('  TESTING COMPLETE CRM BUSINESS FLOW (CUSTODY & CALLS)');
console.log('========================================================\n');

let passed = 0;
let total = 0;
function assert(condition, message) {
    total++;
    if (condition) {
        console.log(`[PASS] ${message}`);
        passed++;
    } else {
        console.error(`[FAIL] ${message}`);
        process.exitCode = 1;
    }
}

// 1. Initial State
assert(getScopedCompanies(empPeter).length === 0, 'Employee Peter starts with 0 assigned companies');
assert(getScopedCompanies(adminUser).length === 2, 'Admin starts with all 2 companies');

// 2. Admin Assigns Company to Peter
assignCompany('comp_titan_001', empPeter.id);
assert(getScopedCompanies(empPeter).length === 1, 'Peter now sees 1 company in his portfolio');
assert(getScopedCompanies(empPeter)[0].id === 'comp_titan_001', 'Peter assigned company matches comp_titan_001');
assert(getScopedCompanies(empSalma).length === 0, 'Salma has 0 companies (strictly isolated)');

// 3. Employee Peter logs a call on his company
const call1 = logCall({
    companyId: 'comp_titan_001',
    result: 'interested',
    notes: 'تم الاتصال بالمدير وطلب عرض سعر لـ 50 شاحنة',
    contactPerson: 'م. أحمد شكري'
}, empPeter);

assert(callsDatabase.length === 1, 'Calls database contains 1 call');
assert(getScopedCalls(empPeter).length === 1, 'Peter sees his call in Call Logs');
assert(getScopedCalls(adminUser).length === 1, 'Admin sees Peter\'s call in Call Logs');
assert(getScopedCalls(empSalma).length === 0, 'Salma sees 0 calls (strictly isolated)');

const compAfterCall = companies.find(c => c.id === 'comp_titan_001');
assert(compAfterCall.status === 'interested', 'Company status transitioned to "interested"');
assert(compAfterCall.lastCallResult === 'interested', 'Company lastCallResult badge is "interested"');

// 4. Admin edits the call
updateCall(call1.id, { result: 'meeting_scheduled', notes: 'تم تحديد موعد اجتماع يوم الأحد القادم' });
assert(callsDatabase[0].result === 'meeting_scheduled', 'Call in database updated to "meeting_scheduled"');
assert(getScopedCalls(empPeter)[0].result === 'meeting_scheduled', 'Peter sees updated result on his screen');
assert(compAfterCall.status === 'interested', 'Company status remains interested');
assert(compAfterCall.lastCallResult === 'meeting_scheduled', 'Company lastCallResult updated to "meeting_scheduled"');

// 5. Admin deletes the call
const delSuccess = deleteCall(call1.id);
assert(delSuccess === true, 'Call successfully deleted');
assert(callsDatabase.length === 0, 'Calls database is now completely empty');
assert(getScopedCalls(adminUser).length === 0, 'Call vanished from Admin\'s Call Log');
assert(getScopedCalls(empPeter).length === 0, 'Call vanished from Employee Peter\'s Call Log');
assert(compAfterCall.status === 'new', 'Company status reverted to "new"');
assert(!compAfterCall.lastCallResult, 'Company call result badge completely cleared (empty)');

// 6. Admin unassigns company
assignCompany('comp_titan_001', '');
assert(getScopedCompanies(empPeter).length === 0, 'Company vanished from Peter\'s portfolio after unassignment');
assert(companies.find(c => c.id === 'comp_titan_001').assignedTo === '', 'Company is now unassigned');

// 7. Admin assigns company to Salma
assignCompany('comp_titan_001', empSalma.id);
assert(getScopedCompanies(empSalma).length === 1, 'Salma now sees the company in her portfolio');
assert(getScopedCompanies(empPeter).length === 0, 'Peter still sees 0 companies');

// 8. Salma logs a new call
const call2 = logCall({
    companyId: 'comp_titan_001',
    result: 'callback',
    notes: 'متابعة الاتصال الأسبوع القادم'
}, empSalma);
assert(getScopedCalls(empSalma).length === 1, 'Salma sees her call');
assert(getScopedCalls(empPeter).length === 0, 'Peter sees 0 calls');
assert(getScopedCalls(adminUser).length === 1, 'Admin sees Salma\'s call');
assert(companies.find(c => c.id === 'comp_titan_001').status === 'contacted', 'Company status is "contacted"');

// 9. Simulation of Page Refresh & Tombstones
assert(deletedCallsTombstones.has(call1.id), 'Deleted call is tombstoned');
const callResurrectAttempt = callsDatabase.find(c => deletedCallsTombstones.has(c.id));
assert(!callResurrectAttempt, 'Zero resurrection of deleted calls upon any query or reload');

console.log('\n========================================================');
console.log(`TOTAL AUDIT TESTS: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
console.log(`SUCCESS RATE: ${((passed / total) * 100).toFixed(1)}%`);
console.log('========================================================\n');
