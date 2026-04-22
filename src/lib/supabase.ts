import { createClient } from '@supabase/supabase-js';

// On utilise des valeurs par défaut vides pour éviter le crash immédiat si les variables ne sont pas encore définies
// L'utilisateur doit configurer ces variables dans les secrets/environnement du projet
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper pour vérifier si Supabase est réellement configuré
export const isSupabaseConfigured = () => {
  return !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
};
