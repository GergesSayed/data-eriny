const FIREBASE_DB_URL = 'https://fleet-crm-38ba6-default-rtdb.firebaseio.com';

export async function getMasterData() {
    try {
        const resp = await fetch(`${FIREBASE_DB_URL}/master_data.json`);
        if (!resp.ok) return null;
        return await resp.json();
    } catch (e) {
        console.error('Firebase getMasterData error:', e);
        return null;
    }
}

export async function updateMasterData(payload) {
    try {
        const fullPayload = {
            id: 1,
            companies: payload.companies || [],
            users: payload.users || [],
            calls: payload.calls || [],
            deals: payload.deals || [],
            activities: payload.activities || [],
            updated_at: new Date().toISOString(),
            updated_by: payload.updated_by || 'server_api'
        };
        const resp = await fetch(`${FIREBASE_DB_URL}/master_data.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fullPayload)
        });
        if (!resp.ok) throw new Error(`Firebase PUT failed: ${resp.status}`);
        return fullPayload;
    } catch (e) {
        console.error('Firebase updateMasterData error:', e);
        throw e;
    }
}

export async function logSync(action, req, changes) {
    try {
        const logEntry = {
            action,
            timestamp: new Date().toISOString(),
            user_agent: req.headers['user-agent'] || '',
            ip_address: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '',
            changes
        };
        await fetch(`${FIREBASE_DB_URL}/sync_logs.json`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logEntry)
        });
    } catch (e) {
        console.warn('Failed to log sync:', e.message);
    }
}
