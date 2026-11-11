import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const STORAGE_BUCKET = "product-images";

let adminClient: SupabaseClient | undefined;
let bucketSetup: Promise<void> | undefined;

function getAdminClient() {
  if (adminClient) return adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase Storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  adminClient = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return adminClient;
}

export async function ensureBucket() {
  const client = getAdminClient();
  if (!bucketSetup) {
    bucketSetup = (async () => {
      const { data: bucket, error: lookupError } =
        await client.storage.getBucket(STORAGE_BUCKET);

      if (!lookupError && bucket) {
        if (!bucket.public) {
          const { error } = await client.storage.updateBucket(STORAGE_BUCKET, {
            public: true,
          });
          if (error) throw new Error(`Unable to make Storage bucket public: ${error.message}`);
        }
        return;
      }

      if (
        lookupError &&
        !lookupError.message.toLowerCase().includes("not found")
      ) {
        throw new Error(`Unable to inspect Storage bucket: ${lookupError.message}`);
      }

      const { error: createError } = await client.storage.createBucket(STORAGE_BUCKET, {
        public: true,
      });
      if (
        createError &&
        !createError.message.toLowerCase().includes("already exists")
      ) {
        throw new Error(`Unable to create Storage bucket: ${createError.message}`);
      }
    })().catch((error: unknown) => {
      bucketSetup = undefined;
      throw error;
    });
  }

  await bucketSetup;
  return client;
}
