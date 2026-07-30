import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envVars = fs.readFileSync('.env', 'utf8')
  .split('\n')
  .filter(line => line.trim() !== '' && !line.startsWith('#'))
  .reduce((acc, line) => {
    const [key, ...val] = line.split('=')
    acc[key.trim()] = val.join('=').trim().replace(/^"|"$/g, '')
    return acc
  }, {})

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function test() {
  const { data, error } = await supabase
    .from('citas')
    .select('*')
    .limit(1)

  console.log('Error:', error)
  console.log('Columns:', data?.[0] ? Object.keys(data[0]) : 'No data')
}

test()
