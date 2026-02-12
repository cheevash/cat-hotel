
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://yzailectsvamnobzqgdn.supabase.co'
const supabaseKey = 'sb_publishable_6iQ7KtY_ZXIFAbAFjpAoHQ_Ega5TKqf'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
    console.log('Testing Supabase Connection...')

    // Test 1: Fetch Promotions - Check columns
    const { data: promotions, error: promoError } = await supabase
        .from('promotions')
        .select('*')

    if (promoError) {
        console.error('Error fetching promotions:', promoError.message)
    } else {
        console.log('Promotions found:', promotions.length)
        if (promotions.length > 0) {
            console.log('First promotion keys:', Object.keys(promotions[0]))
            console.log('First promotion full object:', JSON.stringify(promotions[0], null, 2))
        } else {
            console.log('Promotions table is empty.')
        }
    }

    // Test 2: Try to Insert a dummy promotion (Test RLS for Insert)
    const dummy = {
        title: 'Test Promotion',
        description: 'Testing RLS',
        icon: '🧪',
        order: 999
        // Intentionally omitting is_active to see if it defaults or errors
    }

    console.log('Attempting to insert test promotion...')
    const { data: insertData, error: insertError } = await supabase
        .from('promotions')
        .insert([dummy])
        .select()

    if (insertError) {
        console.error('Insert failed (RLS or Schema?):', insertError.message)
    } else {
        console.log('Insert successful:', insertData)

        // Test 3: Try to Delete the dummy promotion (Test RLS for Delete)
        if (insertData && insertData.length > 0) {
            const idToDelete = insertData[0].id
            console.log('Attempting to delete test promotion id:', idToDelete)

            const { error: deleteError } = await supabase
                .from('promotions')
                .delete()
                .eq('id', idToDelete)

            if (deleteError) {
                console.error('Delete failed:', deleteError.message)
            } else {
                console.log('Delete successful')
            }
        }
    }
}

test()
