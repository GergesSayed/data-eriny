/* AppStorage Global Safe Declaration */
var AppStorage = window.AppStorage = window.AppStorage || {};
var Storage = window.AppStorage;
/* ============================================
   Fleet CRM — Supabase Client v4.5
   ============================================ */
const SUPABASE_URL = 'https://vefitfgvdgjqipkkttry.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZml0Zmd2ZGdqcWlwa2t0dHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwNjQ0MzMsImV4cCI6MjEwMDY0MDQzM30.G4PnsfUnAI9gdNPFoSJuWKlE9VCmUXAkHOxzJb51Rrk';

window.SupabaseClient = (function() {
    let realtimeChannel = null;
    let onChangeCallback = null;

    function getHeaders() {
        return {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        };
    }

    async function fetchMasterData() {
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/master_data?id=eq.1&select=*`, {
            headers: { ...getHeaders(), 'Prefer': 'return=representation' }
        });
        if (!resp.ok) return null;
        const rows = await resp.json();
        return rows && rows.length > 0 ? rows[0] : null;
    }

    async function pushMasterData(data) {
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

        const resp = await fetch(`${SUPABASE_URL}/rest/v1/master_data?id=eq.1`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });

        if (!resp.ok) {
            // Try upsert if PATCH fails
            const upsertResp = await fetch(`${SUPABASE_URL}/rest/v1/master_data`, {
                method: 'POST',
                headers: { ...getHeaders(), 'Prefer': 'resolution=merge-duplicates' },
                body: JSON.stringify(payload)
            });
            return upsertResp.ok;
        }
        return true;
    }

    function subscribeToChanges(callback) {
        onChangeCallback = callback;

        // Use Supabase Realtime via WebSocket
        const wsUrl = SUPABASE_URL.replace('https://', 'wss://') + '/realtime/v1/websocket?apikey=' + SUPABASE_ANON_KEY;

        try {
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                // Join the master_data channel
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
                        // Subscribe to UPDATE events
                        ws.send(JSON.stringify({
                            topic: 'realtime:public:master_data',
                            event: 'phx_join',
                            payload: {},
                            ref: '2'
                        }));
                    }
                    // Handle change notifications
                    if (msg.event === 'UPDATE' || msg.event === 'INSERT') {
                        if (onChangeCallback) onChangeCallback(msg.payload);
                    }
                } catch (e) {}
            };

            ws.onerror = () => {
                // Fallback: poll every 30 seconds
                startPolling();
            };

            ws.onclose = () => {
                // Reconnect or fallback to polling
                startPolling();
            };

            realtimeChannel = ws;
        } catch (e) {
            startPolling();
        }
    }

    function startPolling() {
        // Polling fallback if WebSocket fails
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
        unsubscribe
    };
})();
