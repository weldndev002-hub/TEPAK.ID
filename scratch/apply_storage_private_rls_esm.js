import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DIRECT_URL,
});

async function run() {
  await client.connect();
  try {
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE policyname = 'Enable insert for media-produk-private' AND tablename = 'objects' AND schemaname = 'storage'
        ) THEN
            CREATE POLICY "Enable insert for media-produk-private" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media-produk-private');
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE policyname = 'Enable select for media-produk-private' AND tablename = 'objects' AND schemaname = 'storage'
        ) THEN
            CREATE POLICY "Enable select for media-produk-private" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'media-produk-private');
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE policyname = 'Enable update for media-produk-private' AND tablename = 'objects' AND schemaname = 'storage'
        ) THEN
            CREATE POLICY "Enable update for media-produk-private" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media-produk-private');
        END IF;
      END
      $$;
    `);
    console.log("Policies created successfully for private bucket.");
  } catch (err) {
    console.error("Error creating policies:", err);
  } finally {
    await client.end();
  }
}

run();
