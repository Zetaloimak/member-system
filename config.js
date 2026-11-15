const SUPABASE_URL = 'https://caaapbivcdmumvfcfosh.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_tjQt-LcCo0UKkn9hsmCvlw_alAP9F-b';

export const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);
