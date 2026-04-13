"use client";

import { supabase } from "../supabase";

const PRODUCTS_TABLE = "products";

const normalizeCategory = (category) => (category === "other" ? "other" : "popular");

const mapProductRow = (row) => {
    const priceValue = Number(row?.price || 0);
    return {
        id: row?.id,
        name: row?.name || "Produk Tanpa Nama",
        category: normalizeCategory(row?.category),
        priceValue,
        price: `Rp ${priceValue.toLocaleString("id-ID")}/Hari`,
        stock: Math.max(0, Number(row?.stock || 0)),
        img: row?.image_url || "",
        image_url: row?.image_url || "",
        description: row?.description || "",
        is_active: Boolean(row?.is_active),
        createdAt: row?.created_at || null,
        updatedAt: row?.updated_at || null,
    };
};

/**
 * Get products from Supabase
 * @param {Object} options
 * @param {boolean} options.activeOnly - return only active products
 * @returns {Array}
 */
export async function getProducts({ activeOnly = true } = {}) {
    try {
        let query = supabase
            .from(PRODUCTS_TABLE)
            .select("id, name, category, price, stock, image_url, description, is_active, created_at, updated_at")
            .order("created_at", { ascending: false });

        if (activeOnly) {
            query = query.eq("is_active", true);
        }

        const { data, error } = await query;
        if (error) throw error;

        return Array.isArray(data) ? data.map(mapProductRow) : [];
    } catch (err) {
        console.error("Exception in getProducts:", err);
        return [];
    }
}

/**
 * Create product in Supabase
 * @param {Object} payload
 * @returns {Object|null}
 */
export async function createProduct(payload) {
    try {
        const insertPayload = {
            name: String(payload?.name || "").trim(),
            category: normalizeCategory(payload?.category),
            price: Math.max(0, Number(payload?.price || 0)),
            stock: Math.max(0, Number(payload?.stock || 0)),
            image_url: String(payload?.image_url || payload?.img || "").trim(),
            description: String(payload?.description || "").trim(),
            is_active: payload?.is_active !== false,
        };

        const { data, error } = await supabase
            .from(PRODUCTS_TABLE)
            .insert([insertPayload])
            .select("id, name, category, price, stock, image_url, description, is_active, created_at, updated_at")
            .single();

        if (error) throw error;
        return mapProductRow(data);
    } catch (err) {
        console.error("Exception in createProduct:", err);
        throw err;
    }
}

/**
 * Update product in Supabase
 * @param {string} productId
 * @param {Object} updates
 * @returns {Object|null}
 */
export async function updateProduct(productId, updates) {
    try {
        const updatePayload = {
            name: String(updates?.name || "").trim(),
            category: normalizeCategory(updates?.category),
            price: Math.max(0, Number(updates?.price || 0)),
            stock: Math.max(0, Number(updates?.stock || 0)),
            image_url: String(updates?.image_url || updates?.img || "").trim(),
            description: String(updates?.description || "").trim(),
            is_active: updates?.is_active !== false,
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from(PRODUCTS_TABLE)
            .update(updatePayload)
            .eq("id", productId)
            .select("id, name, category, price, stock, image_url, description, is_active, created_at, updated_at")
            .single();

        if (error) throw error;
        return mapProductRow(data);
    } catch (err) {
        console.error("Exception in updateProduct:", err);
        throw err;
    }
}

/**
 * Soft delete product in Supabase
 * @param {string} productId
 */
export async function deactivateProduct(productId) {
    try {
        const { error } = await supabase
            .from(PRODUCTS_TABLE)
            .update({
                is_active: false,
                updated_at: new Date().toISOString(),
            })
            .eq("id", productId);

        if (error) throw error;
        return true;
    } catch (err) {
        console.error("Exception in deactivateProduct:", err);
        throw err;
    }
}

/**
 * Reserve stock transaction-safely using RPC function `reserve_product_stock`
 * @param {Array<{productId: string, quantity: number}>} items
 * @returns {Object} RPC response object
 */
export async function reserveProductStock(items) {
    const payload = Array.isArray(items)
        ? items
            .map((item) => ({
                product_id: item?.productId,
                quantity: Math.max(0, Number(item?.quantity || 0)),
            }))
            .filter((item) => item.product_id && item.quantity > 0)
        : [];

    if (payload.length === 0) {
        return { success: false, message: "Item stok tidak valid." };
    }

    try {
        const { data, error } = await supabase.rpc("reserve_product_stock", {
            p_items: payload,
        });

        if (error) {
            console.error("RPC reserve_product_stock error:", error);
            throw error;
        }

        return data || { success: false, message: "Gagal memproses stok." };
    } catch (err) {
        console.error("Exception in reserveProductStock:", err);
        throw err;
    }
}

/**
 * Get user profile from Supabase
 * @param {string} userId - User ID from Supabase auth
 * @returns {Object|null} - Profile data or null
 */
export async function getUserProfile(userId) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }

        return data;
    } catch (err) {
        console.error('Exception in getUserProfile:', err);
        return null;
    }
}

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updates - Profile updates
 * @returns {Object|null} - Updated profile or null
 */
export async function updateUserProfile(userId, updates) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
            .select()
            .single();

        if (error) {
            console.error('Supabase update error:', error);
            throw error;
        }

        return data;
    } catch (err) {
        console.error('Exception in updateUserProfile:', err);
        throw err;
    }
}

/**
 * Upload profile photo to Supabase Storage
 * @param {string} userId - User ID
 * @param {File} file - Image file
 * @returns {string|null} - Public URL of uploaded image or null
 */
export async function uploadProfilePhoto(userId, file) {
    try {
        if (!userId) {
            console.error('No userId provided');
            throw new Error('User ID is required');
        }

        if (!file) {
            console.error('No file provided');
            throw new Error('File is required');
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload file to Supabase Storage
        const { data, error } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (error) {
            console.error('Supabase upload error:', error);
            throw error;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
    } catch (err) {
        console.error('Exception in uploadProfilePhoto:', err);
        throw err;
    }
}

/**
 * Delete old profile photo from storage
 * @param {string} photoUrl - URL of photo to delete
 */
export async function deleteProfilePhoto(photoUrl) {
    try {
        if (!photoUrl) return;

        // Extract file path from URL
        const urlParts = photoUrl.split('/');
        const bucket = urlParts[urlParts.indexOf('storage') + 2];
        const filePath = urlParts.slice(urlParts.indexOf('storage') + 3).join('/');

        const { error } = await supabase.storage
            .from(bucket)
            .remove([filePath]);

        if (error) {
            console.error('Error deleting photo:', error);
        }
    } catch (err) {
        console.error('Exception in deleteProfilePhoto:', err);
    }
}

/**
 * Create initial profile for new user
 * @param {Object} user - Supabase user object
 */
export async function createUserProfile(user) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .insert([
                {
                    id: user.id,
                    email: user.email,
                    full_name: user.user_metadata?.full_name || '',
                    username: user.email?.split('@')[0] || 'user',
                    avatar_url: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Error creating profile:', error);
            return null;
        }

        return data;
    } catch (err) {
        console.error('Exception in createUserProfile:', err);
        return null;
    }
}

/**
 * Save booking to Supabase
 * @param {string} userId - User ID
 * @param {Object} bookingData - Booking information
 * @returns {Object|null} - Saved booking or null
 */
export async function saveBooking(userId, bookingData) {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .insert([
                {
                    user_id: userId,
                    order_id: bookingData.orderId,
                    items: bookingData.items,
                    rental_start_date: bookingData.startDate,
                    rental_end_date: bookingData.endDate,
                    total_price: bookingData.totalPrice,
                    payment_method: bookingData.paymentMethod,
                    status: 'ongoing',
                    penalty_amount: 0,
                    notes: bookingData.notes || '',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Error saving booking:', error);
            throw error;
        }

        return data;
    } catch (err) {
        console.error('Exception in saveBooking:', err);
        throw err;
    }
}

/**
 * Get all bookings for a user
 * @param {string} userId - User ID
 * @returns {Array} - Array of bookings
 */
export async function getUserBookings(userId) {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching bookings:', error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('Exception in getUserBookings:', err);
        return [];
    }
}

/**
 * Update booking return date and calculate penalty
 * @param {string} bookingId - Booking ID
 * @param {string} returnDate - Return date (YYYY-MM-DD)
 * @param {number} dailyPenalty - Penalty amount per day (default: 10000)
 * @returns {Object|null} - Updated booking or null
 */
export async function updateBookingReturn(bookingId, returnDate, dailyPenalty = 10000) {
    try {
        // Fetch the booking first to get rental_end_date
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select('rental_end_date')
            .eq('id', bookingId)
            .single();

        if (fetchError) {
            console.error('Error fetching booking:', fetchError);
            throw fetchError;
        }

        // Calculate penalty if late
        const endDate = new Date(booking.rental_end_date);
        const returnDateObj = new Date(returnDate);
        const lateDays = Math.max(0, Math.ceil((returnDateObj - endDate) / (1000 * 60 * 60 * 24)));
        const penaltyAmount = lateDays * dailyPenalty;

        const status = lateDays > 0 ? 'late' : 'completed';

        const { data, error } = await supabase
            .from('bookings')
            .update({
                return_date: returnDate,
                penalty_amount: penaltyAmount,
                status: status,
                updated_at: new Date().toISOString()
            })
            .eq('id', bookingId)
            .select()
            .single();

        if (error) {
            console.error('Error updating booking:', error);
            throw error;
        }

        return data;
    } catch (err) {
        console.error('Exception in updateBookingReturn:', err);
        throw err;
    }
}
