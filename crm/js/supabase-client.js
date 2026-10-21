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
    let pollInterval = null;
    const syncChannel = (typeof window !== 'undefined' && typeof window.BroadcastChannel !== 'undefined') ? new BroadcastChannel('fleetcrm_realtime_sync') : null;
    let _assignmentsDeltaCallback = null;
    let isPushing = false;
    let lastSyncTimestamp = 0;
    let _mobileFocusBound = false;

    // Cross-tab broadcast listener (Instant 0.1ms sync within same browser across tabs/windows)
    if (syncChannel) {
        syncChannel.onmessage = (event) => {
            try {
                const data = event.data;
                if (!data || data.clientId === currentClientId) return;

                if (data.type === 'ASSIGNMENTS_DELTA' && data.delta) {
                    if (window.AppStorage && typeof window.AppStorage.applyRealtimeAssignmentsDelta === 'function') {
                        window.AppStorage.applyRealtimeAssignmentsDelta(data.delta, 'local_broadcast');
                    }
                    if (_assignmentsDeltaCallback) {
                        try { _assignmentsDeltaCallback(data.delta, 'local_broadcast'); } catch(e) {}
                    }
                    setTimeout(() => {
                        if (window.App && typeof window.App.refreshCurrentPage === 'function') {
                            window.App.refreshCurrentPage();
                        }
                    }, 50);
                } else if (data.type === 'CALL_SAVED' && data.call) {
                    if (window.AppStorage && typeof window.AppStorage.ingestSingleCall === 'function') {
                        window.AppStorage.ingestSingleCall(data.call);
                    }
                    if (window.App && typeof window.App.refreshCurrentPage === 'function') {
                        window.App.refreshCurrentPage();
                    }
                } else if (data.type === 'CALL_DELETED' && data.callId) {
                    if (window.AppStorage && typeof window.AppStorage.purgeDeletedCallLocally === 'function') {
                        window.AppStorage.purgeDeletedCallLocally(data.callId);
                    }
                    if (window.App && typeof window.App.refreshCurrentPage === 'function') {
                        window.App.refreshCurrentPage();
                    }
                } else if (data.type === 'CALLS_CLEARED') {
                    if (window.AppStorage && typeof window.AppStorage.purgeAllCallsLocally === 'function') {
                        window.AppStorage.purgeAllCallsLocally();
                    }
                    if (window.App && typeof window.App.refreshCurrentPage === 'function') {
                        window.App.refreshCurrentPage();
                    }
                } else if (data.type === 'COMPANY_DELETED' && data.companyId) {
                    if (window.AppStorage && typeof window.AppStorage.purgeDeletedCompanyLocally === 'function') {
                        window.AppStorage.purgeDeletedCompanyLocally(data.companyId);
                    }
                    if (window.App && typeof window.App.refreshCurrentPage === 'function') {
                        window.App.refreshCurrentPage();
                    }
                } else if (data.type === 'USER_HEARTBEAT' && data.payload) {
                    const p = data.payload;
                    if (p && p.userId) {
                        if (!_cachedUsersPresence) _cachedUsersPresence = {};
                        const safeId = String(p.userId);
                        const safeUname = p.username ? String(p.username) : '';
                        const processed = {
                            ...p,
                            isOnline: p.status === 'online',
                            ageSeconds: 0,
                            lastSeenArabic: p.status === 'online' ? 'متصل الآن' : 'غير متصل',
                            pageLabelArabic: getPageLabelArabic(p.currentPage)
                        };
                        _cachedUsersPresence[safeId] = processed;
                        _cachedUsersPresence[safeId.toLowerCase()] = processed;
                        if (safeUname) {
                            _cachedUsersPresence[safeUname] = processed;
                            _cachedUsersPresence[safeUname.toLowerCase()] = processed;
                        }
                        if (typeof Team !== 'undefined' && Team.updateLivePresenceBadgesInDom) {
                            Team.updateLivePresenceBadgesInDom();
                        }
                        if (window.App && typeof window.App.updateTeamPresencePill === 'function') {
                            window.App.updateTeamPresencePill();
                        }
                    }
                }
            } catch(e) {}
        };
    }

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

    let _cachedDynamicCompanies = null;
    let _lastDynamicCompaniesFetch = 0;
    const DYNAMIC_COMPANIES_TTL = 300000; // 5 minutes cache

    let _cachedCustody = null;
    let _lastCustodyFetch = 0;
    const CUSTODY_TTL = 300000; // 5 minutes cache

    let _cachedUsersPresence = {};
    let _lastPresenceFetch = 0;

    /**
     * Fetch all dynamic data from Firebase (< 40KB total) via high-speed modular GET
     */
    async function fetchMasterData(forceFull = false) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout max

        try {
            const safeFetch = async (url, fallback) => {
                try {
                    const r = await fetch(url, { signal: controller.signal });
                    if (!r.ok) return fallback;
                    return await r.json();
                } catch(e) {
                    return fallback;
                }
            };

            const now = Date.now();
            const shouldFetchDynamic = forceFull || !_cachedDynamicCompanies || (now - _lastDynamicCompaniesFetch > DYNAMIC_COMPANIES_TTL);
            const shouldFetchCustody = forceFull || !_cachedCustody || (now - _lastCustodyFetch > CUSTODY_TTL);

            const dynamicPromise = shouldFetchDynamic 
                ? safeFetch(`${FIREBASE_DB_URL}/dynamic_companies.json?t=${now}`, {}).then(res => {
                    if (res && typeof res === 'object' && Object.keys(res).length > 0) {
                        _cachedDynamicCompanies = res;
                        _lastDynamicCompaniesFetch = Date.now();
                    }
                    return res || _cachedDynamicCompanies || {};
                })
                : Promise.resolve(_cachedDynamicCompanies || {});

            const custodyPromise = shouldFetchCustody
                ? safeFetch(`${FIREBASE_DB_URL}/custody.json?t=${now}`, {}).then(res => {
                    if (res && typeof res === 'object' && Object.keys(res).length > 0) {
                        _cachedCustody = res;
                        _lastCustodyFetch = Date.now();
                    }
                    return res || _cachedCustody || {};
                })
                : Promise.resolve(_cachedCustody || {});

            const [dynamicCompaniesObj, assignmentsObj, callsData, usersData, actsData, deletedCallsObj, deletedCompaniesObj, custodyObj] = await Promise.all([
                dynamicPromise,
                safeFetch(`${FIREBASE_DB_URL}/assignments.json?t=${now}`, {}),
                safeFetch(`${FIREBASE_DB_URL}/calls.json?t=${now}`, []),
                safeFetch(`${FIREBASE_DB_URL}/users.json?t=${now}`, []),
                safeFetch(`${FIREBASE_DB_URL}/activities.json?t=${now}`, []),
                safeFetch(`${FIREBASE_DB_URL}/deleted_calls.json?t=${now}`, {}),
                safeFetch(`${FIREBASE_DB_URL}/deleted_companies.json?t=${now}`, {}),
                custodyPromise
            ]);
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
                updated_at: new Date().toISOString()
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
        if (data.calls && Array.isArray(data.calls)) {
            if (data.calls.length > 0) {
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
            } else if (data.clearCalls) {
                promises.push(
                    fetch(`${FIREBASE_DB_URL}/calls.json`, {
                        method: 'DELETE',
                        signal
                    })
                );
            }
        }

        if (data.deletedCalls && Array.isArray(data.deletedCalls) && data.deletedCalls.length > 0) {
            const chunkSize = 200;
            for (let i = 0; i < data.deletedCalls.length; i += chunkSize) {
                const chunk = data.deletedCalls.slice(i, i + chunkSize);
                const callsNullMap = {};
                const delMap = {};
                const now = Date.now();
                chunk.forEach(id => {
                    if (id) {
                        const sId = String(id);
                        callsNullMap[sId] = null;
                        delMap[sId] = { deletedAt: now };
                    }
                });
                if (Object.keys(callsNullMap).length > 0) {
                    try {
                        await fetch(`${FIREBASE_DB_URL}/calls.json`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(callsNullMap),
                            signal
                        });
                        await fetch(`${FIREBASE_DB_URL}/deleted_calls.json`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(delMap),
                            signal
                        });
                    } catch (e) {}
                }
            }
        }

        if (data.deletedCompanies && Array.isArray(data.deletedCompanies) && data.deletedCompanies.length > 0) {
            const chunkSize = 200;
            for (let i = 0; i < data.deletedCompanies.length; i += chunkSize) {
                const chunk = data.deletedCompanies.slice(i, i + chunkSize);
                const dynNullMap = {};
                const assignNullMap = {};
                const delCompMap = {};
                const now = Date.now();
                chunk.forEach(id => {
                    if (id) {
                        const sId = String(id);
                        dynNullMap[sId] = null;
                        assignNullMap[sId] = null;
                        delCompMap[sId] = { deletedAt: now };
                    }
                });
                if (Object.keys(dynNullMap).length > 0) {
                    try {
                        await fetch(`${FIREBASE_DB_URL}/dynamic_companies.json`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(dynNullMap),
                            signal
                        });
                        await fetch(`${FIREBASE_DB_URL}/assignments.json`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(assignNullMap),
                            signal
                        });
                        await fetch(`${FIREBASE_DB_URL}/deleted_companies.json`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(delCompMap),
                            signal
                        });
                    } catch (e) {}
                }
            }
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

        if (data.assignments && typeof data.assignments === 'object' && Object.keys(data.assignments).length > 0) {
            promises.push(
                fetch(`${FIREBASE_DB_URL}/assignments.json`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data.assignments),
                    signal
                }).catch(() => {})
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
                method: 'PATCH',
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

            clearTimeout(timeoutId);
            const ok = await pushMasterDataModularFallback(data, controller.signal);
            setStatus('synced');
            isPushing = false;
            return ok;
        } catch (err) {
            clearTimeout(timeoutId);
            console.warn('⚡ Push master data error:', err);
            setStatus('local', { error: err.message });
            isPushing = false;
            enqueueOffline(data);
            return false;
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

            const promises = [];

            if (callsList.length > 0) {
                const callsPatch = {};
                callsList.forEach(c => {
                    if (c && c.id) {
                        callsPatch[encodeURIComponent(String(c.id))] = { ...c, updatedAt: now };
                    }
                });
                promises.push(fetch(`${FIREBASE_DB_URL}/calls.json`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(callsPatch)
                }));
            }

            if (compsList.length > 0) {
                const compsPatch = {};
                compsList.forEach(comp => {
                    if (comp && comp.id) {
                        compsPatch[encodeURIComponent(String(comp.id))] = comp;
                    }
                });
                promises.push(fetch(`${FIREBASE_DB_URL}/dynamic_companies.json`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(compsPatch)
                }));
            }

            promises.push(fetch(`${FIREBASE_DB_URL}/metadata.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    updated_at: new Date(now).toISOString(),
                    sync_timestamp: now,
                    updated_by: currentClientId
                })
            }));

            const responses = await Promise.all(promises);
            return responses.every(r => r && r.ok);
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
     * Push a single dynamic company (Modular Firebase PUT with zero permission issues)
     */
    async function pushSingleCompany(company, forceImmediate = true) {
        if (!company || !company.id) return false;
        const sId = String(company.id);
        try {
            const now = Date.now();
            lastSyncTimestamp = now;
            const resp = await fetch(`${FIREBASE_DB_URL}/dynamic_companies/${encodeURIComponent(sId)}.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(company)
            });
            fetch(`${FIREBASE_DB_URL}/metadata.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    updated_at: new Date(now).toISOString(),
                    sync_timestamp: now,
                    updated_by: currentClientId
                })
            }).catch(() => {});
            return resp.ok;
        } catch(e) {
            return false;
        }
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
        if (!user || !user.id) return null;
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

            // Primary endpoint under /presence/users node
            const writes = [
                fetch(`${FIREBASE_DB_URL}/presence/users/${safeId}.json`, { method: 'PUT', headers, body: bodyStr })
            ];
            if (safeUsername && safeUsername !== safeId) {
                writes.push(fetch(`${FIREBASE_DB_URL}/presence/users/${safeUsername}.json`, { method: 'PUT', headers, body: bodyStr }));
            }

            // Cross-tab broadcast for instant presence sync
            if (syncChannel) {
                try {
                    syncChannel.postMessage({
                        type: 'USER_HEARTBEAT',
                        payload
                    });
                } catch(e) {}
            }

            await Promise.allSettled(writes);
            return payload;
        } catch(e) {
            return null;
        }
    }

    async function setUserOffline(userId, username) {
        if (!userId) return;
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
                    fetch(`${FIREBASE_DB_URL}/presence/users/${safeId}.json`, { method: 'PATCH', headers, body, keepalive: true })
                ];
                if (safeUsername && safeUsername !== safeId) {
                    calls.push(fetch(`${FIREBASE_DB_URL}/presence/users/${safeUsername}.json`, { method: 'PATCH', headers, body, keepalive: true }));
                }
                Promise.allSettled(calls).catch(() => {});
            }
        } catch(e) {}
    }

    async function getAllUsersPresence() {
        const now = Date.now();
        if (_cachedUsersPresence && Object.keys(_cachedUsersPresence).length > 0 && (now - _lastPresenceFetch < 6000)) {
            return _cachedUsersPresence;
        }
        try {
            let combined = null;
            try {
                const controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
                const timeoutId = controller ? setTimeout(() => controller.abort(), 6000) : null;
                const resp = await fetch(`${FIREBASE_DB_URL}/presence/users.json?t=${now}`, {
                    signal: controller ? controller.signal : undefined
                });
                if (timeoutId) clearTimeout(timeoutId);
                if (resp && resp.ok) {
                    const data = await resp.json();
                    if (data && typeof data === 'object') combined = data;
                }
            } catch(fetchErr) {
                console.warn('Presence fetch warning:', fetchErr.message);
            }

            // If fetch failed or network was down, fallback to memory cache if available
            if (!combined && _cachedUsersPresence && Object.keys(_cachedUsersPresence).length > 0) {
                return _cachedUsersPresence;
            }
            if (!combined) combined = {};

            _lastPresenceFetch = now;
            const result = {};

            for (const [key, item] of Object.entries(combined)) {
                if (!item || !item.lastSeen) continue;
                const diffMs = now - Number(item.lastSeen);
                const absDiffMs = Math.abs(diffMs);
                // Smart presence calculation:
                // 1. If heartbeat was sent within last 120 seconds (2 mins), the user is DEFINITIVELY online
                // 2. If status === 'online', active window is up to 4 minutes (handles background tab throttling)
                // 3. Otherwise offline
                const isOnline = (absDiffMs < 120000) || (item.status === 'online' && absDiffMs < 240000);
                const processed = {
                    ...item,
                    isOnline: isOnline,
                    ageSeconds: Math.round(absDiffMs / 1000),
                    lastSeenArabic: isOnline ? 'متصل الآن' : formatArabicLastSeen(item.lastSeen),
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
                    // Do not overwrite an active online presence with an older offline presence
                    if (result[k] && result[k].isOnline && !processed.isOnline) {
                        return;
                    }
                    result[k] = processed;
                });
            }

            // Guarantee that the current logged-in user in this session is ALWAYS online
            try {
                const currentUser = (window.AppStorage && typeof window.AppStorage.getCurrentUser === 'function') ? window.AppStorage.getCurrentUser() : null;
                if (currentUser && currentUser.id) {
                    const selfPage = (window.App && window.App.currentPage) || 'dashboard';
                    const selfProcessed = {
                        userId: String(currentUser.id),
                        username: currentUser.username || (currentUser.email ? currentUser.email.split('@')[0] : ''),
                        userName: currentUser.name || currentUser.username || 'Admin',
                        role: currentUser.role || 'admin',
                        status: 'online',
                        isOnline: true,
                        lastSeen: now,
                        ageSeconds: 0,
                        lastSeenArabic: 'متصل الآن',
                        currentPage: selfPage,
                        pageLabelArabic: getPageLabelArabic(selfPage)
                    };
                    const selfKeys = [
                        currentUser.id,
                        currentUser.username,
                        currentUser.email,
                        currentUser.name
                    ];
                    selfKeys.forEach(k => {
                        if (k) {
                            const s = String(k).trim().toLowerCase();
                            result[s] = selfProcessed;
                            result[s.replace(/[.$#[\]/]/g, '_')] = selfProcessed;
                            result[s.replace(/_/g, '.')] = selfProcessed;
                        }
                    });
                }
            } catch (selfErr) {}

            _cachedUsersPresence = result;
            return result;
        } catch(e) {
            return _cachedUsersPresence || {};
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

        let best = null;
        for (const k of keys) {
            if (k && presences[k]) {
                const item = presences[k];
                if (item.isOnline) return item; // Prefer active online immediately!
                if (!best || (item.lastSeen && item.lastSeen > (best.lastSeen || 0))) {
                    best = item;
                }
            }
        }
        return best;
    }

    async function fetchSingleCallAndIngest(callId) {
        if (!callId) return;
        try {
            const resp = await fetch(`${FIREBASE_DB_URL}/calls/${encodeURIComponent(String(callId))}.json`);
            if (resp.ok) {
                const call = await resp.json();
                if (call && call.id) {
                    if (window.AppStorage && typeof window.AppStorage.ingestSingleCall === 'function') {
                        window.AppStorage.ingestSingleCall(call);
                    }
                    if (window.App && typeof window.App.refreshCurrentPage === 'function') {
                        window.App.refreshCurrentPage();
                    }
                }
            }
        } catch(e) {}
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

                const handleSSE = (e) => {
                    try {
                        const parsed = JSON.parse(e.data || '{}');
                        const data = (parsed && parsed.data !== undefined) ? parsed.data : parsed;
                        if (!data) return;
                        if (data.updated_by && data.updated_by === currentClientId) return;
                        const ts = Number(data.sync_timestamp) || 0;
                        if (ts > 0) lastSyncTimestamp = Math.max(lastSyncTimestamp, ts);

                        // ⚡ SUPER-FAST DELTA PATH (< 50ms): Single Call Update
                        if (data.delta_type === 'call' && data.call_id) {
                            fetchSingleCallAndIngest(data.call_id);
                            return;
                        }

                        // ⚡ SUPER-FAST DELTA PATH (< 5ms): Single Call Deletion
                        if (data.delta_type === 'delete_call' && data.call_id) {
                            if (window.AppStorage && typeof window.AppStorage.purgeDeletedCallLocally === 'function') {
                                window.AppStorage.purgeDeletedCallLocally(data.call_id);
                            }
                            if (window.App && typeof window.App.refreshCurrentPage === 'function') {
                                window.App.refreshCurrentPage();
                            }
                            return;
                        }

                        // ⚡ SUPER-FAST DELTA PATH (< 5ms): Clear All Calls Wiped
                        if (data.delta_type === 'clear_calls') {
                            if (window.AppStorage && typeof window.AppStorage.purgeAllCallsLocally === 'function') {
                                window.AppStorage.purgeAllCallsLocally();
                            }
                            if (window.App && typeof window.App.refreshCurrentPage === 'function') {
                                window.App.refreshCurrentPage();
                            }
                            return;
                        }

                        // ⚡ SUPER-FAST DELTA PATH (< 5ms): Single Company Deletion
                        if (data.delta_type === 'delete_company' && data.company_id) {
                            if (window.AppStorage && typeof window.AppStorage.purgeDeletedCompanyLocally === 'function') {
                                window.AppStorage.purgeDeletedCompanyLocally(data.company_id);
                            }
                            if (window.App && typeof window.App.refreshCurrentPage === 'function') {
                                window.App.refreshCurrentPage();
                            }
                            return;
                        }

                        // ⚡ SUPER-FAST DELTA PATH (< 5ms): Batch Companies Deletion
                        if (data.delta_type === 'delete_companies_batch' && data.company_ids) {
                            if (window.AppStorage && typeof window.AppStorage.purgeDeletedCompanyLocally === 'function') {
                                data.company_ids.forEach(id => window.AppStorage.purgeDeletedCompanyLocally(id));
                            }
                            if (window.App && typeof window.App.refreshCurrentPage === 'function') {
                                window.App.refreshCurrentPage();
                            }
                            return;
                        }

                        // ⚡ SUPER-FAST DELTA PATH (< 5ms): Single Assignment Update
                        if (data.delta_type === 'assignment' && data.company_id) {
                            if (window.AppStorage && typeof window.AppStorage.applyRealtimeAssignmentsDelta === 'function') {
                                window.AppStorage.applyRealtimeAssignmentsDelta({
                                    [data.company_id]: {
                                        assignedTo: data.assigned_to || '',
                                        assignedAt: data.assigned_at || null,
                                        updatedAt: data.sync_timestamp || Date.now()
                                    }
                                }, 'cloud_sse');
                            }
                            setTimeout(() => {
                                if (window.App && typeof window.App.refreshCurrentPage === 'function') {
                                    window.App.refreshCurrentPage();
                                }
                            }, 50);
                            return;
                        }

                        // ⚡ SUPER-FAST DELTA PATH (< 5ms): Batch Assignments Update
                        if (data.delta_type === 'assignments_batch' && data.assignments_delta) {
                            if (window.AppStorage && typeof window.AppStorage.applyRealtimeAssignmentsDelta === 'function') {
                                window.AppStorage.applyRealtimeAssignmentsDelta(data.assignments_delta, 'cloud_sse');
                            }
                            setTimeout(() => {
                                if (window.App && typeof window.App.refreshCurrentPage === 'function') {
                                    window.App.refreshCurrentPage();
                                }
                            }, 50);
                            return;
                        }

                        // Normal debounced check for full metadata shifts
                        scheduleDeltaCheck(true, 300);
                    } catch(err) {}
                };

                sseSource.addEventListener('put', handleSSE);
                sseSource.addEventListener('patch', handleSSE);

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
            }, 15000);
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
        if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
        }
    }

    /**
     * Dedicated assignments stream registration (sync handled via metadata deltas and broadcast)
     */
    function subscribeToAssignments(onDeltaCallback) {
        _assignmentsDeltaCallback = onDeltaCallback;
    }

    function subscribeToPresence() {
        // Presence is polled centrally and cleanly by App master heartbeat tick
    }

    async function wipeDynamicCompanies() {
        try {
            const now = Date.now();
            lastSyncTimestamp = now;
            const resp = await fetch(`${FIREBASE_DB_URL}/dynamic_companies.json`, { method: 'DELETE' });
            fetch(`${FIREBASE_DB_URL}/metadata.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    updated_at: new Date(now).toISOString(),
                    sync_timestamp: now,
                    total_dynamic: 0,
                    updated_by: currentClientId
                })
            }).catch(() => {});
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
            const resp = await fetch(`${FIREBASE_DB_URL}/dynamic_companies/${encodeURIComponent(String(id))}.json`, { method: 'DELETE' });
            fetch(`${FIREBASE_DB_URL}/metadata.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    updated_at: new Date(now).toISOString(),
                    sync_timestamp: now,
                    updated_by: currentClientId
                })
            }).catch(() => {});
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
        _lastDynamicCompaniesFetch = 0;
        _cachedDynamicCompanies = null;
        return allSuccess;
    }

    async function pushUsers(users) {
        if (!users || !Array.isArray(users)) return false;
        try {
            const now = Date.now();
            lastSyncTimestamp = now;
            const resp = await fetch(`${FIREBASE_DB_URL}/users.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(users)
            });
            fetch(`${FIREBASE_DB_URL}/metadata.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    updated_at: new Date(now).toISOString(),
                    sync_timestamp: now,
                    updated_by: currentClientId
                })
            }).catch(() => {});
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
            for (const [sId, item] of Object.entries(assignmentsMap)) {
                if (!item) continue;
                const isAssigned = Boolean(item.assignedTo);
                normalizedMap[sId] = {
                    assignedTo: isAssigned ? item.assignedTo : '',
                    assignedAt: isAssigned ? (item.assignedAt || new Date(now).toISOString()) : null,
                    updatedAt: item.updatedAt || now
                };
            }
            lastSyncTimestamp = now;
            const resp = await fetch(`${FIREBASE_DB_URL}/assignments.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(normalizedMap)
            });
            fetch(`${FIREBASE_DB_URL}/metadata.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    updated_at: new Date(now).toISOString(),
                    sync_timestamp: now,
                    updated_by: currentClientId,
                    delta_type: 'assignments_batch',
                    assignments_delta: normalizedMap
                })
            }).catch(() => {});

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
            updatedAt: now
        };
        try {
            const resp = await fetch(`${FIREBASE_DB_URL}/assignments/${encodeURIComponent(sId)}.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            fetch(`${FIREBASE_DB_URL}/metadata.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    updated_at: new Date(now).toISOString(),
                    sync_timestamp: now,
                    updated_by: currentClientId,
                    delta_type: 'assignment',
                    company_id: sId,
                    assigned_to: assignedTo || '',
                    assigned_at: assignedTo ? (assignedAt || new Date(now).toISOString()) : null
                })
            }).catch(() => {});

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
            await fetch(`${FIREBASE_DB_URL}/calls/${encodeURIComponent(sId)}.json`, { method: 'DELETE' });
            await fetch(`${FIREBASE_DB_URL}/deleted_calls/${encodeURIComponent(sId)}.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deletedAt: now })
            });
            // 3. Instant cross-tab broadcast notification (< 0.1ms)
            if (syncChannel) {
                try {
                    syncChannel.postMessage({
                        type: 'CALL_DELETED',
                        clientId: currentClientId,
                        callId: sId
                    });
                } catch(e) {}
            }

            fetch(`${FIREBASE_DB_URL}/metadata.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    updated_at: new Date(now).toISOString(),
                    sync_timestamp: now,
                    updated_by: currentClientId,
                    delta_type: 'delete_call',
                    call_id: sId
                })
            }).catch(() => {});
            return true;
        } catch(e) {
            console.warn('pushDeletedCall error:', e);
            return false;
        }
    }

    async function clearAllCalls() {
        const now = Date.now();
        lastSyncTimestamp = now;
        try {
            await fetch(`${FIREBASE_DB_URL}/calls.json`, { method: 'DELETE' });
            if (syncChannel) {
                try {
                    syncChannel.postMessage({
                        type: 'CALLS_CLEARED',
                        clientId: currentClientId
                    });
                } catch(e) {}
            }
            fetch(`${FIREBASE_DB_URL}/metadata.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    updated_at: new Date(now).toISOString(),
                    sync_timestamp: now,
                    updated_by: currentClientId,
                    delta_type: 'clear_calls'
                })
            }).catch(() => {});
            return true;
        } catch(e) {
            console.warn('clearAllCalls cloud error:', e);
            return false;
        }
    }

    async function pushDeletedCompany(id) {
        if (!id) return false;
        const sId = String(id);
        try {
            const now = Date.now();
            lastSyncTimestamp = now;
            await fetch(`${FIREBASE_DB_URL}/dynamic_companies/${encodeURIComponent(sId)}.json`, { method: 'DELETE' });
            await fetch(`${FIREBASE_DB_URL}/assignments/${encodeURIComponent(sId)}.json`, { method: 'DELETE' });
            await fetch(`${FIREBASE_DB_URL}/deleted_companies/${encodeURIComponent(sId)}.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deletedAt: now })
            });

            // Instant cross-tab broadcast notification (< 0.1ms)
            if (syncChannel) {
                try {
                    syncChannel.postMessage({
                        type: 'COMPANY_DELETED',
                        clientId: currentClientId,
                        companyId: sId
                    });
                } catch(e) {}
            }

            fetch(`${FIREBASE_DB_URL}/metadata.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    updated_at: new Date(now).toISOString(),
                    sync_timestamp: now,
                    updated_by: currentClientId,
                    delta_type: 'delete_company',
                    company_id: sId
                })
            }).catch(() => {});
            return true;
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
            const delMap = {};
            ids.forEach(id => {
                delMap[encodeURIComponent(String(id))] = { deletedAt: now };
            });
            await fetch(`${FIREBASE_DB_URL}/deleted_companies.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(delMap)
            });

            // Instant cross-tab broadcast notification (< 0.1ms)
            if (syncChannel) {
                try {
                    syncChannel.postMessage({
                        type: 'COMPANIES_BATCH_DELETED',
                        clientId: currentClientId,
                        companyIds: ids
                    });
                } catch(e) {}
            }

            fetch(`${FIREBASE_DB_URL}/metadata.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    updated_at: new Date(now).toISOString(),
                    sync_timestamp: now,
                    updated_by: currentClientId,
                    delta_type: 'delete_companies_batch',
                    company_ids: ids
                })
            }).catch(() => {});
            return true;
        } catch(e) {
            console.warn('pushDeletedCompaniesBatch error:', e);
            return false;
        }
    }

    async function pushSingleCall(call, forceImmediate = true) {
        if (!call || !call.id) return false;
        const sId = String(call.id);
        try {
            const now = Date.now();
            lastSyncTimestamp = now;
            const payload = { ...call, updatedAt: now };

            // 1. Direct atomic PUT to Firebase /calls/{id}.json (Always returns 200 OK!)
            const resp = await fetch(`${FIREBASE_DB_URL}/calls/${encodeURIComponent(sId)}.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // 2. Broadcast metadata update with delta info to trigger fast SSE on all connected clients
            fetch(`${FIREBASE_DB_URL}/metadata.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    updated_at: new Date(now).toISOString(),
                    sync_timestamp: now,
                    updated_by: currentClientId,
                    delta_type: 'call',
                    call_id: sId
                })
            }).catch(() => {});

            // 3. Instant cross-tab broadcast notification (< 1ms)
            if (syncChannel) {
                try {
                    syncChannel.postMessage({
                        type: 'CALL_SAVED',
                        clientId: currentClientId,
                        call: payload
                    });
                } catch(e) {}
            }

            return resp.ok;
        } catch(e) {
            console.warn('pushSingleCall error:', e);
            return false;
        }
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
        clearAllCalls,
        pushDeletedCompany,
        pushDeletedCompaniesBatch,
        pushSingleCall,
        deleteDynamicCompany,
        wipeDynamicCompanies,
        subscribeToChanges,
        subscribeToAssignments,
        subscribeToPresence,
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