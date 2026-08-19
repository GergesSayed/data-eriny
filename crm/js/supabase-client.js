/* ===================================================================
   Fleet CRM — Firebase Realtime Cloud Synchronization Engine v7.0
   Always-Online, Zero-Pause, Instant Multi-Device Two-Way Sync
   =================================================================== */

const FIREBASE_DB_URL = 'https://fleet-crm-38ba6-default-rtdb.firebaseio.com';

window.SupabaseClient = (function() {
    let sseSource = null;
    let onChangeCallback = null;
    let currentSyncStatus = 'synced'; // 'synced' | 'syncing' | 'local' | 'offline' | 'error'
    let lastSyncTimestamp = Date.now();
    let isPushing = false;
    let pollInterval = null;
    const statusListeners = new Set();

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
        if (c.fleetSize || c.fleet) min.fleet = Number(c.fleetSize || c.fleet);
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
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s fast timeout

        try {
            const resp = await fetch(`${FIREBASE_DB_URL}/master_data.json?t=${Date.now()}`, {
                signal: controller.signal,
                headers: { 'Accept': 'application/json' }
            });
            clearTimeout(timeoutId);

            if (!resp.ok) {
                setStatus('local', { error: `HTTP ${resp.status}` });
                return null;
            }
            const result = await resp.json();
            if (result && typeof result === 'object') {
                if (Array.isArray(result.companies)) {
                    result.companies = result.companies.map(unminifyCompany).filter(Boolean);
                }
                setStatus('synced', { totalCompanies: result.companies ? result.companies.length : 0 });
                return result;
            }
            return null;
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
        const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout for batch push

        try {
            const resp = await fetch(`${FIREBASE_DB_URL}/master_data.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (resp.ok) {
                setStatus('synced', { totalCompanies: rawCompanies.length });
                isPushing = false;
                return true;
            } else {
                setStatus('local', { totalCompanies: rawCompanies.length, error: `Upload HTTP ${resp.status}` });
                isPushing = false;
                return false;
            }
        } catch (err) {
            clearTimeout(timeoutId);
            setStatus('local', { totalCompanies: rawCompanies.length, error: err.message });
            isPushing = false;
            return false;
        }
    }

    function subscribeToChanges(callback) {
        onChangeCallback = callback;

        // 1. Firebase Server-Sent Events (SSE) for sub-second real-time notifications
        try {
            if (typeof EventSource !== 'undefined') {
                if (sseSource) sseSource.close();
                sseSource = new EventSource(`${FIREBASE_DB_URL}/master_data.json`);

                sseSource.addEventListener('put', (e) => {
                    try {
                        const parsed = JSON.parse(e.data);
                        if (parsed && parsed.data && typeof parsed.data === 'object') {
                            if (parsed.path === '/' || parsed.path === '') {
                                const result = parsed.data;
                                if (Array.isArray(result.companies)) {
                                    result.companies = result.companies.map(unminifyCompany).filter(Boolean);
                                }
                                if (onChangeCallback) onChangeCallback(result);
                            }
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

        // 2. Continuous fallback polling every 8s
        startPolling();
    }

    function startPolling() {
        if (pollInterval) clearInterval(pollInterval);
        pollInterval = setInterval(async () => {
            const data = await fetchMasterData();
            if (data && onChangeCallback) onChangeCallback(data);
        }, 8000);
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

    return {
        fetchMasterData,
        pushMasterData,
        subscribeToChanges,
        unsubscribe,
        onStatusChange,
        getStatus: () => ({ status: currentSyncStatus, lastSync: lastSyncTimestamp })
    };
})();
