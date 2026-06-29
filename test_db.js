const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envConfig = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, val] = line.split('=');
  if(key && val) acc[key.trim()] = val.trim();
  return acc;
}, {});
const supabaseUrl = envConfig['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = envConfig['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDb() {
  console.log("Checking analyses table...");
  const { data, error } = await supabase.from('analyses').select('*').limit(1);
  if (error) {
    console.error("Error fetching analyses:", error);
  } else {
    console.log("Analyses table exists! Data:", data);
  }
}

checkDb();
