
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

async function diagnose() {
    console.log('--- Supabase Diagnostic ---')
    console.log('URL:', supabaseUrl ? 'Set' : 'MISSING')
    console.log('Key:', supabaseServiceKey ? 'Set' : 'MISSING')

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Error: Missing env vars')
        return
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('\nChecking table "auth_requests"...')
    try {
        const { data, error } = await supabase
            .from('auth_requests')
            .select('*')
            .limit(1)

        if (error) {
            console.error('❌ Supabase Error:', error.message)
            console.error('Code:', error.code)
            if (error.code === '42P01') {
                console.error('Suggestion: The table "auth_requests" does not exist in the database.')
            }
        } else {
            console.log('✅ Table "auth_requests" exists and is accessible.')
            console.log('Sample data:', data)
        }
    } catch (e: any) {
        console.error('❌ Unexpected Error:', e.message)
    }
}

diagnose()
