'use client'

import StoreSubmitForm from '@/components/community/StoreSubmitForm'

export default function NuevaTiendaPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Cartographic grid bg */}
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

      <div className="relative z-10 px-6">
        <StoreSubmitForm />
      </div>
    </div>
  )
}
