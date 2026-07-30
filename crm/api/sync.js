import { getMasterData, updateMasterData, logSync } from './_lib/supabase.js';

const AUTH_SECRET = 'fleetcrm_sync_v4';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const auth = req.headers.authorization || '';
    if (auth !== `Bearer ${AUTH_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        if (req.method === 'GET') {
            const data = await getMasterData();
            if (!data) {
                return res.status(200).json({
                    companies: [], users: [], calls: [], deals: [], activities: [],
                    timestamp: Date.now()
                });
            }
            return res.status(200).json({
                companies: data.companies || [],
                users: data.users || [],
                calls: data.calls || [],
                deals: data.deals || [],
                activities: data.activities || [],
                timestamp: new Date(data.updated_at).getTime()
            });
        }

        if (req.method === 'POST') {
            const payload = req.body;
            if (!payload || typeof payload !== 'object') {
                return res.status(400).json({ error: 'Invalid body' });
            }

            const result = await updateMasterData({
                companies: payload.companies || [],
                users: payload.users || [],
                calls: payload.calls || [],
                deals: payload.deals || [],
                activities: payload.activities || [],
                updated_by: 'api'
            });

            await logSync('SYNC_PUSH', req, {
                companies_count: (payload.companies || []).length,
                users_count: (payload.users || []).length,
                calls_count: (payload.calls || []).length,
                deals_count: (payload.deals || []).length,
                activities_count: (payload.activities || []).length
            });

            return res.status(200).json({
                success: true,
                timestamp: new Date(result.updated_at).getTime()
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('Sync API error:', err);
        return res.status(500).json({ error: err.message || 'Internal server error' });
    }
}
