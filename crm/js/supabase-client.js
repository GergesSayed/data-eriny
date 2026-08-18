/* ============================================
   Fleet CRM — Supabase Realtime Cloud Client v5.0
   ============================================ */
const SUPABASE_URL = 'https://vefitfgvdgjqipkkttry.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZml0Zmd2ZGdqcWlwa2t0dHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwNjQ0MzMsImV4cCI6MjEwMDY0MDQzM30.G4PnsfUnAI9gdNPFoSJuWKlE9VCmUXAkHOxzJb51Rrk';

window.SupabaseClient = (function() {
    let realtimeChannel = null;
    let onChangeCallback = null;
    let currentSyncStatus = 'synced'; // 'synced' | 'syncing' | 'error' | 'offline'
    let lastSyncTimestamp = null;
    const statusListeners = new Set();

    function getHeaders() {
        return {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        };
    }

    function setStatus(status, details = {}) {
        currentSyncStatus = status;
        if (status === 'synced') {
            lastSyncTimestamp = Date.now();
        }
        statusListeners.forEach(listener => {
            try { listener(status, { lastSync: lastSyncTimestamp, ...details }); } catch(e) {}
        });
    }

    function onStatusChange(listener) {
        if (typeof listener === 'function') {
            statusListeners.add(listener);
            listener(currentSyncStatus, { lastSync: lastSyncTimestamp });
        }
        return () => statusListeners.delete(listener);
    }

    async function fetchMasterData() {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout for mobile

        try {
            const resp = await fetch(`${SUPABASE_URL}/rest/v1/master_data?id=eq.1&select=*`, {
                headers: { ...getHeaders(), 'Prefer': 'return=representation' },
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!resp.ok) {
                setStatus('error', { error: `HTTP ${resp.status}` });
                return null;
            }
            const rows = await resp.json();
            const result = (rows && rows.length > 0) ? rows[0] : null;
            if (result) {
                setStatus('synced', { totalCompanies: result.companies ? result.companies.length : 0 });
            }
            return result;
        } catch (err) {
            clearTimeout(timeoutId);
            setStatus(navigator.onLine === false ? 'offline' : 'error', { error: err.message });
            return null;
        }
    }

    async function pushMasterData(data) {
        setStatus('syncing');

        const payload = {
            id: 1,
            companies: data.companies || [],
            users: data.users || [],
            calls: data.calls || [],
            deals: data.deals || [],
            activities: data.activities || [],
            updated_at: new Date().toISOString(),
            updated_by: 'client'
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout for large uploads

        try {
            const resp = await fetch(`${SUPABASE_URL}/rest/v1/master_data?id=eq.1`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!resp.ok) {
                // Fallback: Try upsert if PATCH fails
                const upsertResp = await fetch(`${SUPABASE_URL}/rest/v1/master_data`, {
                    method: 'POST',
                    headers: { ...getHeaders(), 'Prefer': 'resolution=merge-duplicates' },
                    body: JSON.stringify(payload)
                });
                if (upsertResp.ok) {
                    setStatus('synced', { totalCompanies: payload.companies.length });
                    return true;
                } else {
                    setStatus('error', { error: `Upload failed: ${upsertResp.status}` });
                    return false;
                }
            }

            setStatus('synced', { totalCompanies: payload.companies.length });
            return true;
        } catch (err) {
            clearTimeout(timeoutId);
            setStatus(navigator.onLine === false ? 'offline' : 'error', { error: err.message });
            return false;
        }
    }

    function subscribeToChanges(callback) {
        onChangeCallback = callback;

        // Use Supabase Realtime via WebSocket with automatic reconnection
        const wsUrl = SUPABASE_URL.replace('https://', 'wss://') + '/realtime/v1/websocket?apikey=' + SUPABASE_ANON_KEY;

        function connectWebSocket() {
            try {
                const ws = new WebSocket(wsUrl);

                ws.onopen = () => {
                    ws.send(JSON.stringify({
                        topic: 'realtime:public:master_data',
                        event: 'phx_join',
                        payload: {},
                        ref: '1'
                    }));
                };

                ws.onmessage = (event) => {
                    try {
                        const msg = JSON.parse(event.data);
                        if (msg.event === 'phx_reply' && msg.payload?.status === 'ok') {
                            ws.send(JSON.stringify({
                                topic: 'realtime:public:master_data',
                                event: 'phx_join',
                                payload: {},
                                ref: '2'
                            }));
                        }
                        if (msg.event === 'UPDATE' || msg.event === 'INSERT') {
                            if (onChangeCallback) onChangeCallback(msg.payload);
                        }
                    } catch (e) {}
                };

                ws.onerror = () => {
                    startPolling();
                };

                ws.onclose = () => {
                    startPolling();
                    setTimeout(() => {
                        if (!realtimeChannel || realtimeChannel.readyState === WebSocket.CLOSED) {
                            connectWebSocket();
                        }
                    }, 10000);
                };

                realtimeChannel = ws;
            } catch (e) {
                startPolling();
            }
        }

        connectWebSocket();
    }

    function startPolling() {
        if (window.__supabasePollInterval) clearInterval(window.__supabasePollInterval);
        window.__supabasePollInterval = setInterval(async () => {
            const data = await fetchMasterData();
            if (data && onChangeCallback) onChangeCallback(data);
        }, 30000);
    }

    function unsubscribe() {
        if (realtimeChannel) {
            try { realtimeChannel.close(); } catch (e) {}
            realtimeChannel = null;
        }
        if (window.__supabasePollInterval) {
            clearInterval(window.__supabasePollInterval);
            window.__supabasePollInterval = null;
        }
    }

    return {
        fetchMasterData,
        pushMasterData,
        subscribeToChanges,
        unsubscribe,
        onStatusChange,
        getStatus: () => ({ status: currentSyncStatus, lastSync: lastSyncTimestamp })
    };
})();
