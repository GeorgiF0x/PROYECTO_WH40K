import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - List all wiki categories
export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('wiki_categories')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Wiki categories fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Wiki categories GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
