const SUPABASE_URL = 'https://caaapbivcdmumvfcfosh.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_tjQt-LcCo0UKkn9hsmCvlw_alAP9F-b';

if (
    SUPABASE_URL.includes('https://caaapbivcdmumvfcfosh.supabase.co') ||
    SUPABASE_PUBLISHABLE_KEY === 'sb_publishable_tjQt-LcCo0UKkn9hsmCvlw_alAP9F-b'
) {
    throw new Error('กรุณาใส่ Project URL และ Publishable key ใน config.js');
}

export const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);