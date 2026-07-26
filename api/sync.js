import { kv } from '@vercel/kv';

const KV_KEY = 'fleetcrm_master_data';
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
            const data = await kv.get(KV_KEY);
            return res.status(200).json(data || { companies: [], users: [], calls: [], deals: [], activities: [], timestamp: Date.now() });
        }

        if (req.method === 'POST') {
            const body = req.body;
            if (!body || typeof body !== 'object') {
                return res.status(400).json({ error: 'Invalid body' });
            }
            body.timestamp = Date.now();
            await kv.set(KV_KEY, body);
            return res.status(200).json({ success: true, timestamp: body.timestamp });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
