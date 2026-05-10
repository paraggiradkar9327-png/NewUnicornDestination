// ==============================
// ITINERARY API HELPERS
// ==============================
import { supabase } from "./supabase.js";

/**
 * Insert a new itinerary record.
 * @param {Array} days - Array of day objects
 * @returns {Promise<string|null>} - The new record's ID, or null on error
 */
export async function saveItinerary(days) {
    try {
        // Get current logged-in user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error("No logged-in user found.");
            return null;
        }

        const { data, error } = await supabase
            .from("itineraries")
            .insert([{ content: days, created_by: user.id }])
            .select();

        if (error) {
            console.error("Supabase insert error:", error);
            return null;
        }
        return data[0].id;
    } catch (err) {
        console.error("Unexpected Supabase error:", err);
        return null;
    }
}

/**
 * Update an existing itinerary record.
 * @param {string} id   - Record ID to update
 * @param {Array}  days - Updated array of day objects
 * @returns {Promise<boolean>} - true on success, false on error
 */
export async function updateItinerary(id, days) {
    const { error } = await supabase
        .from("itineraries")
        .update({ content: days })
        .eq("id", id);

    if (error) {
        console.error("Update error:", error);
        return false;
    }
    return true;
}

/**
 * Fetch a single itinerary record by ID.
 * @param {string} id
 * @returns {Promise<Object|null>} - The full record, or null on error
 */
export async function fetchItinerary(id) {
    const { data, error } = await supabase
        .from("itineraries")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !data) {
        console.error("Fetch error:", error);
        return null;
    }
    return data;
}

/**
 * Fetch all itineraries (admin only).
 * @returns {Promise<Array>} - Array of itinerary records
 */
export async function fetchAllItineraries() {
    const { data, error } = await supabase
        .from("itineraries")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Fetch all error:", error);
        return [];
    }
    return data;
}