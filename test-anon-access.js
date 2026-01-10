
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log("Testing Anon Read Access...");
    const { data, error } = await supabase.from('posts').select('slug').limit(5);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Success! Posts found:", data.length);
        console.log("Sample:", data);
    }
}

test();
