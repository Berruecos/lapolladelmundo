import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ujwldxfneypyvoiqyiov.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_TxZzHQaP4hSH0i536CWLkw_3F_NyVMr'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
