const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase URL or Key')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testCalendarData() {
    console.log('Testing Calendar Data Fetching...')

    // 1. Fetch Rooms
    console.log('\n1. Fetching Rooms...')
    const { data: rooms, error: roomsError } = await supabase.from('rooms').select('*')
    if (roomsError) {
        console.error('❌ Error fetching rooms:', roomsError.message)
    } else {
        console.log(`✅ Found ${rooms.length} rooms.`)
    }

    // 2. Fetch Bookings (Simple)
    console.log('\n2. Fetching All Bookings (Simple query)...')
    const { data: simpleBookings, error: simpleError } = await supabase.from('bookings').select('id, status')
    if (simpleError) {
        console.error('❌ Error fetching simple bookings:', simpleError.message)
    } else {
        console.log(`✅ Found ${simpleBookings.length} bookings (total).`)
    }

    // 3. Fetch Bookings with Relations (Like in Calendar)
    console.log('\n3. Fetching Bookings with Relations (Calendar query)...')
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString()

    console.log(`Querying range: ${startOfMonth} to ${endOfMonth}`)

    const { data: calendarBookings, error: calendarError } = await supabase
        .from('bookings')
        .select(`
      *,
      rooms(room_number, room_type),
      profiles(first_name, last_name),
      cats(name, breed)
    `)
        .or(`check_in_date.lte.${endOfMonth},check_out_date.gte.${startOfMonth}`)

    if (calendarError) {
        console.error('❌ Error fetching calendar bookings:', calendarError.message)
        console.error('Hint: This often fails if RLS is enabled but policies for joined tables (profiles, cats) are missing.')
    } else {
        console.log(`✅ Found ${calendarBookings.length} bookings in this range.`)
        if (calendarBookings.length > 0) {
            console.log('Sample booking:', JSON.stringify(calendarBookings[0], null, 2))
        }
    }
}

testCalendarData()
