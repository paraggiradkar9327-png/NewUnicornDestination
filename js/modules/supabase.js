// ==============================
// SUPABASE CONFIG & CLIENT
// ==============================
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

export const SUPABASE_URL = "https://ghjmeiwvcamfnzrlppsf.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdoam1laXd2Y2FtZm56cmxwcHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNzA4NjksImV4cCI6MjA5Mjk0Njg2OX0.Y_yt-YsRxS_QZrcB08qegHTnSSiYTj6vxyTjICAboxE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);