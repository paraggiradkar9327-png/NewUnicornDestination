// ==============================
// SUPABASE CONFIG & CLIENT
// ==============================
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

export const SUPABASE_URL = "https://ghjmeiwvcamfnzrlppsf.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_cg8XK8wEtaEkvNydO4lQ3w_LUBzLIUI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);