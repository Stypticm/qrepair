import { createClient } from '@supabase/supabase-js'

// ТОЛЬКО для серверных операций (API роуты)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)

// НЕ ИСПОЛЬЗУЙТЕ ЭТОТ КЛИЕНТ В КЛИЕНТСКОМ КОДЕ!
// Используйте API роуты вместо прямого доступа к Supabase
