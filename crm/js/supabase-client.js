/* ============================================
   Fleet CRM — Supabase Realtime Cloud Client v6.0
   ============================================ */
const SUPABASE_URL = 'https://vefitfgvdgjqipkkttry.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZml0Zmd2ZGdqcWlwa2t0dHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwNjQ0MzMsImV4cCI6MjEwMDY0MDQzM30.G4PnsfUnAI9gdNPFoSJuWKlE9VCmUXAkHOxzJb51Rrk';

window.SupabaseClient = (function() {
    let realtimeChannel = null;
    let onChangeCallback = null;
    let currentSyncStatus = 'local'; // 'synced' | 'syncing' | 'local' | 'offline' | 'error'
    let lastSyncTimestamp = null;
    let isPushing = false;
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

    function minifyCompany(c) {
        if (!c) return null;
        const min = { id: String(c.id || ''), nameAr: String(c.nameAr || c.name || '') };
        if (c.nameEn && c.nameEn !== c.nameAr) min.nameEn = c.nameEn;
        if (c.sector && c.sector !== 'manufacturing') min.sector = c.sector;
        if (c.city && c.city !== 'cairo') min.city = c.city;
        if (c.governorate || c.gov) min.gov = c.governorate || c.gov;
        if (c.address || c.addr) min.addr = c.address || c.addr;
        if (c.phone1 || c.phone || c.p1) min.p1 = c.phone1 || c.phone || c.p1;
        if (c.mobile || c.mob) min.mob = c.mobile || c.mob;
        if (c.website || c.web) min.web = c.website || c.web;
        if (c.latitude || c.lat) min.lat = c.latitude || c.lat;
        if (c.longitude || c.lon) min.lon = c.longitude || c.lon;
        if (c.google_maps_url || c.map) min.map = c.google_maps_url || c.map;
        if (c.fleetSize || c.fleet) min.fleet = c.fleetSize || c.fleet;
        if (c.priority && c.priority !== 'B') min.prio = c.priority;
        if (c.status && c.status !== 'new') min.st = c.status;
        if (c.assignedTo || c.asgn) min.asgn = c.assignedTo || c.asgn;
        if (c.contactPerson || c.cp) min.cp = c.contactPerson || c.cp;
        if (c.contactTitle || c.ct) min.ct = c.contactTitle || c.ct;
        if (c.notes) min.notes = c.notes;
        if (c.createdAt || c.cat) min.cat = c.createdAt || c.cat;
        if (c.lastUpdated || c.upd) min.upd = c.lastUpdated || c.upd;
        return min;
    }

    function unminifyCompany(m) {
        if (!m) return null;
        return {
            id: m.id || ('comp_' + Math.random().toString(36).slice(2, 8)),
            nameAr: m.nameAr || m.name || '',
            nameEn: m.nameEn || m.nameAr || '',
            sector: m.sector || 'manufacturing',
            city: m.city || 'cairo',
            governorate: m.gov || m.governorate || '',
            address: m.addr || m.address || '',
            phone1: m.p1 || m.phone1 || m.phone || '',
            mobile: m.mob || m.mobile || m.p1 || m.phone1 || '',
            website: m.web || m.website || '',
            latitude: m.lat || m.latitude || null,
            longitude: m.lon || m.longitude || null,
            google_maps_url: m.map || m.google_maps_url || ((m.lat || m.latitude) && (m.lon || m.longitude) ? ('https://www.google.com/maps?q=' + (m.lat || m.latitude) + ',' + (m.lon || m.longitude)) : ''),
            fleetSize: Number(m.fleet || m.fleetSize || 30),
            fleetType: 'heavy',
            priority: m.prio || m.priority || 'B',
            status: m.st || m.status || 'new',
            assignedTo: m.asgn || m.assignedTo || '',
            contactPerson: m.cp || m.contactPerson || '',
            contactTitle: m.ct || m.contactTitle || '',
            notes: m.notes || '',
            createdAt: m.cat || m.createdAt || new Date().toISOString(),
            lastUpdated: m.upd || m.lastUpdated || new Date().toISOString().split('T')[0]
        };
    }

    async function fetchMasterData() {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s fast timeout

        try {
            const resp = await fetch(`${SUPABASE_URL}/rest/v1/master_data?id=eq.1&select=*`, {
                headers: { ...getHeaders(), 'Prefer': 'return=representation' },
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!resp.ok) {
                setStatus('local', { error: `HTTP ${resp.status}` });
                return null;
            }
            const rows = await resp.json();
            const result = (rows && rows.length > 0) ? rows[0] : null;
            if (result) {
                if (Array.isArray(result.companies)) {
                    result.companies = result.companies.map(unminifyCompany).filter(Boolean);
                }
                setStatus('synced', { totalCompanies: result.companies ? result.companies.length : 0 });
            }
            return result;
        } catch (err) {
            clearTimeout(timeoutId);
            setStatus('local', { error: err.message });
            return null;
        }
    }

    async function pushMasterData(data) {
        if (isPushing) return false;
        isPushing = true;
        setStatus('syncing');

        const rawCompanies = Array.isArray(data.companies) ? data.companies : [];
        const minifiedCompanies = rawCompanies.map(minifyCompany).filter(Boolean);

        const payload = {
            id: 1,
            companies: minifiedCompanies,
            users: data.users || [],
            calls: data.calls || [],
            deals: data.deals || [],
            activities: data.activities || [],
            updated_at: new Date().toISOString(),
            updated_by: 'client'
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s fast timeout

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
                const upsertController = new AbortController();
                const upsertTimeout = setTimeout(() => upsertController.abort(), 4000);
                const upsertResp = await fetch(`${SUPABASE_URL}/rest/v1/master_data`, {
                    method: 'POST',
                    headers: { ...getHeaders(), 'Prefer': 'resolution=merge-duplicates' },
                    body: JSON.stringify(payload),
                    signal: upsertController.signal
                });
                clearTimeout(upsertTimeout);
                if (upsertResp.ok) {
                    setStatus('synced', { totalCompanies: rawCompanies.length });
                    isPushing = false;
                    return true;
                } else {
                    setStatus('local', { totalCompanies: rawCompanies.length, error: `Upload status: ${upsertResp.status}` });
                    isPushing = false;
                    return false;
                }
            }

            setStatus('synced', { totalCompanies: rawCompanies.length });
            isPushing = false;
            return true;
        } catch (err) {
            clearTimeout(timeoutId);
            setStatus('local', { totalCompanies: rawCompanies.length, error: err.message });
            isPushing = false;
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
        }, 12000);
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
