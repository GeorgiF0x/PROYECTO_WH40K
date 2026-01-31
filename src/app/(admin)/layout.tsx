import { Metadata } from 'next'
import '../globals.css'
import './dashboard/dashboard.css'

export const metadata: Metadata = {
  title: 'Dashboard | Warhammer Forge',
  description: 'Panel de administración de Warhammer Forge',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
