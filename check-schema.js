const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function checkSchema() {
    console.log('Checking profiles table schema...')

    // Fetch one profile to see columns
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)

    if (error) {
        console.error('Error:', error.message)
    } else {
        if (data.length > 0) {
            console.log('Columns in profiles table:', Object.keys(data[0]))
            console.log('Sample profile:', data[0])
        } else {
            console.log('Profiles table is empty. Cannot determine columns from data.')
        }
    }
}

checkSchema()
