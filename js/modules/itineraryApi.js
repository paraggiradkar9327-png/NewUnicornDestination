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

/**
 * Search for itineraries by destination and daysOfTravel.
 *
 * The itinerary content is stored as a JSONB array of day-objects.
 * Each day object has { destination, daysOfTravel, ... }.
 * We search inside the first element of the content array using
 * Postgres JSONB containment (@>).
 *
 * @param {string} destination  - e.g. "Goa"
 * @param {string} daysOfTravel - e.g. "5N / 4D"
 * @returns {Promise<Object|null>} - Most recent matching record, or null
 */
export async function searchItineraryByTrip(destination, daysOfTravel) {
    try {
        // Fetch all and filter client-side (works with any Supabase plan).
        // For large datasets you can use a Postgres function instead.
        const { data, error } = await supabase
            .from("itineraries")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Search fetch error:", error);
            return null;
        }
        if (!data || data.length === 0) return null;

        const destLower = destination.trim().toLowerCase();
        const dotrLower = daysOfTravel.trim().toLowerCase();

        // Filter: check the first day's destination & daysOfTravel fields
        const match = data.find(record => {
            const content = record.content;
            if (!Array.isArray(content) || content.length === 0) return false;

            // Check every day (they all share the same trip-level fields)
            const first = content[0];
            const recDest = (first.destination || "").trim().toLowerCase();
            const recDotr = (first.daysOfTravel || "").trim().toLowerCase();

            const destMatch = recDest.includes(destLower) || destLower.includes(recDest);
            const dotrMatch = recDotr === dotrLower ||
                              recDotr.replace(/\s/g, "") === dotrLower.replace(/\s/g, "");

            return destMatch && dotrMatch;
        });

        return match || null;
    } catch (err) {
        console.error("Unexpected search error:", err);
        return null;
    }
}