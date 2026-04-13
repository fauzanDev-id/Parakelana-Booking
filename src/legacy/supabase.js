"use client";

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ekizfvoomqzhajhhgbiw.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_nbv4WluN7eAAt86n_ffkTA_ds9mJ7I-";

const authLock = async (_name, _acquireTimeout, fn) => {
	// Avoid browser LockManager contention timeouts in dev/HMR environments.
	return await fn();
};

const createSupabaseClient = () =>
	createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
		auth: {
			persistSession: true,
			autoRefreshToken: true,
			detectSessionInUrl: true,
			storageKey: "parakelana-auth",
			lock: authLock,
		},
	});

if (!globalThis.__parakelanaSupabaseClient) {
	globalThis.__parakelanaSupabaseClient = createSupabaseClient();
}

export const supabase = globalThis.__parakelanaSupabaseClient;
