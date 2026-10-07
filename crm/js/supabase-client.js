/**
 * Fleet CRM - Cloud Synchronization Engine (Firebase Realtime Database)
 * Version: 122.0 - High Performance Modular Delta Sync Engine
 * URL: https://fleet-crm-38ba6-default-rtdb.firebaseio.com
 */

window.SupabaseClient = (function() {
    'use strict';

    const FIREBASE_DB_URL = 'https://fleet-crm-38ba6-default-rtdb.firebaseio.com';
    const currentClientId = 'cli_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
    let currentStatus = 'local'; // 'synced' | 'syncing' | 'offline' | 'local'
    let statusCallbacks = [];
    let sseSource = null;
    let sseAssignments = null;
    let pollInterval = null;
    let assignPollInterval = null;
    const syncChannel = (typeof window !== 'undefined' && typeof window.BroadcastChannel !== 'undefined') ? new BroadcastChannel('fleetcrm_realtime_sync') : null;
    let isPushing = false;
    let lastSyncTimestamp = 0;
    let _mobileFocusBound = false;
    let _assignFocusBound = false;

    function onStatusChange(callback) {
        if (typeof callback === 'function') {
            statusCallbacks.push(callback);
            callback(currentStatus, {});
        }
    }

    function setStatus(status, details = {}) {
        currentStatus = status;
        statusCallbacks.forEach(cb => {
            try { cb(status, details); } catch(e) {}
        });
    }

    function getStatus() {
        return currentStatus;
    }

    /**
     * Fetch all dynamic data from Firebase (< 40KB total) via high-speed single round-trip GET
     */
    async function fetchMasterData() {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout max

        try {
            let rootData = null;
            try {
                // ⚡ Turbo Root Fetch: Single HTTP round-trip (< 400ms vs 8 parallel connection queues)
                const r = await fetch(`${FIREBASE_DB_URL}/.json?t=${Date.now()}`, { signal: controller.signal });
                if (r.ok) {
                    rootData = await r.json();
                }
            } catch(e) {
                console.warn('Root fetch failed, fallback to modular endpoints:', e);
            }

            let dynamicCompaniesObj, assignmentsObj, callsData, usersData, actsData, deletedCallsObj, deletedCompaniesObj, custodyObj;

            if (rootData && typeof rootData === 'object') {
                dynamicCompaniesObj = rootData.dynamic_companies || {};
                assignmentsObj = rootData.assignments || {};
                callsData = rootData.calls || [];
                usersData = rootData.users || [];
                actsData = rootData.activities || [];
                deletedCallsObj = rootData.deleted_calls || {};
                deletedCompaniesObj = rootData.deleted_companies || {};
                custodyObj = rootData.custody || {};
            } else {
                // Resilient Fallback to modular endpoints if root was unreachable
                const safeFetch = async (url, fallback) => {
                    try {
                        const r = await fetch(url, { signal: controller.signal });
                        if (!r.ok) return fallback;
                        return await r.json();
                    } catch(e) {
                        return fallback;
                    }
                };

                [dynamicCompaniesObj, assignmentsObj, callsData, usersData, actsData, deletedCallsObj, deletedCompaniesObj, custodyObj] = await Promise.all([
                    safeFetch(`${FIREBASE_DB_URL}/dynamic_companies.json?t=${Date.now()}`, {}),
                    safeFetch(`${FIREBASE_DB_URL}/assignments.json?t=${Date.now()}`, {}),
                    safeFetch(`${FIREBASE_DB_URL}/calls.json?t=${Date.now()}`, []),
                    safeFetch(`${FIREBASE_DB_URL}/users.json?t=${Date.now()}`, []),
                    safeFetch(`${FIREBASE_DB_URL}/activities.json?t=${Date.now()}`, []),
                    safeFetch(`${FIREBASE_DB_URL}/deleted_calls.json?t=${Date.now()}`, {}),
                    safeFetch(`${FIREBASE_DB_URL}/deleted_companies.json?t=${Date.now()}`, {}),
                    safeFetch(`${FIREBASE_DB_URL}/custody.json?t=${Date.now()}`, {})
                ]);
            }
            clearTimeout(timeoutId);

            let dynamicCompanies = [];
            if (dynamicCompaniesObj && typeof dynamicCompaniesObj === 'object') {
                if (Array.isArray(dynamicCompaniesObj)) {
                    dynamicCompanies = dynamicCompaniesObj.filter(Boolean);
                } else {
                    dynamicCompanies = Object.values(dynamicCompaniesObj).filter(Boolean);
                }
            }

            let deletedCallsList = [];
            if (deletedCallsObj && typeof deletedCallsObj === 'object') {
                if (Array.isArray(deletedCallsObj)) {
                    deletedCallsList = deletedCallsObj.filter(Boolean).map(String);
                } else {
                    deletedCallsList = Object.keys(deletedCallsObj);
                }
            }

            let deletedCompaniesList = [];
            if (deletedCompaniesObj && typeof deletedCompaniesObj === 'object') {
                if (Array.isArray(deletedCompaniesObj)) {
                    deletedCompaniesList = deletedCompaniesObj.filter(Boolean).map(String);
                } else {
                    deletedCompaniesList = Object.keys(deletedCompaniesObj);
                }
            }

            setStatus('synced', { dynamicCount: dynamicCompanies.length });

            return {
                dynamicCompanies: dynamicCompanies,
                assignments: (assignmentsObj && typeof assignmentsObj === 'object') ? assignmentsObj : {},
                calls: Array.isArray(callsData) ? callsData : (callsData ? Object.values(callsData) : []),
                deletedCalls: deletedCallsList,
                deletedCompanies: deletedCompaniesList,
                users: Array.isArray(usersData) ? usersData : (usersData ? Object.values(usersData) : []),
                activities: Array.isArray(actsData) ? actsData : (actsData ? Object.values(actsData) : []),
                custody: (custodyObj && typeof custodyObj === 'object') ? custodyObj : {},
                updated_at: (rootData && rootData.metadata && rootData.metadata.updated_at) ? rootData.metadata.updated_at : new Date().toISOString()
            };
        } catch (err) {
            clearTimeout(timeoutId);
            setStatus('local', { error: err.message });
            return null;
        }
    }

    /**
     * Fallback modular push in case root PATCH is unavailable
     */
    async function pushMasterDataModularFallback(data, signal) {
        if (data.dynamicCompanies && Array.isArray(data.dynamicCompanies) && data.dynamicCompanies.length > 0) {
            const chunkSize = 400;
            for (let i = 0; i < data.dynamicCompanies.length; i += chunkSize) {
                const chunk = data.dynamicCompanies.slice(i, i + chunkSize);
                const dynMap = {};
                chunk.forEach(c => {
                    if (c && c.id) dynMap[c.id] = c;
                });
                await fetch(`${FIREBASE_DB_URL}/dynamic_companies.json`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dynMap),
                    signal
                });
            }
        }

        const promises = [];
        if (data.calls && Array.isArray(data.calls) && data.calls.length > 0) {
            const callsMap = {};
            data.calls.forEach(c => {
                if (c && c.id) callsMap[String(c.id)] = c;
            });
            if (Object.keys(callsMap).length > 0) {
                promises.push(
                    fetch(`${FIREBASE_DB_URL}/calls.json`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(callsMap),
                        signal
                    })
                );
            }
        }

        if (data.deletedCalls && Array.isArray(data.deletedCalls) && data.deletedCalls.length > 0) {
            const delMap = {};
            data.deletedCalls.forEach(id => {
                if (id) {
                    const sId = String(id);
                    delMap[sId] = { deletedAt: Date.now() };
                    promises.push(
                        fetch(`${FIREBASE_DB_URL}/calls/${sId}.json`, {
                            method: 'DELETE',
                            signal
                        }).catch(() => {})
                    );
                }
            });
            promises.push(
                fetch(`${FIREBASE_DB_URL}/deleted_calls.json`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(delMap),
                    signal
                })
            );
        }

        if (data.deletedCompanies && Array.isArray(data.deletedCompanies) && data.deletedCompanies.length > 0) {
            const delCompMap = {};
            data.deletedCompanies.forEach(id => {
                if (id) {
                    const sId = String(id);
                    delCompMap[sId] = { deletedAt: Date.now() };
                    promises.push(
                        fetch(`${FIREBASE_DB_URL}/dynamic_companies/${sId}.json`, {
                            method: 'DELETE',
                            signal
                        }).catch(() => {})
                    );
                    promises.push(
                        fetch(`${FIREBASE_DB_URL}/assignments/${sId}.json`, {
                            method: 'DELETE',
                            signal
                        }).catch(() => {})
                    );
                }
            });
            promises.push(
                fetch(`${FIREBASE_DB_URL}/deleted_companies.json`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(delCompMap),
                    signal
                })
            );
        }

        if (data.users && Array.isArray(data.users) && data.users.length > 0) {
            promises.push(
                fetch(`${FIREBASE_DB_URL}/users.json`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data.users),
                    signal
                })
            );
        }

        if (data.custody && typeof data.custody === 'object' && Object.keys(data.custody).length > 0) {
            promises.push(
                fetch(`${FIREBASE_DB_URL}/custody.json`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data.custody),
                    signal
                }).catch(() => {})
            );
        }

        const now = Date.now();
        promises.push(
            fetch(`${FIREBASE_DB_URL}/metadata.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    updated_at: new Date().toISOString(),
                    sync_timestamp: now,
                    updated_by: currentClientId,
                    total_dynamic: data.dynamicCompanies ? data.dynamicCompanies.length : 0
                }),
                signal
            })
        );

        await Promise.all(promises);
        return true;
    }

    /**
     * Push dynamic companies & app state to Firebase (< 25KB total)
     * ⚡ High-Speed Multi-Path Root PATCH: 1 single atomic round-trip (< 400ms) replacing 10-30 requests
     */
    async function pushMasterData(data) {
        if (!navigator.onLine) {
            enqueueOffline(data);
            return false;
        }

        if (isPushing) {
            // Wait up to 1 second for previous push to complete
            let waited = 0;
            while (isPushing && waited < 10) {
                await new Promise(r => setTimeout(r, 100));
                waited++;
            }
        }
        isPushing = true;
        setStatus('syncing');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s timeout
        const now = Date.now();
        lastSyncTimestamp = now;

        try {
            // Build unified atomic multi-path patch object for 1 single HTTP request
            const rootPatch = {};

            // 1. Dynamic companies
            if (data.dynamicCompanies && Array.isArray(data.dynamicCompanies)) {
                data.dynamicCompanies.forEach(c => {
                    if (c && c.id) {
                        rootPatch[`dynamic_companies/${String(c.id)}`] = c;
                    }
                });
            }

            // 2. Assignments (if supplied)
            if (data.assignments && typeof data.assignments === 'object') {
                for (const [sId, item] of Object.entries(data.assignments)) {
                    if (!item) continue;
                    const isAssigned = Boolean(item.assignedTo);
                    rootPatch[`assignments/${sId}`] = {
                        assignedTo: isAssigned ? item.assignedTo : '',
                        assignedAt: isAssigned ? (item.assignedAt || new Date(now).toISOString()) : null,
                        unassignedAt: isAssigned ? null : (item.unassignedAt || now),
                        updatedAt: item.updatedAt || now
                    };
                }
            }

            // 3. Calls safely keyed
            if (data.calls && Array.isArray(data.calls)) {
                data.calls.forEach(c => {
                    if (c && c.id) {
                        rootPatch[`calls/${String(c.id)}`] = c;
                    }
                });
            }

            // 4. Deleted calls tombstones and atomic removal from calls
            if (data.deletedCalls && Array.isArray(data.deletedCalls)) {
                data.deletedCalls.forEach(id => {
                    if (id) {
                        const sId = String(id);
                        rootPatch[`deleted_calls/${sId}`] = { deletedAt: now };
                        rootPatch[`calls/${sId}`] = null;
                    }
                });
            }

            // 5. Deleted companies tombstones and atomic removal from dynamic_companies & assignments
            if (data.deletedCompanies && Array.isArray(data.deletedCompanies)) {
                data.deletedCompanies.forEach(id => {
                    if (id) {
                        const sId = String(id);
                        rootPatch[`deleted_companies/${sId}`] = { deletedAt: now };
                        rootPatch[`dynamic_companies/${sId}`] = null;
                        rootPatch[`assignments/${sId}`] = null;
                    }
                });
            }

            // 6. Users
            if (data.users && Array.isArray(data.users) && data.users.length > 0) {
                rootPatch['users'] = data.users;
            }

            // 7. Custody
            if (data.custody && typeof data.custody === 'object' && Object.keys(data.custody).length > 0) {
                rootPatch['custody'] = data.custody;
            }

            // 8. Activities (limit to latest 50 to avoid bloat)
            if (data.activities && Array.isArray(data.activities) && data.activities.length > 0) {
                rootPatch['activities'] = data.activities.slice(0, 50);
            }

            // 9. Metadata
            rootPatch['metadata/updated_at'] = new Date(now).toISOString();
            rootPatch['metadata/sync_timestamp'] = now;
            rootPatch['metadata/updated_by'] = currentClientId;
            if (data.dynamicCompanies) {
                rootPatch['metadata/total_dynamic'] = data.dynamicCompanies.length;
            }

            // ⚡ Execute Single Atomic HTTP PATCH (< 400ms)
            const resp = await fetch(`${FIREBASE_DB_URL}/.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rootPatch),
                signal: controller.signal
            });

            if (!resp.ok) {
                throw new Error(`Firebase push failed with status ${resp.status}`);
            }

            clearTimeout(timeoutId);
            setStatus('synced');
            isPushing = false;
            return true;
        } catch (err) {
            clearTimeout(timeoutId);
            console.warn('⚡ Fast root push encountered error, activating modular fallback:', err);
            try {
                const ok = await pushMasterDataModularFallback(data, controller.signal);
                setStatus('synced');
                isPushing = false;
                return ok;
            } catch (fallbackErr) {
                setStatus('local', { error: fallbackErr.message });
                isPushing = false;
                enqueueOffline(data);
                return false;
            }
        }
    }

    // ---- Offline Sync Queue ----
    function getOfflineQueue() {
        try {
            return JSON.parse(localStorage.getItem('fleetcrm_offline_queue') || '[]');
        } catch(e) { return []; }
    }

    function saveOfflineQueue(queue) {
        try {
            localStorage.setItem('fleetcrm_offline_queue', JSON.stringify(queue || []));
        } catch(e) {}
    }

    function enqueueOffline(item) {
        if (!item) return;
        const q = getOfflineQueue();
        if (q.length > 50) q.shift();
        q.push({ data: item, queuedAt: Date.now() });
        saveOfflineQueue(q);
        setStatus('offline', { queued: q.length });
    }

    async function processOfflineQueue() {
        if (!navigator.onLine) return;
        const q = getOfflineQueue();
        if (!q || q.length === 0) return;
        saveOfflineQueue([]);
        for (const item of q) {
            try {
                if (item && item.data) {
                    await pushMasterData(item.data);
                }
            } catch(e) {
                enqueueOffline(item.data);
                break;
            }
        }
        if (typeof App !== 'undefined' && App.showToast) {
            App.showToast('🟢 تمت استعادة الاتصال ومزامنة العمليات المعلقة بنجاح', 'success');
        }
    }

    window.addEventListener('online', () => {
        processOfflineQueue();
    });

    /**
     * Micro-Batch Queue Engine for High-Throughput Realtime Writes
     * Automatically coalesces bursts of individual writes (calls, company updates) into
     * single atomic HTTP root PATCH requests within 120ms, eliminating connection timeouts.
     */
    const _microBatchQueue = {
        calls: new Map(),
        companies: new Map(),
        timer: null
    };

    async function flushMicroBatch() {
        if (_microBatchQueue.timer) {
            clearTimeout(_microBatchQueue.timer);
            _microBatchQueue.timer = null;
        }

        const callsList = Array.from(_microBatchQueue.calls.values());
        const compsList = Array.from(_microBatchQueue.companies.values());
        _microBatchQueue.calls.clear();
        _microBatchQueue.companies.clear();

        if (callsList.length === 0 && compsList.length === 0) return true;

        try {
            const now = Date.now();
            lastSyncTimestamp = now;
            const rootPatch = {
                'metadata/updated_at': new Date(now).toISOString(),
                'metadata/sync_timestamp': now,
                'metadata/updated_by': currentClientId
            };

            callsList.forEach(c => {
                if (c && c.id) {
                    rootPatch[`calls/${encodeURIComponent(String(c.id))}`] = { ...c, updatedAt: now };
                }
            });

            compsList.forEach(comp => {
                if (comp && comp.id) {
                    rootPatch[`dynamic_companies/${encodeURIComponent(String(comp.id))}`] = comp;
                }
            });

            const resp = await fetch(`${FIREBASE_DB_URL}/.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rootPatch)
            });
            return resp.ok;
        } catch (e) {
            console.warn('⚡ MicroBatch flush network warning:', e.message);
            return false;
        }
    }

    function queueSingleCall(call) {
        if (!call || !call.id) return Promise.resolve(false);
        _microBatchQueue.calls.set(String(call.id), call);
        if (!_microBatchQueue.timer) {
            _microBatchQueue.timer = setTimeout(flushMicroBatch, 120);
        }
        if (_microBatchQueue.calls.size + _microBatchQueue.companies.size >= 20) {
            return flushMicroBatch();
        }
        return Promise.resolve(true);
    }

    function queueSingleCompany(company) {
        if (!company || !company.id) return Promise.resolve(false);
        _microBatchQueue.companies.set(String(company.id), company);
        if (!_microBatchQueue.timer) {
            _microBatchQueue.timer = setTimeout(flushMicroBatch, 120);
        }
        if (_microBatchQueue.calls.size + _microBatchQueue.companies.size >= 20) {
            return flushMicroBatch();
        }
        return Promise.resolve(true);
    }

    /**
     * Push a single dynamic company (Micro-batched with zero socket congestion)
     */
    async function pushSingleCompany(company, forceImmediate = false) {
        if (!company || !company.id) return false;
        if (forceImmediate) {
            try {
                const now = Date.now();
                lastSyncTimestamp = now;
                const rootPatch = {
                    [`dynamic_companies/${encodeURIComponent(String(company.id))}`]: company,
                    'metadata/updated_at': new Date(now).toISOString(),
                    'metadata/sync_timestamp': now,
                    'metadata/updated_by': currentClientId
                };
                const resp = await fetch(`${FIREBASE_DB_URL}/.json`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(rootPatch)
                });
                return resp.ok;
            } catch(e) {
                return false;
            }
        }
        return queueSingleCompany(company);
    }

    /**
     * Presence & Lead Collision Prevention
     */
    async function acquireCompanyLock(companyId, userName, userId) {
        if (!companyId || !navigator.onLine) return null;
        try {
            const payload = {
                user: userName || 'مندوب مبيعات',
                userId: String(userId || 'user'),
                time: Date.now()
            };
            await fetch(`${FIREBASE_DB_URL}/presence/${companyId}.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            return payload;
        } catch (e) {
            return null;
        }
    }

    async function releaseCompanyLock(companyId, userId) {
        if (!companyId || !navigator.onLine) return;
        try {
            await fetch(`${FIREBASE_DB_URL}/presence/${companyId}.json`, {
                method: 'DELETE'
            });
        } catch (e) {}
    }

    async function checkCompanyLock(companyId, currentUserId) {
        if (!companyId || !navigator.onLine) return { isLocked: false };
        try {
            const resp = await fetch(`${FIREBASE_DB_URL}/presence/${companyId}.json?t=${Date.now()}`);
            if (!resp.ok) return { isLocked: false };
            const data = await resp.json();
            if (!data || !data.time) return { isLocked: false };
            const ageMs = Date.now() - Number(data.time);
            // Lock active for 2.5 minutes (150,000 ms)
            if (ageMs < 150000) {
                const isOtherUser = String(data.userId || '') !== String(currentUserId || '');
                return {
                    isLocked: isOtherUser,
                    user: data.user || 'زميل آخر',
                    userId: data.userId,
                    ageSeconds: Math.round(ageMs / 1000)
                };
            }
            return { isLocked: false };
        } catch (e) {
            return { isLocked: false };
        }
    }

    async function getAllCompanyLocks() {
        if (!navigator.onLine) return {};
        try {
            const resp = await fetch(`${FIREBASE_DB_URL}/presence.json?t=${Date.now()}`);
            if (!resp.ok) return {};
            const raw = await resp.json();
            if (!raw || typeof raw !== 'object') return {};
            const now = Date.now();
            const activeLocks = {};
            for (const [compId, item] of Object.entries(raw)) {
                if (compId === 'users' || compId.startsWith('user_')) continue;
                if (item && item.time && (now - Number(item.time)) < 150000) {
                    activeLocks[compId] = {
                        ...item,
                        companyId: compId,
                        ageSeconds: Math.round((now - Number(item.time)) / 1000)
                    };
                }
            }
            return activeLocks;
        } catch (e) {
            return {};
        }
    }

    /**
     * User Account Presence (Online / Offline Real-time Heartbeat)
     */
    function formatArabicLastSeen(timestamp) {
        if (!timestamp || isNaN(Number(timestamp))) return 'لم يسجل الدخول بعد';
        const ts = Number(timestamp);
        const now = Date.now();
        const diffMs = now - ts;
        if (diffMs < 0) return 'متصل الآن';
        const diffSec = Math.round(diffMs / 1000);
        const diffMin = Math.round(diffSec / 60);
        const diffHour = Math.round(diffMin / 60);
        const diffDay = Math.round(diffHour / 24);

        if (diffSec < 75) return 'متصل الآن';
        if (diffSec < 120) return 'منذ دقيقة واحدة';
        if (diffMin === 2) return 'منذ دقيقتين';
        if (diffMin >= 3 && diffMin <= 10) return `منذ ${diffMin} دقائق`;
        if (diffMin > 10 && diffMin < 60) return `منذ ${diffMin} دقيقة`;
        if (diffHour === 1) return 'منذ ساعة واحدة';
        if (diffHour === 2) return 'منذ ساعتين';
        if (diffHour >= 3 && diffHour <= 10) return `منذ ${diffHour} ساعات`;
        if (diffHour > 10 && diffHour < 24) return `منذ ${diffHour} ساعة`;
        if (diffDay === 1) return 'أمس';
        if (diffDay === 2) return 'منذ يومين';
        if (diffDay >= 3 && diffDay <= 10) return `منذ ${diffDay} أيام`;
        
        const d = new Date(ts);
        return d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    function getPageLabelArabic(pageKey) {
        const map = {
            'dashboard': 'لوحة القيادة',
            'companies': 'دليل الشركات والأساطيل',
            'calls': 'سجل المكالمات والمتابعات',
            'reports': 'التقارير والإحصائيات',
            'team': 'متابعة إنجازات الفريق',
            'employees': 'إدارة حسابات الموظفين',
            'scraper': 'التنقيب والبيانات'
        };
        return map[pageKey] || pageKey || 'الرئيسية';
    }

    async function sendUserHeartbeat(user, pageName) {
        if (!user || !user.id || (typeof navigator !== 'undefined' && navigator.onLine === false)) return null;
        try {
            const username = user.username || (user.email ? user.email.split('@')[0] : '');
            const payload = {
                userId: String(user.id),
                username: username,
                userName: user.name || username || 'موظف',
                role: user.role || 'agent',
                avatar: user.avatar || '👨‍💼',
                color: user.color || '#3b82f6',
                lastSeen: Date.now(),
                currentPage: pageName || 'dashboard',
                status: 'online'
            };
            const safeId = encodeURIComponent(String(user.id).trim().replace(/[.$#[\]/]/g, '_'));
            const safeUsername = username ? encodeURIComponent(String(username).trim().replace(/[.$#[\]/]/g, '_')) : '';
            const bodyStr = JSON.stringify(payload);
            const headers = { 'Content-Type': 'application/json' };

            // Primary endpoint (permitted under presence node) + secondary user_presence endpoint
            const writes = [
                fetch(`${FIREBASE_DB_URL}/presence/users/${safeId}.json`, { method: 'PUT', headers, body: bodyStr }),
                fetch(`${FIREBASE_DB_URL}/user_presence/${safeId}.json`, { method: 'PUT', headers, body: bodyStr })
            ];
            if (safeUsername && safeUsername !== safeId) {
                writes.push(fetch(`${FIREBASE_DB_URL}/presence/users/${safeUsername}.json`, { method: 'PUT', headers, body: bodyStr }));
            }

            await Promise.allSettled(writes);
            return payload;
        } catch(e) {
            return null;
        }
    }

    async function setUserOffline(userId, username) {
        if (!userId || (typeof navigator !== 'undefined' && navigator.onLine === false)) return;
        try {
            const safeId = encodeURIComponent(String(userId).trim().replace(/[.$#[\]/]/g, '_'));
            const safeUsername = username ? encodeURIComponent(String(username).trim().replace(/[.$#[\]/]/g, '_')) : '';
            const body = JSON.stringify({
                status: 'offline',
                lastSeen: Date.now()
            });
            const headers = { 'Content-Type': 'application/json' };

            if (typeof fetch === 'function') {
                const calls = [
                    fetch(`${FIREBASE_DB_URL}/presence/users/${safeId}.json`, { method: 'PATCH', headers, body, keepalive: true }),
                    fetch(`${FIREBASE_DB_URL}/user_presence/${safeId}.json`, { method: 'PATCH', headers, body, keepalive: true })
                ];
                if (safeUsername && safeUsername !== safeId) {
                    calls.push(fetch(`${FIREBASE_DB_URL}/presence/users/${safeUsername}.json`, { method: 'PATCH', headers, body, keepalive: true }));
                }
                Promise.allSettled(calls).catch(() => {});
            }
        } catch(e) {}
    }

    async function getAllUsersPresence() {
        if (typeof navigator !== 'undefined' && navigator.onLine === false) return {};
        try {
            const now = Date.now();
            const safeFetch = async (path) => {
                try {
                    const resp = await fetch(`${FIREBASE_DB_URL}${path}?t=${now}`);
                    if (!resp.ok) return null;
                    return await resp.json();
                } catch(e) {
                    return null;
                }
            };

            const [p1, p2] = await Promise.allSettled([
                safeFetch('/presence/users.json'),
                safeFetch('/user_presence.json')
            ]);

            const raw1 = (p1.status === 'fulfilled' && p1.value && typeof p1.value === 'object') ? p1.value : {};
            const raw2 = (p2.status === 'fulfilled' && p2.value && typeof p2.value === 'object') ? p2.value : {};
            const combined = Object.assign({}, raw2, raw1); // raw1 takes priority

            const result = {};
            const ACTIVE_WINDOW_MS = 180000; // 3 minutes window (handles tab throttling & sleep)

            for (const [key, item] of Object.entries(combined)) {
                if (!item || !item.lastSeen) continue;
                const ageMs = now - Number(item.lastSeen);
                const isOnline = (item.status === 'online') && (ageMs < ACTIVE_WINDOW_MS);
                const processed = {
                    ...item,
                    isOnline: isOnline,
                    ageSeconds: Math.round(ageMs / 1000),
                    lastSeenArabic: formatArabicLastSeen(item.lastSeen),
                    pageLabelArabic: getPageLabelArabic(item.currentPage)
                };

                const aliasSet = new Set();
                const addKey = (k) => {
                    if (!k) return;
                    const s = String(k).trim();
                    if (!s) return;
                    aliasSet.add(s);
                    aliasSet.add(s.toLowerCase());
                    aliasSet.add(s.replace(/[.$#[\]/]/g, '_'));
                    aliasSet.add(s.replace(/_/g, '.'));
                };

                addKey(key);
                if (item.userId) addKey(item.userId);
                if (item.username) addKey(item.username);
                if (item.userName) addKey(item.userName);
                if (item.email) addKey(item.email);

                aliasSet.forEach(k => {
                    result[k] = processed;
                });
            }
            return result;
        } catch(e) {
            return {};
        }
    }

    function getUserPresence(presences, user) {
        if (!presences || !user) return null;
        if (typeof user === 'string') {
            const raw = user.trim();
            const lower = raw.toLowerCase();
            return presences[raw] ||
                   presences[lower] ||
                   presences[lower.replace(/[.$#[\]/]/g, '_')] ||
                   presences[lower.replace(/_/g, '.')] ||
                   null;
        }

        const keys = [
            user.id,
            user.id && String(user.id).toLowerCase(),
            user.id && String(user.id).replace(/[.$#[\]/]/g, '_'),
            user.username,
            user.username && String(user.username).toLowerCase(),
            user.username && String(user.username).replace(/[.$#[\]/]/g, '_'),
            user.username && String(user.username).replace(/_/g, '.'),
            user.email,
            user.email && String(user.email).toLowerCase(),
            user.email && String(user.email).split('@')[0],
            user.name,
            user.name && String(user.name).toLowerCase()
        ];

        for (const k of keys) {
            if (k && presences[k]) return presences[k];
        }
        return null;
    }

    /**
     * Real-time ultra-fast SSE & metadata-driven sync on Firebase
     * Connects persistent EventSource stream for sub-100ms push with smart polling fallback
     */
    function subscribeToChanges(onChangeCallback) {
        unsubscribe();

        let isFetchingUpdate = false;

        let deltaDebounceTimer = null;
        function scheduleDeltaCheck(force = false, delay = 500) {
            if (deltaDebounceTimer) clearTimeout(deltaDebounceTimer);
            deltaDebounceTimer = setTimeout(() => {
                checkMetadataDelta(force);
            }, delay);
        }

        async function checkMetadataDelta(forceTrigger = false) {
            if (isFetchingUpdate) return;
            try {
                const resp = await fetch(`${FIREBASE_DB_URL}/metadata.json?t=${Date.now()}`);
                if (resp.ok) {
                    const meta = await resp.json();
                    if (meta && meta.updated_by && meta.updated_by === currentClientId) {
                        return; // Ignore own push echo
                    }
                    const metaTs = Number(meta && (meta.sync_timestamp || (meta.updated_at ? new Date(meta.updated_at).getTime() : 0))) || 0;
                    if (forceTrigger || (lastSyncTimestamp > 0 && metaTs > lastSyncTimestamp)) {
                        lastSyncTimestamp = metaTs || Date.now();
                        isFetchingUpdate = true;
                        const data = await fetchMasterData();
                        isFetchingUpdate = false;
                        if (data && onChangeCallback) {
                            onChangeCallback({ data });
                        }
                    } else if (lastSyncTimestamp === 0 && metaTs > 0) {
                        lastSyncTimestamp = metaTs;
                    }
                }
            } catch(e) {
                isFetchingUpdate = false;
            }
        }

        // 1. Initial check (debounced)
        scheduleDeltaCheck(false, 1000);

        // 2. Connect native SSE Stream for sub-100ms real-time push
        try {
            if (typeof EventSource !== 'undefined') {
                sseSource = new EventSource(`${FIREBASE_DB_URL}/metadata.json`);

                sseSource.addEventListener('put', (e) => {
                    try {
                        const parsed = JSON.parse(e.data || '{}');
                        const data = (parsed && parsed.data !== undefined) ? parsed.data : parsed;
                        if (data && data.updated_by && data.updated_by === currentClientId) return;
                        const ts = Number(data && data.sync_timestamp) || 0;
                        if (lastSyncTimestamp > 0 && ts > lastSyncTimestamp) {
                            scheduleDeltaCheck(true, 300);
                        } else if (lastSyncTimestamp === 0 && ts > 0) {
                            lastSyncTimestamp = ts;
                        }
                    } catch(err) {}
                });

                sseSource.addEventListener('patch', (e) => {
                    try {
                        const parsed = JSON.parse(e.data || '{}');
                        const data = (parsed && parsed.data !== undefined) ? parsed.data : parsed;
                        if (data && data.updated_by && data.updated_by === currentClientId) return;
                        const ts = Number(data && data.sync_timestamp) || 0;
                        if (lastSyncTimestamp > 0 && ts > lastSyncTimestamp) {
                            scheduleDeltaCheck(true, 300);
                        }
                    } catch(err) {}
                });

                sseSource.onopen = () => {
                    setStatus('synced', { realTimeMode: 'SSE_LIVE' });
                };

                sseSource.onerror = () => {
                    if (sseSource) {
                        try { sseSource.close(); } catch(e) {}
                        sseSource = null;
                    }
                };
            }
        } catch(e) {
            console.warn('SSE stream init skipped, using smart polling fallback:', e);
        }

        // 3. Smart visibility-aware polling fallback (every 6s when active)
        const startPolling = () => {
            if (pollInterval) clearInterval(pollInterval);
            pollInterval = setInterval(() => {
                if (typeof document !== 'undefined' && document.hidden) return;
                checkMetadataDelta();
            }, 6000);
        };
        startPolling();

        // 4. Instant trigger on mobile tab focus or screen unlock
        if (typeof document !== 'undefined' && typeof window !== 'undefined' && !_mobileFocusBound) {
            _mobileFocusBound = true;
            const handleMobileFocus = () => {
                checkMetadataDelta();
                if (!sseSource && typeof EventSource !== 'undefined') {
                    try {
                        sseSource = new EventSource(`${FIREBASE_DB_URL}/metadata.json`);
                    } catch(e) {}
                }
                startPolling();
            };
            window.addEventListener('focus', handleMobileFocus);
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') {
                    handleMobileFocus();
                } else if (pollInterval) {
                    clearInterval(pollInterval);
                    pollInterval = null;
                }
            });
        }
    }

    function unsubscribe() {
        if (sseSource) {
            try { sseSource.close(); } catch(e) {}
            sseSource = null;
        }
        if (sseAssignments) {
            try { sseAssignments.close(); } catch(e) {}
            sseAssignments = null;
        }
        if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
        }
        if (assignPollInterval) {
            clearInterval(assignPollInterval);
            assignPollInterval = null;
        }
    }

    /**
     * Dedicated ultra-fast Real-time assignments stream (< 100ms sync across devices)
     */
    function subscribeToAssignments(onDeltaCallback) {
        if (sseAssignments) {
            try { sseAssignments.close(); } catch(e) {}
            sseAssignments = null;
        }
        if (assignPollInterval) {
            clearInterval(assignPollInterval);
            assignPollInterval = null;
        }

        // 1. Cross-tab BroadcastChannel listener (Instant 0.1ms for same browser)
        if (syncChannel) {
            syncChannel.onmessage = (event) => {
                try {
                    if (event.data && event.data.type === 'ASSIGNMENTS_DELTA') {
                        if (event.data.clientId === currentClientId) return; // ignore self
                        if (onDeltaCallback && event.data.delta) {
                            onDeltaCallback(event.data.delta, 'local_broadcast');
                        }
                    }
                } catch(e) {}
            };
        }

        // 2. Real-time Firebase RTDB SSE connection directly on /assignments.json
        try {
            if (typeof EventSource !== 'undefined') {
                sseAssignments = new EventSource(`${FIREBASE_DB_URL}/assignments.json`);

                const handleEvent = (e) => {
                    try {
                        const parsed = JSON.parse(e.data || '{}');
                        const path = parsed.path || '/';
                        const data = parsed.data;

                        if (data === undefined) return;

                        // Initial connection full snapshot — do not fire heavy UI cascades on first connect
                        if (path === '/') {
                            if (!window.__assignmentsInitialSeeded) {
                                window.__assignmentsInitialSeeded = true;
                                return;
                            }
                        }

                        const delta = {};
                        if (path === '/') {
                            if (data && typeof data === 'object') {
                                Object.assign(delta, data);
                            }
                        } else {
                            const parts = path.split('/').filter(Boolean);
                            if (parts.length === 1) {
                                const compId = parts[0];
                                delta[compId] = data || { assignedTo: '' };
                            } else if (parts.length >= 2) {
                                const compId = parts[0];
                                const prop = parts[1];
                                delta[compId] = { [prop]: data };
                            }
                        }

                        if (Object.keys(delta).length > 0 && onDeltaCallback) {
                            onDeltaCallback(delta, 'cloud_sse');
                        }
                    } catch(err) {
                        console.warn('Assignments SSE parse err:', err);
                    }
                };

                sseAssignments.addEventListener('put', handleEvent);
                sseAssignments.addEventListener('patch', handleEvent);

                sseAssignments.onerror = () => {
                    if (sseAssignments) {
                        try { sseAssignments.close(); } catch(e) {}
                        sseAssignments = null;
                    }
                    // Auto-reconnect SSE after 4s
                    setTimeout(() => {
                        if (!sseAssignments && typeof EventSource !== 'undefined') {
                            subscribeToAssignments(onDeltaCallback);
                        }
                    }, 4000);
                };
            }
        } catch(e) {
            console.warn('Assignments SSE init error:', e);
        }

        // 3. Fallback polling ONLY when SSE is inactive (15s gentle interval)
        let lastPollJson = '';
        const pollAssignments = async () => {
            if (sseAssignments && sseAssignments.readyState === EventSource.OPEN) {
                return; // SSE active, skip polling completely
            }
            try {
                const resp = await fetch(`${FIREBASE_DB_URL}/assignments.json?t=${Date.now()}`);
                if (!resp.ok) return;
                const text = await resp.text();
                if (text === lastPollJson) return; // zero changes, exit early
                lastPollJson = text;
                const parsed = JSON.parse(text || '{}');
                if (parsed && typeof parsed === 'object' && onDeltaCallback) {
                    onDeltaCallback(parsed, 'cloud_poll');
                }
            } catch(e) {}
        };

        assignPollInterval = setInterval(pollAssignments, 15000);

        // Instant poll on focus / visibility change
        if (typeof window !== 'undefined' && !_assignFocusBound) {
            _assignFocusBound = true;
            window.addEventListener('focus', pollAssignments);
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') {
                    pollAssignments();
                    if (!sseAssignments && typeof EventSource !== 'undefined') {
                        subscribeToAssignments(onDeltaCallback);
                    }
                }
            });
        }
    }

    async function wipeDynamicCompanies() {
        try {
            const now = Date.now();
            lastSyncTimestamp = now;
            const rootPatch = {
                'dynamic_companies': null,
                'metadata/updated_at': new Date(now).toISOString(),
                'metadata/sync_timestamp': now,
                'metadata/total_dynamic': 0,
                'metadata/updated_by': currentClientId
            };
            const resp = await fetch(`${FIREBASE_DB_URL}/.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rootPatch)
            });
            return resp.ok;
        } catch(e) {
            return false;
        }
    }

    async function deleteDynamicCompany(id) {
        if (!id) return false;
        try {
            const now = Date.now();
            lastSyncTimestamp = now;
            const rootPatch = {
                [`dynamic_companies/${encodeURIComponent(String(id))}`]: null,
                'metadata/updated_at': new Date(now).toISOString(),
                'metadata/sync_timestamp': now,
                'metadata/updated_by': currentClientId
            };
            const resp = await fetch(`${FIREBASE_DB_URL}/.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rootPatch)
            });
            return resp.ok;
        } catch(e) {
            return false;
        }
    }

    async function pushDynamicCompanies(companiesList) {
        if (!companiesList || !Array.isArray(companiesList) || companiesList.length === 0) return true;
        const chunkSize = 500;
        let allSuccess = true;
        for (let i = 0; i < companiesList.length; i += chunkSize) {
            const chunk = companiesList.slice(i, i + chunkSize);
            try {
                const dynMap = {};
                chunk.forEach(c => {
                    if (c && c.id) dynMap[c.id] = c;
                });
                const resp = await fetch(`${FIREBASE_DB_URL}/dynamic_companies.json`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dynMap)
                });
                if (!resp.ok) allSuccess = false;
            } catch(e) {
                console.warn('pushDynamicCompanies chunk error:', e);
                allSuccess = false;
            }
        }
        // Broadcast metadata change immediately
        try {
            const now = Date.now();
            lastSyncTimestamp = now;
            await fetch(`${FIREBASE_DB_URL}/metadata.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    updated_at: new Date().toISOString(),
                    sync_timestamp: now,
                    updated_by: currentClientId,
                    total_dynamic: companiesList.length
                })
            });
        } catch(e) {}
        return allSuccess;
    }

    async function pushUsers(users) {
        if (!users || !Array.isArray(users)) return false;
        try {
            const now = Date.now();
            lastSyncTimestamp = now;
            const rootPatch = {
                'users': users,
                'metadata/updated_at': new Date(now).toISOString(),
                'metadata/sync_timestamp': now,
                'metadata/updated_by': currentClientId
            };
            const resp = await fetch(`${FIREBASE_DB_URL}/.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rootPatch)
            });
            return resp.ok;
        } catch(e) {
            console.warn('pushUsers error:', e);
            return false;
        }
    }

    async function pushAssignments(assignmentsMap) {
        if (!assignmentsMap || typeof assignmentsMap !== 'object' || Object.keys(assignmentsMap).length === 0) return true;
        try {
            const now = Date.now();
            const normalizedMap = {};
            const rootPatch = {};

            for (const [sId, item] of Object.entries(assignmentsMap)) {
                if (!item) continue;
                const isAssigned = Boolean(item.assignedTo);
                const normItem = {
                    assignedTo: isAssigned ? item.assignedTo : '',
                    assignedAt: isAssigned ? (item.assignedAt || new Date(now).toISOString()) : null,
                    unassignedAt: isAssigned ? null : (item.unassignedAt || now),
                    updatedAt: item.updatedAt || now
                };
                normalizedMap[sId] = normItem;
                rootPatch[`assignments/${sId}`] = normItem;

                if (!isAssigned && !sId.startsWith('eg_titan_') && !sId.startsWith('comp_base_')) {
                    rootPatch[`dynamic_companies/${sId}/assignedTo`] = '';
                    rootPatch[`dynamic_companies/${sId}/assignedAt`] = null;
                    rootPatch[`dynamic_companies/${sId}/unassignedAt`] = now;
                    rootPatch[`dynamic_companies/${sId}/updatedAt`] = now;
                }
            }

            lastSyncTimestamp = now;
            rootPatch['metadata/updated_at'] = new Date(now).toISOString();
            rootPatch['metadata/sync_timestamp'] = now;
            rootPatch['metadata/updated_by'] = currentClientId;

            // ⚡ Single atomic root patch (< 350ms vs 3 separate HTTP requests)
            const resp = await fetch(`${FIREBASE_DB_URL}/.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rootPatch)
            });

            // Instant cross-tab broadcast notification (< 1ms)
            if (syncChannel) {
                try {
                    syncChannel.postMessage({
                        type: 'ASSIGNMENTS_DELTA',
                        clientId: currentClientId,
                        delta: normalizedMap
                    });
                } catch(e) {}
            }

            return resp.ok;
        } catch(e) {
            console.warn('pushAssignments error:', e);
            return false;
        }
    }

    async function setAssignment(companyId, assignedTo, assignedAt, timestamp) {
        if (!companyId) return false;
        const sId = String(companyId);
        const now = timestamp || Date.now();
        const payload = {
            assignedTo: assignedTo || '',
            assignedAt: assignedTo ? (assignedAt || new Date(now).toISOString()) : null,
            unassignedAt: assignedTo ? null : now,
            updatedAt: now
        };
        try {
            const rootPatch = {
                [`assignments/${sId}`]: payload,
                'metadata/updated_at': new Date(now).toISOString(),
                'metadata/sync_timestamp': now,
                'metadata/updated_by': currentClientId
            };

            // Only patch dynamic_companies if this is a genuine custom/scraped company, NOT a titan or base company
            if (!sId.startsWith('eg_titan_') && !sId.startsWith('comp_base_')) {
                rootPatch[`dynamic_companies/${sId}/assignedTo`] = assignedTo || '';
                rootPatch[`dynamic_companies/${sId}/assignedAt`] = assignedTo ? (assignedAt || null) : null;
                rootPatch[`dynamic_companies/${sId}/unassignedAt`] = assignedTo ? null : now;
                rootPatch[`dynamic_companies/${sId}/updatedAt`] = now;
            }

            // ⚡ Single atomic root patch
            const resp = await fetch(`${FIREBASE_DB_URL}/.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rootPatch)
            });

            // Instant cross-tab broadcast notification (< 1ms)
            if (syncChannel) {
                try {
                    syncChannel.postMessage({
                        type: 'ASSIGNMENTS_DELTA',
                        clientId: currentClientId,
                        delta: { [sId]: payload }
                    });
                } catch(e) {}
            }

            lastSyncTimestamp = now;
            return resp.ok;
        } catch(e) {
            console.warn('setAssignment error:', e);
            return false;
        }
    }

    async function pushDeletedCall(id) {
        if (!id) return false;
        const sId = String(id);
        try {
            const now = Date.now();
            lastSyncTimestamp = now;
            // ⚡ Single atomic root patch: deletes call & marks tombstone & updates metadata in 1 request
            const rootPatch = {
                [`deleted_calls/${encodeURIComponent(sId)}`]: { deletedAt: now },
                [`calls/${encodeURIComponent(sId)}`]: null,
                'metadata/updated_at': new Date(now).toISOString(),
                'metadata/sync_timestamp': now,
                'metadata/updated_by': currentClientId
            };
            const resp = await fetch(`${FIREBASE_DB_URL}/.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rootPatch)
            });
            return resp.ok;
        } catch(e) {
            console.warn('pushDeletedCall error:', e);
            return false;
        }
    }

    async function pushDeletedCompany(id) {
        if (!id) return false;
        const sId = String(id);
        try {
            const now = Date.now();
            lastSyncTimestamp = now;
            // ⚡ Single atomic root patch: deletes dynamic_company & assignment & marks tombstone in 1 request
            const rootPatch = {
                [`deleted_companies/${encodeURIComponent(sId)}`]: { deletedAt: now },
                [`dynamic_companies/${encodeURIComponent(sId)}`]: null,
                [`assignments/${encodeURIComponent(sId)}`]: null,
                'metadata/updated_at': new Date(now).toISOString(),
                'metadata/sync_timestamp': now,
                'metadata/updated_by': currentClientId
            };
            const resp = await fetch(`${FIREBASE_DB_URL}/.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rootPatch)
            });
            return resp.ok;
        } catch(e) {
            console.warn('pushDeletedCompany error:', e);
            return false;
        }
    }

    async function pushDeletedCompaniesBatch(ids) {
        if (!Array.isArray(ids) || ids.length === 0) return true;
        try {
            const now = Date.now();
            lastSyncTimestamp = now;
            const rootPatch = {
                'metadata/updated_at': new Date(now).toISOString(),
                'metadata/sync_timestamp': now,
                'metadata/updated_by': currentClientId
            };
            ids.forEach(id => {
                const sId = String(id);
                rootPatch[`deleted_companies/${sId}`] = { deletedAt: now };
                rootPatch[`dynamic_companies/${sId}`] = null;
                rootPatch[`assignments/${sId}`] = null;
            });

            // ⚡ Single atomic root patch for whole batch
            const resp = await fetch(`${FIREBASE_DB_URL}/.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rootPatch)
            });
            return resp.ok;
        } catch(e) {
            console.warn('pushDeletedCompaniesBatch error:', e);
            return false;
        }
    }

    async function pushSingleCall(call, forceImmediate = false) {
        if (!call || !call.id) return false;
        if (forceImmediate) {
            const sId = String(call.id);
            try {
                const now = Date.now();
                lastSyncTimestamp = now;
                const payload = { ...call, updatedAt: now };
                const rootPatch = {
                    [`calls/${encodeURIComponent(sId)}`]: payload,
                    'metadata/updated_at': new Date(now).toISOString(),
                    'metadata/sync_timestamp': now,
                    'metadata/updated_by': currentClientId
                };
                const resp = await fetch(`${FIREBASE_DB_URL}/.json`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(rootPatch)
                });
                return resp.ok;
            } catch(e) {
                console.warn('pushSingleCall error:', e);
                return false;
            }
        }
        return queueSingleCall(call);
    }

    async function pushCustody(companyId, historyList) {
        if (!companyId || !Array.isArray(historyList)) return true;
        try {
            const resp = await fetch(`${FIREBASE_DB_URL}/custody/${encodeURIComponent(companyId)}.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(historyList)
            });
            return resp.ok;
        } catch(e) {
            console.warn('pushCustody error:', e);
            return false;
        }
    }

    async function pushCustodyBatch(batchMap) {
        if (!batchMap || typeof batchMap !== 'object' || Object.keys(batchMap).length === 0) return true;
        try {
            const resp = await fetch(`${FIREBASE_DB_URL}/custody.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(batchMap)
            });
            return resp.ok;
        } catch(e) {
            console.warn('pushCustodyBatch error:', e);
            return false;
        }
    }

    return {
        getStatus,
        onStatusChange,
        fetchMasterData,
        pushMasterData,
        pushSingleCompany,
        pushDynamicCompanies,
        pushUsers,
        pushAssignments,
        setAssignment,
        pushCustody,
        pushCustodyBatch,
        pushDeletedCall,
        pushDeletedCompany,
        pushDeletedCompaniesBatch,
        pushSingleCall,
        deleteDynamicCompany,
        wipeDynamicCompanies,
        subscribeToChanges,
        subscribeToAssignments,
        unsubscribe,
        acquireCompanyLock,
        releaseCompanyLock,
        checkCompanyLock,
        getAllCompanyLocks,
        sendUserHeartbeat,
        setUserOffline,
        getAllUsersPresence,
        getUserPresence,
        formatArabicLastSeen,
        getPageLabelArabic,
        flushMicroBatch
    };
})();
window.FirebaseClient = window.SupabaseClient; // Clean modern alias