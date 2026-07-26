import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('⚠️ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in Vercel Environment Variables');
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseKey || 'placeholder-key',
    {
        auth: { persistSession: false },
        db: { schema: 'public' }
    }
);

export async function getMasterData() {
    const { data, error } = await supabase
        .from('master_data')
        .select('*')
        .eq('id', 1)
        .single();

    if (error) throw error;
    return data;
}

export async function updateMasterData(payload) {
    const { data, error } = await supabase
        .from('master_data')
        .upsert({
            id: 1,
            companies: payload.companies || [],
            users: payload.users || [],
            calls: payload.calls || [],
            deals: payload.deals || [],
            activities: payload.activities || [],
            updated_at: new Date().toISOString(),
            updated_by: payload.updated_by || 'system'
        }, { onConflict: 'id' })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function logSync(action, req, changes) {
    try {
        await supabase.from('sync_log').insert({
            action,
            user_agent: req.headers['user-agent'] || '',
            ip_address: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '',
            changes
        });
    } catch (e) {
        console.warn('Failed to log sync:', e.message);
    }
}
