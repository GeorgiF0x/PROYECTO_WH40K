import { Suspense } from 'react'
import { Metadata } from 'next'
import EventSubmitForm from './EventSubmitForm'

export const metadata: Metadata = {
  title: 'Crear Evento | Chronus Eventus',
  description: 'Registra un nuevo evento de Warhammer 40K en el Chronus Imperial.',
}

export default function NuevoEventoPage() {
  return (
    <div className="min-h-screen px-6 pb-16 pt-24">
      <Suspense fallback={<div className="text-center text-bone/60">Cargando...</div>}>
        <EventSubmitForm />
      </Suspense>
    </div>
  )
}
