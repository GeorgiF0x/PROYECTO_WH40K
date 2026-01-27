import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Store } from '@/lib/types/database.types'
import StoreDetail from '@/components/community/StoreDetail'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getStore(slug: string): Promise<Store | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'approved')
    .single()

  if (error || !data) return null
  return data as Store
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const store = await getStore(slug)
  if (!store) {
    return { title: 'Tienda no encontrada | Forge of War' }
  }
  return {
    title: `${store.name} — Tienda | Forge of War`,
    description: store.description || `Tienda de hobby ${store.name} en ${store.city}`,
  }
}

export default async function StoreSlugPage({ params }: PageProps) {
  const { slug } = await params
  const store = await getStore(slug)

  if (!store) {
    notFound()
  }

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Cartographic grid background */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(201,162,39,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,162,39,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <StoreDetail store={store} userId={userId} />
      </div>
    </div>
  )
}
