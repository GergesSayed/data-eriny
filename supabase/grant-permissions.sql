-- ====================================
-- صلاحيات Supabase — شغل السطرين دول
-- ====================================
-- روح على الرابط ده:
-- https://supabase.com/dashboard/project/vefitfgvdgjqipkkttry/sql/new
-- الصق السطرين دول واضغط Run

GRANT SELECT, INSERT, UPDATE ON public.master_data TO anon;
GRANT SELECT, INSERT ON public.sync_log TO anon;
