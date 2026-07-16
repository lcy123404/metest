import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nwwxtdszbsdkuyttmnqq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53d3h0ZHN6YnNka3V5dHRtbnFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3NDg0MzcsImV4cCI6MjA5OTMyNDQzN30._0zjsZDD2DI5gxK2FszzsSd2zN03OS2RlEKnIAOEEGg';

export const supabase = createClient(supabaseUrl, supabaseKey);
