const path = require('path');
const dotenv = require('dotenv');

// Fix path to point correctly to backend/.env
// setupPolicies is in backend/scripts/
// .env is in backend/
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = process.env.SUPABASE_BUCKET_NAME || 'E3-E4';

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase credentials.');
    console.error('Debug Path:', envPath); // Helpful debug
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setStoragePolicies() {
    try {
        console.log(`Configuring storage bucket: ${BUCKET_NAME}`);

        // 1. Get Bucket
        const { data: bucket, error: bucketError } = await supabase.storage.getBucket(BUCKET_NAME);

        if (bucketError && bucketError.message.includes('not found')) {
            console.log('Bucket not found. Creating as PUBLIC...');
            const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, { public: true });
            if (createError) throw createError;
            console.log('Bucket created successfully.');
        } else if (bucket && !bucket.public) {
            console.log('Bucket exists but is private. Updating to public...');
            const { error: updateError } = await supabase.storage.updateBucket(BUCKET_NAME, { public: true });
            if (updateError) throw updateError;
            console.log('Bucket updated to public.');
        } else {
            console.log('Bucket is already configured as public.');
        }

        // 2. Verify
        const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl('test.jpg');
        console.log(`Public access verified. Example URL: ${data.publicUrl}`);

    } catch (err) {
        console.error('Configuration failed:', err.message);
    }
}

setStoragePolicies();
