/**
 * Fleet CRM - Cloud Synchronization Engine (Firebase Realtime Database)
 * Version: 122.0 - High Performance Modular Delta Sync Engine
 * URL: https://fleet-crm-38ba6-default-rtdb.firebaseio.com
 */

window.SupabaseClient = (function() {
    'use strict';

    const FIREBASE_DB_URL = 'https://fleet-crm-38ba6-default-rtdb.firebaseio.com';
    let currentStatus = 'local'; // 'synced' | 'syncing' | 'offline' | 'local'
    let statusCallbacks = [];
    let sseSource = null;
    let pollInterval = null;
    let isPushing = false;

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
     * Fetch all dynamic data from Firebase modular endpoints (< 30KB total)
     */
    async function fetchMasterData() {
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

            const [dynamicCompaniesObj, assignmentsObj, callsData, usersData, actsData, deletedCallsObj] = await Promise.all([
                safeFetch(`${FIREBASE_DB_URL}/dynamic_companies.json?t=${Date.now()}`, {}),
                safeFetch(`${FIREBASE_DB_URL}/assignments.json?t=${Date.now()}`, {}),
                safeFetch(`${FIREBASE_DB_URL}/calls.json?t=${Date.now()}`, []),
                safeFetch(`${FIREBASE_DB_URL}/users.json?t=${Date.now()}`, []),
                safeFetch(`${FIREBASE_DB_URL}/activities.json?t=${Date.now()}`, []),
                safeFetch(`${FIREBASE_DB_URL}/deleted_calls.json?t=${Date.now()}`, {})
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

            setStatus('synced', { dynamicCount: dynamicCompanies.length });

            return {
                dynamicCompanies: dynamicCompanies,
                assignments: (assignmentsObj && typeof assignmentsObj === 'object') ? assignmentsObj : {},
                calls: Array.isArray(callsData) ? callsData : (callsData ? Object.values(callsData) : []),
                deletedCalls: deletedCallsList,
                users: Array.isArray(usersData) ? usersData : (usersData ? Object.values(usersData) : []),
                activities: Array.isArray(actsData) ? actsData : (actsData ? Object.values(actsData) : []),
                updated_at: new Date().toISOString()
            };
        } catch (err) {
            clearTimeout(timeoutId);
            setStatus('local', { error: err.message });
            return null;
        }
    }

    /**
     * Push dynamic companies & app state to Firebase (< 20KB total)
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

        try {
            // 1. Sync dynamic companies in fast 400-item chunks
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
                        signal: controller.signal
                    });
                }
            }

            const promises = [];

            // 2. Sync calls safely via PATCH with keyed call IDs to prevent overwriting other reps' calls
            if (data.calls && Array.isArray(data.calls) && data.calls.length > 0) {
                const callsMap = {};
                data.calls.forEach(c => {
                    if (c && c.id) {
                        callsMap[String(c.id)] = c;
                    }
                });
                if (Object.keys(callsMap).length > 0) {
                    promises.push(
                        fetch(`${FIREBASE_DB_URL}/calls.json`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(callsMap),
                            signal: controller.signal
                        })
                    );
                }
            }

            // 2.1 Sync deleted call tombstones and remove key from Firebase
            if (data.deletedCalls && Array.isArray(data.deletedCalls) && data.deletedCalls.length > 0) {
                const delMap = {};
                data.deletedCalls.forEach(id => {
                    if (id) {
                        const sId = String(id);
                        delMap[sId] = { deletedAt: Date.now() };
                        // Direct atomic removal from cloud calls node
                        promises.push(
                            fetch(`${FIREBASE_DB_URL}/calls/${sId}.json`, {
                                method: 'DELETE',
                                signal: controller.signal
                            }).catch(() => {})
                        );
                    }
                });
                promises.push(
                    fetch(`${FIREBASE_DB_URL}/deleted_calls.json`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(delMap),
                        signal: controller.signal
                    })
                );
            }

            // 3. Sync users
            if (data.users && Array.isArray(data.users) && data.users.length > 0) {
                promises.push(
                    fetch(`${FIREBASE_DB_URL}/users.json`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data.users),
                        signal: controller.signal
                    })
                );
            }

            // 4. Sync metadata with sync_timestamp
            const now = Date.now();
            lastSyncTimestamp = now;
            promises.push(
                fetch(`${FIREBASE_DB_URL}/metadata.json`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        updated_at: new Date().toISOString(),
                        sync_timestamp: now,
                        updated_by: 'client_v122',
                        total_dynamic: data.dynamicCompanies ? data.dynamicCompanies.length : 0
                    }),
                    signal: controller.signal
                })
            );

            await Promise.all(promises);
            clearTimeout(timeoutId);
            setStatus('synced');
            isPushing = false;
            return true;
        } catch (err) {
            clearTimeout(timeoutId);
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
     * Push a single dynamic company in < 50ms
     */
    async function pushSingleCompany(company) {
        if (!company || !company.id) return false;
        try {
            const resp = await fetch(`${FIREBASE_DB_URL}/dynamic_companies/${company.id}.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(company)
            });
            return resp.ok;
        } catch(e) {
            return false;
        }
    }

    let lastSyncTimestamp = 0;

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

    /**
     * Real-time ultra-fast SSE & metadata-driven sync on Firebase
     * Connects persistent EventSource stream for sub-100ms push with smart polling fallback
     */
    function subscribeToChanges(onChangeCallback) {
        unsubscribe();

        let isFetchingUpdate = false;

        async function checkMetadataDelta(forceTrigger = false) {
            if (isFetchingUpdate) return;
            try {
                const resp = await fetch(`${FIREBASE_DB_URL}/metadata.json?t=${Date.now()}`);
                if (resp.ok) {
                    const meta = await resp.json();
                    const metaTs = Number(meta && (meta.sync_timestamp || (meta.updated_at ? new Date(meta.updated_at).getTime() : 0))) || 0;
                    if (forceTrigger || metaTs > lastSyncTimestamp || (meta && meta.total_dynamic && lastSyncTimestamp === 0)) {
                        lastSyncTimestamp = metaTs || Date.now();
                        isFetchingUpdate = true;
                        const data = await fetchMasterData();
                        isFetchingUpdate = false;
                        if (data && onChangeCallback) {
                            onChangeCallback({ data });
                        }
                    }
                }
            } catch(e) {
                isFetchingUpdate = false;
            }
        }

        // 1. Instant check immediately on subscribe
        checkMetadataDelta();

        // 2. Connect native SSE Stream for sub-100ms real-time push!
        try {
            if (typeof EventSource !== 'undefined') {
                sseSource = new EventSource(`${FIREBASE_DB_URL}/metadata.json`);

                sseSource.addEventListener('put', (e) => {
                    try {
                        const parsed = JSON.parse(e.data || '{}');
                        const data = (parsed && parsed.data !== undefined) ? parsed.data : parsed;
                        const ts = Number(data && data.sync_timestamp) || 0;
                        if (ts > lastSyncTimestamp) {
                            checkMetadataDelta(true);
                        }
                    } catch(err) {}
                });

                sseSource.addEventListener('patch', (e) => {
                    try {
                        const parsed = JSON.parse(e.data || '{}');
                        const data = (parsed && parsed.data !== undefined) ? parsed.data : parsed;
                        const ts = Number(data && data.sync_timestamp) || 0;
                        if (ts > lastSyncTimestamp) {
                            checkMetadataDelta(true);
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
        if (typeof document !== 'undefined' && typeof window !== 'undefined') {
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

    async function wipeDynamicCompanies() {
        try {
            await fetch(`${FIREBASE_DB_URL}/dynamic_companies.json`, { method: 'DELETE' });
            await fetch(`${FIREBASE_DB_URL}/metadata.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updated_at: new Date().toISOString(), sync_timestamp: Date.now(), total_dynamic: 0 })
            });
            return true;
        } catch(e) {
            return false;
        }
    }

    async function deleteDynamicCompany(id) {
        if (!id) return false;
        try {
            await fetch(`${FIREBASE_DB_URL}/dynamic_companies/${id}.json`, { method: 'DELETE' });
            return true;
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
                    total_dynamic: companiesList.length
                })
            });
        } catch(e) {}
        return allSuccess;
    }

    async function pushUsers(users) {
        if (!users || !Array.isArray(users)) return false;
        try {
            const resp = await fetch(`${FIREBASE_DB_URL}/users.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(users)
            });
            try {
                const now = Date.now();
                lastSyncTimestamp = now;
                await fetch(`${FIREBASE_DB_URL}/metadata.json`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        updated_at: new Date().toISOString(),
                        sync_timestamp: now
                    })
                });
            } catch(e) {}
            return resp.ok;
        } catch(e) {
            console.warn('pushUsers error:', e);
            return false;
        }
    }

    async function pushAssignments(assignmentsMap) {
        if (!assignmentsMap || typeof assignmentsMap !== 'object' || Object.keys(assignmentsMap).length === 0) return true;
        try {
            const resp = await fetch(`${FIREBASE_DB_URL}/assignments.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(assignmentsMap)
            });
            try {
                const now = Date.now();
                lastSyncTimestamp = now;
                await fetch(`${FIREBASE_DB_URL}/metadata.json`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        updated_at: new Date().toISOString(),
                        sync_timestamp: now
                    })
                });
            } catch(e) {}
            return resp.ok;
        } catch(e) {
            console.warn('pushAssignments error:', e);
            return false;
        }
    }

    async function pushDeletedCall(id) {
        if (!id) return false;
        try {
            const resp = await fetch(`${FIREBASE_DB_URL}/deleted_calls/${id}.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deletedAt: Date.now() })
            });
            try {
                const now = Date.now();
                lastSyncTimestamp = now;
                await fetch(`${FIREBASE_DB_URL}/metadata.json`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        updated_at: new Date().toISOString(),
                        sync_timestamp: now
                    })
                });
            } catch(e) {}
            return resp.ok;
        } catch(e) {
            console.warn('pushDeletedCall error:', e);
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
        pushDeletedCall,
        deleteDynamicCompany,
        wipeDynamicCompanies,
        subscribeToChanges,
        unsubscribe,
        acquireCompanyLock,
        releaseCompanyLock,
        checkCompanyLock
    };
})();