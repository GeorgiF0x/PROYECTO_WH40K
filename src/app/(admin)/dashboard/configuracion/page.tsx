'use client'

import * as React from 'react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  Globe,
  Bell,
  Shield,
  Database,
  Mail,
  Palette,
  Users,
  Image,
  ShoppingBag,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Save,
  RefreshCw,
  ExternalLink,
  Key,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Zap,
} from 'lucide-react'
import { Button } from '../components/ui/button'

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════

interface SettingSection {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
}

interface ToggleSetting {
  id: string
  label: string
  description: string
  enabled: boolean
}

// ══════════════════════════════════════════════════════════════
// MOCK DATA
// ══════════════════════════════════════════════════════════════

const sections: SettingSection[] = [
  {
    id: 'general',
    title: 'General',
    description: 'Configuracion general de la plataforma',
    icon: <Globe className="h-5 w-5" />,
    color: 'bg-blue-500/10 text-blue-500',
  },
  {
    id: 'notifications',
    title: 'Notificaciones',
    description: 'Alertas y notificaciones del sistema',
    icon: <Bell className="h-5 w-5" />,
    color: 'bg-amber-500/10 text-amber-500',
  },
  {
    id: 'security',
    title: 'Seguridad',
    description: 'Autenticacion y permisos',
    icon: <Shield className="h-5 w-5" />,
    color: 'bg-emerald-500/10 text-emerald-500',
  },
  {
    id: 'integrations',
    title: 'Integraciones',
    description: 'Servicios externos y APIs',
    icon: <Zap className="h-5 w-5" />,
    color: 'bg-purple-500/10 text-purple-500',
  },
]

// ══════════════════════════════════════════════════════════════
// COMPONENTS
// ══════════════════════════════════════════════════════════════

function SettingCard({
  children,
  title,
  description,
  icon,
  action,
}: {
  children: React.ReactNode
  title: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">
      <div className="flex items-start justify-between border-b border-zinc-800/50 p-5">
        <div className="flex items-start gap-3">
          {icon && <div className="rounded-lg bg-white/5 p-2">{icon}</div>}
          <div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            {description && <p className="mt-0.5 text-xs text-zinc-500">{description}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function ToggleSwitch({
  enabled,
  onChange,
  disabled,
}: {
  enabled: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-blue-500' : 'bg-zinc-700'
      } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

function SettingToggle({
  label,
  description,
  enabled,
  onChange,
  disabled,
}: {
  label: string
  description?: string
  enabled: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="min-w-0 flex-1 pr-4">
        <p className="text-sm font-medium text-white">{label}</p>
        {description && <p className="mt-0.5 text-xs text-zinc-500">{description}</p>}
      </div>
      <ToggleSwitch enabled={enabled} onChange={onChange} disabled={disabled} />
    </div>
  )
}

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled,
  secret,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  disabled?: boolean
  secret?: boolean
}) {
  const [showSecret, setShowSecret] = useState(false)

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-300">{label}</label>
      <div className="relative">
        <input
          type={secret && !showSecret ? 'password' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/20 disabled:opacity-50"
        />
        {secret && (
          <button
            type="button"
            onClick={() => setShowSecret(!showSecret)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
          >
            {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  )
}

function ApiKeyDisplay({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  const masked = value.slice(0, 8) + '•'.repeat(24) + value.slice(-4)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-300">{label}</label>
      <div className="flex items-center gap-2">
        <div className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 font-mono text-sm text-zinc-400">
          {masked}
        </div>
        <button
          onClick={handleCopy}
          className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-2.5 text-zinc-400 transition-colors hover:border-zinc-600 hover:text-white"
        >
          {copied ? (
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// CONFIGURACION PAGE
// ══════════════════════════════════════════════════════════════

export default function ConfiguracionPage() {
  const [activeSection, setActiveSection] = useState('general')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Settings state
  const [settings, setSettings] = useState({
    // General
    siteName: 'Grimdark Legion',
    siteDescription: 'La comunidad de Warhammer 40K en español',
    maintenanceMode: false,
    registrationOpen: true,

    // Notifications
    emailNotifications: true,
    adminAlerts: true,
    newUserNotification: true,
    reportNotification: true,

    // Security
    requireEmailVerification: true,
    twoFactorAuth: false,
    maxLoginAttempts: 5,
    sessionTimeout: 7,

    // Content
    autoApproveContent: false,
    maxImagesPerListing: 10,
    maxImageSize: 5,
    allowedImageTypes: 'jpg, png, webp',

    // Integrations
    supabaseUrl: 'https://yvjflhvbtjjmdwkgqqfs.supabase.co',
    vercelAnalytics: true,
    cloudflareImages: true,
  })

  const handleSave = async () => {
    setSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const updateSetting = (key: string, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Configuracion</h1>
          <p className="text-sm text-zinc-400">Ajustes generales de la plataforma</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-sm text-emerald-500"
            >
              <CheckCircle className="h-4 w-4" />
              Guardado
            </motion.div>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar cambios
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav className="sticky top-6 space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                  activeSection === section.id
                    ? 'bg-white/5 text-white'
                    : 'text-zinc-400 hover:bg-white/[0.02] hover:text-white'
                }`}
              >
                <div className={`rounded-lg p-2 ${section.color}`}>{section.icon}</div>
                <div>
                  <p className="text-sm font-medium">{section.title}</p>
                  <p className="text-xs text-zinc-500">{section.description}</p>
                </div>
              </button>
            ))}
          </nav>

          {/* Quick Links */}
          <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Enlaces rapidos
            </h4>
            <div className="space-y-2">
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
              >
                <Database className="h-4 w-4" />
                Supabase Dashboard
                <ExternalLink className="ml-auto h-3 w-3" />
              </a>
              <a
                href="https://vercel.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
              >
                <Zap className="h-4 w-4" />
                Vercel Dashboard
                <ExternalLink className="ml-auto h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="space-y-6 lg:col-span-3">
          {/* General Settings */}
          {activeSection === 'general' && (
            <>
              <SettingCard
                title="Informacion del sitio"
                description="Datos basicos de la plataforma"
                icon={<Globe className="h-4 w-4 text-blue-500" />}
              >
                <div className="space-y-4">
                  <InputField
                    label="Nombre del sitio"
                    value={settings.siteName}
                    onChange={(v) => updateSetting('siteName', v)}
                  />
                  <InputField
                    label="Descripcion"
                    value={settings.siteDescription}
                    onChange={(v) => updateSetting('siteDescription', v)}
                  />
                </div>
              </SettingCard>

              <SettingCard
                title="Estado del sistema"
                description="Control de acceso a la plataforma"
                icon={<Settings className="h-4 w-4 text-zinc-400" />}
              >
                <div className="divide-y divide-zinc-800/50">
                  <SettingToggle
                    label="Modo mantenimiento"
                    description="Desactiva el acceso publico temporalmente"
                    enabled={settings.maintenanceMode}
                    onChange={(v) => updateSetting('maintenanceMode', v)}
                  />
                  <SettingToggle
                    label="Registro abierto"
                    description="Permite que nuevos usuarios se registren"
                    enabled={settings.registrationOpen}
                    onChange={(v) => updateSetting('registrationOpen', v)}
                  />
                </div>
              </SettingCard>

              <SettingCard
                title="Contenido"
                description="Limites y configuracion de contenido"
                icon={<Image className="h-4 w-4 text-emerald-500" />}
              >
                <div className="space-y-4">
                  <SettingToggle
                    label="Auto-aprobar contenido"
                    description="Publica automaticamente sin revision manual"
                    enabled={settings.autoApproveContent}
                    onChange={(v) => updateSetting('autoApproveContent', v)}
                  />
                  <div className="grid grid-cols-2 gap-4 border-t border-zinc-800/50 pt-4">
                    <InputField
                      label="Max imagenes por anuncio"
                      value={settings.maxImagesPerListing.toString()}
                      onChange={(v) => updateSetting('maxImagesPerListing', parseInt(v) || 0)}
                      type="number"
                    />
                    <InputField
                      label="Tamaño max imagen (MB)"
                      value={settings.maxImageSize.toString()}
                      onChange={(v) => updateSetting('maxImageSize', parseInt(v) || 0)}
                      type="number"
                    />
                  </div>
                </div>
              </SettingCard>
            </>
          )}

          {/* Notifications Settings */}
          {activeSection === 'notifications' && (
            <SettingCard
              title="Alertas de administrador"
              description="Configura cuando recibir notificaciones"
              icon={<Bell className="h-4 w-4 text-amber-500" />}
            >
              <div className="divide-y divide-zinc-800/50">
                <SettingToggle
                  label="Notificaciones por email"
                  description="Recibe alertas importantes por correo"
                  enabled={settings.emailNotifications}
                  onChange={(v) => updateSetting('emailNotifications', v)}
                />
                <SettingToggle
                  label="Alertas de administrador"
                  description="Notificaciones de eventos criticos"
                  enabled={settings.adminAlerts}
                  onChange={(v) => updateSetting('adminAlerts', v)}
                />
                <SettingToggle
                  label="Nuevos usuarios"
                  description="Notificar cuando se registra un usuario"
                  enabled={settings.newUserNotification}
                  onChange={(v) => updateSetting('newUserNotification', v)}
                />
                <SettingToggle
                  label="Reportes de contenido"
                  description="Notificar cuando se reporta contenido"
                  enabled={settings.reportNotification}
                  onChange={(v) => updateSetting('reportNotification', v)}
                />
              </div>
            </SettingCard>
          )}

          {/* Security Settings */}
          {activeSection === 'security' && (
            <>
              <SettingCard
                title="Autenticacion"
                description="Configuracion de seguridad de cuentas"
                icon={<Lock className="h-4 w-4 text-emerald-500" />}
              >
                <div className="divide-y divide-zinc-800/50">
                  <SettingToggle
                    label="Verificacion de email obligatoria"
                    description="Los usuarios deben verificar su email"
                    enabled={settings.requireEmailVerification}
                    onChange={(v) => updateSetting('requireEmailVerification', v)}
                  />
                  <SettingToggle
                    label="Autenticacion de dos factores"
                    description="Habilitar 2FA para administradores"
                    enabled={settings.twoFactorAuth}
                    onChange={(v) => updateSetting('twoFactorAuth', v)}
                  />
                </div>
              </SettingCard>

              <SettingCard
                title="Sesiones"
                description="Control de sesiones de usuario"
                icon={<Key className="h-4 w-4 text-purple-500" />}
              >
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Intentos de login maximos"
                    value={settings.maxLoginAttempts.toString()}
                    onChange={(v) => updateSetting('maxLoginAttempts', parseInt(v) || 0)}
                    type="number"
                  />
                  <InputField
                    label="Duracion sesion (dias)"
                    value={settings.sessionTimeout.toString()}
                    onChange={(v) => updateSetting('sessionTimeout', parseInt(v) || 0)}
                    type="number"
                  />
                </div>
              </SettingCard>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
                  <div>
                    <h4 className="text-sm font-medium text-amber-500">Zona de peligro</h4>
                    <p className="mt-1 text-xs text-zinc-400">
                      Las acciones en esta seccion pueden afectar permanentemente a la plataforma.
                      Asegurate de tener backups antes de realizar cambios criticos.
                    </p>
                    <div className="mt-4 flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
                      >
                        Limpiar cache
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                      >
                        Reiniciar sesiones
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Integrations Settings */}
          {activeSection === 'integrations' && (
            <>
              <SettingCard
                title="Supabase"
                description="Base de datos y autenticacion"
                icon={<Database className="h-4 w-4 text-emerald-500" />}
                action={
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Conectado
                  </span>
                }
              >
                <div className="space-y-4">
                  <InputField
                    label="Supabase URL"
                    value={settings.supabaseUrl}
                    onChange={(v) => updateSetting('supabaseUrl', v)}
                    disabled
                  />
                  <ApiKeyDisplay
                    label="Anon Key"
                    value="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxx"
                  />
                </div>
              </SettingCard>

              <SettingCard
                title="Vercel"
                description="Hosting y analytics"
                icon={<Zap className="h-4 w-4 text-white" />}
                action={
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Conectado
                  </span>
                }
              >
                <div className="divide-y divide-zinc-800/50">
                  <SettingToggle
                    label="Vercel Analytics"
                    description="Recopila metricas de trafico y rendimiento"
                    enabled={settings.vercelAnalytics}
                    onChange={(v) => updateSetting('vercelAnalytics', v)}
                  />
                  <SettingToggle
                    label="Vercel Speed Insights"
                    description="Monitoriza Core Web Vitals"
                    enabled={true}
                    onChange={() => {}}
                  />
                </div>
              </SettingCard>

              <SettingCard
                title="Cloudflare"
                description="CDN y optimizacion de imagenes"
                icon={<Image className="h-4 w-4 text-orange-500" />}
                action={
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Conectado
                  </span>
                }
              >
                <SettingToggle
                  label="Cloudflare Images"
                  description="Optimizacion automatica de imagenes"
                  enabled={settings.cloudflareImages}
                  onChange={(v) => updateSetting('cloudflareImages', v)}
                />
              </SettingCard>

              <SettingCard
                title="Otras integraciones"
                description="Servicios adicionales disponibles"
                icon={<Settings className="h-4 w-4 text-zinc-400" />}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="cursor-pointer rounded-lg border border-white/5 bg-white/[0.02] p-4 transition-colors hover:border-white/10">
                    <div className="mb-2 flex items-center gap-3">
                      <Mail className="h-5 w-5 text-blue-500" />
                      <span className="text-sm font-medium text-white">Resend</span>
                    </div>
                    <p className="text-xs text-zinc-500">Emails transaccionales</p>
                    <span className="mt-2 inline-block text-xs text-zinc-600">No configurado</span>
                  </div>
                  <div className="cursor-pointer rounded-lg border border-white/5 bg-white/[0.02] p-4 transition-colors hover:border-white/10">
                    <div className="mb-2 flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium text-white">Discord</span>
                    </div>
                    <p className="text-xs text-zinc-500">Webhooks y OAuth</p>
                    <span className="mt-2 inline-block text-xs text-zinc-600">No configurado</span>
                  </div>
                </div>
              </SettingCard>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
