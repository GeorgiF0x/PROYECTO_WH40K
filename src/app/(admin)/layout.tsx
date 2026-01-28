import type { ReactNode } from 'react'

export default function AdminLayout({ children }: { children: ReactNode }) {
  // No Navigation, no Footer - just the dashboard shell
  return <>{children}</>
}
