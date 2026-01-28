import { Suspense } from 'react'
import { Metadata } from 'next'
import EventSubmitForm from './EventSubmitForm'

export const metadata: Metadata = {
  title: 'Crear Evento | Chronus Eventus',
  description: 'Registra un nuevo evento de Warhammer 40K en el Chronus Imperial.'
}

export default function NuevoEventoPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <Suspense fallback={<div className="text-bone/60 text-center">Cargando...</div>}>
        <EventSubmitForm />
      </Suspense>
    </div>
  )
}
