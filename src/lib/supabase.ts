import { supabase as supabaseClient } from "@/integrations/supabase/client";

export const supabase = supabaseClient;

// Helper pour vérifier si Supabase est réellement configuré
export const isSupabaseConfigured = () => {
  // Puisque nous avons hardcodé les valeurs dans l'intégration, c'est toujours configuré
  return true;
};
