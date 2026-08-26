/* =========================================================
   SUPABASE CONFIG
   Paste your own Project URL + anon public key below.
   These are safe to expose publicly — access is controlled
   by Row Level Security policies on the database side, not
   by hiding this key.
   ========================================================= */
const SUPABASE_URL = 'https://dgvajdbclnlzrgspqhvw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRndmFqZGJjbG5senJnc3BxaHZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2MTk5MjcsImV4cCI6MjEwMzE5NTkyN30.Eed6kCJKidnIfWvvMOJzqzSK2kpxEGdlTQy2C18X-sg';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
