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
        const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

        try {
            const [dynResp, callsResp, usersResp, actsResp] = await Promise.all([
                fetch(`${FIREBASE_DB_URL}/dynamic_companies.json?t=${Date.now()}`, { signal: controller.signal }),
                fetch(`${FIREBASE_DB_URL}/calls.json?t=${Date.now()}`, { signal: controller.signal }),
                fetch(`${FIREBASE_DB_URL}/users.json?t=${Date.now()}`, { signal: controller.signal }),
                fetch(`${FIREBASE_DB_URL}/activities.json?t=${Date.now()}`, { signal: controller.signal })
            ]);
            clearTimeout(timeoutId);

            const dynamicCompaniesObj = dynResp.ok ? await dynResp.json() : {};
            const calls = callsResp.ok ? await callsResp.json() : [];
            const users = usersResp.ok ? await usersResp.json() : [];
            const activities = actsResp.ok ? await actsResp.json() : [];

            let dynamicCompanies = [];
            if (dynamicCompaniesObj && typeof dynamicCompaniesObj === 'object') {
                if (Array.isArray(dynamicCompaniesObj)) {
                    dynamicCompanies = dynamicCompaniesObj.filter(Boolean);
                } else {
                    dynamicCompanies = Object.values(dynamicCompaniesObj).filter(Boolean);
                }
            }

            setStatus('synced', { dynamicCount: dynamicCompanies.length });

            return {
                dynamicCompanies: dynamicCompanies,
                calls: Array.isArray(calls) ? calls : (calls ? Object.values(calls) : []),
                users: Array.isArray(users) ? users : (users ? Object.values(users) : []),
                activities: Array.isArray(activities) ? activities : (activities ? Object.values(activities) : []),
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
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        try {
            const promises = [];

            // 1. Sync dynamic companies (additive merge via PATCH)
            if (data.dynamicCompanies && Array.isArray(data.dynamicCompanies) && data.dynamicCompanies.length > 0) {
                const dynMap = {};
                data.dynamicCompanies.forEach(c => {
                    if (c && c.id) dynMap[c.id] = c;
                });
                promises.push(
                    fetch(`${FIREBASE_DB_URL}/dynamic_companies.json`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(dynMap),
                        signal: controller.signal
                    })
                );
            }

            // 2. Sync calls
            if (data.calls && Array.isArray(data.calls)) {
                promises.push(
                    fetch(`${FIREBASE_DB_URL}/calls.json`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data.calls),
                        signal: controller.signal
                    })
                );
            }


            // 4. Sync users
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

            // 5. Sync metadata
            promises.push(
                fetch(`${FIREBASE_DB_URL}/metadata.json`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        updated_at: new Date().toISOString(),
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
            return false;
        }
    }

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

    /**
     * Real-time SSE subscription on Firebase
     */
    function subscribeToChanges(onChangeCallback) {
        unsubscribe();

        try {
            if (typeof EventSource !== 'undefined') {
                sseSource = new EventSource(`${FIREBASE_DB_URL}/.json`);

                sseSource.addEventListener('put', (e) => {
                    try {
                        const parsed = JSON.parse(e.data);
                        if (parsed && onChangeCallback) {
                            onChangeCallback(parsed);
                        }
                    } catch(err) {}
                });

                sseSource.addEventListener('patch', (e) => {
                    try {
                        const parsed = JSON.parse(e.data);
                        if (parsed && onChangeCallback) {
                            onChangeCallback(parsed);
                        }
                    } catch(err) {}
                });

                sseSource.onerror = () => {
                    startPolling();
                };
            }
        } catch(e) {
            startPolling();
        }

        // Background polling fallback every 8 seconds
        startPolling();

        function startPolling() {
            if (pollInterval) clearInterval(pollInterval);
            pollInterval = setInterval(async () => {
                if (onChangeCallback) {
                    const data = await fetchMasterData();
                    if (data) onChangeCallback({ data });
                }
            }, 8000);
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
        return allSuccess;
    }

    return {
        getStatus,
        onStatusChange,
        fetchMasterData,
        pushMasterData,
        pushSingleCompany,
        pushDynamicCompanies,
        deleteDynamicCompany,
        wipeDynamicCompanies,
        subscribeToChanges,
        unsubscribe
    };
})();