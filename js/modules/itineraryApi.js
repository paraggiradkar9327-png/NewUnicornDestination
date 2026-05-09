// ==============================
// ITINERARY API HELPERS
// ==============================
import { supabase } from "./supabase.js";

/**
 * Insert a new itinerary record.
 * @param {Array} days - Array of day objects
 * @returns {Promise<string|null>} - The new record's UUID, or null on error
 */
export async function saveItinerary(days) {
    try {
        const { data, error } = await supabase
            .from("itineraries")
            .insert([{ content: days }])
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
 * @param {string} id   - Record UUID to update
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