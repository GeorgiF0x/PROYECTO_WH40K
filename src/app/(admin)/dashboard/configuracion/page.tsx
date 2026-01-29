'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  Shield,
  Bell,
  Globe,
  Database,
  Key,
  Mail,
  Map,
  Palette,
  Lock,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SettingSection {
  id: string
  title: string
  description: string
  icon: typeof Settings
  color: string
  items: SettingItem[]
}

interface SettingItem {
  id: string
  label: string
  description: string
  type: 'toggle' | 'info' | 'link'
  value?: boolean
  href?: string
  status?: 'configured' | 'pending' | 'error'
}

const SETTINGS_SECTIONS: SettingSection[] = [
  {
    id: 'auth',
    title: 'Autenticación',
    description: 'Configuración de login y registro',
    icon: Shield,
    color: 'text-blue-400',
    items: [
      {
        id: 'supabase-auth',
        label: 'Supabase Auth',
        description: 'Gestión de usuarios y sesiones',
        type: 'link',
        href: 'https://supabase.com/dashboard/project/yvjflhvbtjjmdwkgqqfs/auth/users',
        status: 'configured',
      },
      {
        id: 'email-templates',
        label: 'Plantillas de Email',
        description: 'Personalizar emails de registro y recuperación',
        type: 'link',
        href: 'https://supabase.com/dashboard/project/yvjflhvbtjjmdwkgqqfs/auth/templates',
        status: 'pending',
      },
      {
        id: 'discord-oauth',
        label: 'Discord OAuth',
        description: 'Login con Discord',
        type: 'info',
        status: 'error',
      },
      {
        id: 'google-oauth',
        label: 'Google OAuth',
        description: 'Login con Google',
        type: 'info',
        status: 'configured',
      },
    ],
  },
  {
    id: 'security',
    title: 'Seguridad',
    description: 'Protección y captcha',
    icon: Lock,
    color: 'text-red-400',
    items: [
      {
        id: 'turnstile',
        label: 'Cloudflare Turnstile',
        description: 'Captcha para formularios',
        type: 'info',
        status: 'pending',
      },
      {
        id: 'rate-limiting',
        label: 'Rate Limiting',
        description: 'Límites de peticiones por IP',
        type: 'info',
        status: 'pending',
      },
    ],
  },
  {
    id: 'integrations',
    title: 'Integraciones',
    description: 'Servicios externos',
    icon: Globe,
    color: 'text-green-400',
    items: [
      {
        id: 'mapbox',
        label: 'Mapbox',
        description: 'Mapas interactivos',
        type: 'info',
        status: 'configured',
      },
      {
        id: 'openai',
        label: 'OpenAI',
        description: 'Embeddings para búsqueda semántica',
        type: 'info',
        status: 'configured',
      },
      {
        id: 'vercel',
        label: 'Vercel',
        description: 'Hosting y deployment',
        type: 'link',
        href: 'https://vercel.com/dashboard',
        status: 'configured',
      },
    ],
  },
  {
    id: 'database',
    title: 'Base de Datos',
    description: 'Supabase y PostgreSQL',
    icon: Database,
    color: 'text-purple-400',
    items: [
      {
        id: 'supabase-db',
        label: 'Supabase Dashboard',
        description: 'Panel de control de la base de datos',
        type: 'link',
        href: 'https://supabase.com/dashboard/project/yvjflhvbtjjmdwkgqqfs',
        status: 'configured',
      },
      {
        id: 'migrations',
        label: 'Migraciones Pendientes',
        description: 'Scripts SQL sin ejecutar',
        type: 'info',
        status: 'pending',
      },
    ],
  },
  {
    id: 'notifications',
    title: 'Notificaciones',
    description: 'Emails y alertas',
    icon: Bell,
    color: 'text-amber-400',
    items: [
      {
        id: 'email-provider',
        label: 'Proveedor de Email',
        description: 'Configurar Resend o similar',
        type: 'info',
        status: 'pending',
      },
      {
        id: 'push-notifications',
        label: 'Push Notifications',
        description: 'Notificaciones del navegador',
        type: 'info',
        status: 'pending',
      },
    ],
  },
]

const STATUS_STYLES = {
  configured: { color: 'text-green-500', bg: 'bg-green-500/10', label: 'Configurado' },
  pending: { color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Pendiente' },
  error: { color: 'text-red-500', bg: 'bg-red-500/10', label: 'Error' },
}

export default function SettingsPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>('auth')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-bone flex items-center gap-3">
          <Settings className="w-7 h-7 text-bone/70" />
          Configuración del Sistema
        </h1>
        <p className="text-bone/50 mt-1">
          Gestiona las integraciones y configuración de la plataforma
        </p>
      </div>

      {/* Warning Banner */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-amber-400 font-medium">Zona de Administración</p>
          <p className="text-xs text-amber-400/70 mt-1">
            Los cambios en esta sección pueden afectar al funcionamiento de toda la plataforma.
            Algunos ajustes requieren acceso directo a los paneles de control externos.
          </p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        {SETTINGS_SECTIONS.map((section, idx) => {
          const Icon = section.icon
          const isExpanded = expandedSection === section.id
          const configuredCount = section.items.filter(i => i.status === 'configured').length
          const pendingCount = section.items.filter(i => i.status === 'pending').length
          const errorCount = section.items.filter(i => i.status === 'error').length

          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-void-light border border-bone/10 rounded-lg overflow-hidden"
            >
              {/* Section Header */}
              <button
                onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                className="w-full p-4 flex items-center gap-4 hover:bg-bone/5 transition-colors"
              >
                <div className={cn('p-2.5 rounded-lg bg-current/10', section.color)}>
                  <Icon className={cn('w-5 h-5', section.color)} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-bone">{section.title}</h3>
                  <p className="text-sm text-bone/50">{section.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {configuredCount > 0 && (
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-xs rounded">
                      {configuredCount} OK
                    </span>
                  )}
                  {pendingCount > 0 && (
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-xs rounded">
                      {pendingCount} Pendiente
                    </span>
                  )}
                  {errorCount > 0 && (
                    <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-xs rounded">
                      {errorCount} Error
                    </span>
                  )}
                </div>
              </button>

              {/* Section Items */}
              {isExpanded && (
                <div className="border-t border-bone/10">
                  {section.items.map((item) => {
                    const statusStyle = item.status ? STATUS_STYLES[item.status] : null

                    return (
                      <div
                        key={item.id}
                        className="p-4 flex items-center gap-4 border-b border-bone/5 last:border-b-0"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-bone">{item.label}</p>
                            {statusStyle && (
                              <span className={cn('px-2 py-0.5 text-xs rounded', statusStyle.bg, statusStyle.color)}>
                                {statusStyle.label}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-bone/50 mt-0.5">{item.description}</p>
                        </div>

                        {item.type === 'link' && item.href && (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-1.5 bg-bone/5 border border-bone/10 rounded-lg text-sm text-bone/70 hover:text-bone hover:bg-bone/10 transition-colors"
                          >
                            Abrir
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        {item.type === 'info' && (
                          <div className="p-2 bg-bone/5 rounded-lg">
                            <Info className="w-4 h-4 text-bone/40" />
                          </div>
                        )}

                        {item.type === 'toggle' && (
                          <button
                            className={cn(
                              'relative w-12 h-6 rounded-full transition-colors',
                              item.value ? 'bg-green-500' : 'bg-bone/20'
                            )}
                          >
                            <span
                              className={cn(
                                'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                                item.value ? 'left-7' : 'left-1'
                              )}
                            />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Environment Info */}
      <div className="p-4 bg-bone/5 border border-bone/10 rounded-lg">
        <h3 className="text-sm font-medium text-bone mb-3 flex items-center gap-2">
          <Key className="w-4 h-4 text-bone/50" />
          Variables de Entorno
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span className="text-bone/50">NEXT_PUBLIC_SUPABASE_URL</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span className="text-bone/50">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span className="text-bone/50">NEXT_PUBLIC_MAPBOX_TOKEN</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span className="text-bone/50">OPENAI_API_KEY</span>
          </div>
        </div>
        <p className="text-xs text-bone/40 mt-3">
          Las variables de entorno están configuradas en Vercel y .env.local
        </p>
      </div>
    </div>
  )
}
