'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { Shield, Cookie, Database, BarChart3, Settings, ArrowLeft, ScrollText } from 'lucide-react'

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-void via-amber-950/5 to-void pb-16 pt-24">
      {/* Background decorative elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-32 top-1/4 h-64 w-64 rounded-full bg-amber-500/5 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute -right-32 bottom-1/4 h-64 w-64 rounded-full bg-amber-500/5 blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="relative mx-auto max-w-4xl px-6">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/"
            className="group mb-8 inline-flex items-center gap-2 text-sm text-amber-400/70 transition-colors hover:text-amber-400"
          >
            <motion.span whileHover={{ x: -4 }} transition={{ type: 'spring', stiffness: 400 }}>
              <ArrowLeft className="h-4 w-4" />
            </motion.span>
            Volver al Forge
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative mb-10 overflow-hidden rounded-2xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-950/80 via-amber-900/60 to-amber-950/80"
        >
          {/* Animated scan line */}
          <motion.div
            className="absolute inset-0 h-20 bg-gradient-to-b from-amber-400/5 via-transparent to-transparent"
            animate={{ y: ['-100%', '500%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />

          {/* Corner brackets */}
          <div className="border-l-3 border-t-3 absolute left-0 top-0 h-8 w-8 border-amber-400" />
          <div className="border-r-3 border-t-3 absolute right-0 top-0 h-8 w-8 border-amber-400" />
          <div className="border-l-3 border-b-3 absolute bottom-0 left-0 h-8 w-8 border-amber-400" />
          <div className="border-r-3 border-b-3 absolute bottom-0 right-0 h-8 w-8 border-amber-400" />

          <div className="flex items-center gap-3 border-b border-amber-500/30 bg-amber-500/15 px-6 py-3">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Shield className="h-5 w-5 text-amber-400" />
            </motion.div>
            <span className="text-sm font-bold uppercase tracking-wider text-amber-300">
              Decreto Oficial del Administratum
            </span>
          </div>

          <div className="relative p-6 md:p-8">
            <div className="flex items-center gap-5">
              <motion.div
                className="rounded-xl border border-amber-500/30 bg-amber-500/20 p-4"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Cookie className="h-10 w-10 text-amber-400" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-amber-100 md:text-3xl">
                  Política de Cookies
                </h1>
                <p className="mt-1 text-sm text-amber-400/60">
                  Ref: ADMINISTRATUM/COOKIES/M41.999 | Última actualización: 28.01.026.M3
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="space-y-10">
          <AnimatedSection
            icon={ScrollText}
            title="I. Preámbulo Imperial"
            id="preambulo"
            delay={0.2}
          >
            <p>
              Por la autoridad conferida por el Administratum Imperial y en cumplimiento de las
              regulaciones terrenales conocidas como <span className="text-amber-400">RGPD</span>{' '}
              (Reglamento General de Protección de Datos) y{' '}
              <span className="text-amber-400">LSSI-CE</span> (Ley de Servicios de la Sociedad de la
              Información), se decreta el presente documento que regula el uso de archivos de datos
              en el dominio <strong className="text-amber-300">grimdarklegion.com</strong>.
            </p>
            <p>
              Todo ciudadano imperial que acceda a este dominio queda sujeto a las disposiciones
              aquí establecidas. El desconocimiento de este decreto no exime de su cumplimiento.
            </p>
          </AnimatedSection>

          <AnimatedSection
            icon={Database}
            title="II. ¿Qué son las Cookies?"
            id="que-son"
            delay={0.3}
          >
            <p>
              Las cookies son pequeños archivos de datos que se almacenan en tu dispositivo
              (cogitador personal, dataslate o terminal vox) cuando visitas un sitio web. Estos
              archivos permiten al sitio recordar información sobre tu visita, como tu idioma
              preferido, credenciales de acceso y otras configuraciones.
            </p>
            <p>
              Las cookies pueden ser "propias" (establecidas por este dominio) o "de terceros"
              (establecidas por servicios externos que utilizamos).
            </p>
          </AnimatedSection>

          <AnimatedSection
            icon={Cookie}
            title="III. Tipos de Cookies que Utilizamos"
            id="tipos"
            delay={0.4}
          >
            <div className="space-y-4">
              <CookieType
                name="Cookies Esenciales"
                purpose="Funcionamiento del Servicio"
                duration="Sesión / 1 año"
                required
              >
                <ul className="list-inside list-disc space-y-1 text-amber-200/70">
                  <li>
                    <code className="rounded bg-amber-500/10 px-1 text-xs text-amber-400">
                      sb-*-auth-token
                    </code>{' '}
                    - Autenticación de Supabase
                  </li>
                  <li>
                    <code className="rounded bg-amber-500/10 px-1 text-xs text-amber-400">
                      grimdark-legion-cookies-accepted
                    </code>{' '}
                    - Preferencias de cookies
                  </li>
                </ul>
              </CookieType>

              <CookieType
                name="Cookies de Análisis"
                purpose="Estadísticas y Mejora"
                duration="2 años"
              >
                <ul className="list-inside list-disc space-y-1 text-amber-200/70">
                  <li>
                    <code className="rounded bg-amber-500/10 px-1 text-xs text-amber-400">
                      _ga, _gid
                    </code>{' '}
                    - Google Analytics (si está activo)
                  </li>
                  <li>Nos ayudan a entender cómo los usuarios interactúan con el sitio</li>
                </ul>
              </CookieType>

              <CookieType name="Cookies de Preferencias" purpose="Personalización" duration="1 año">
                <ul className="list-inside list-disc space-y-1 text-amber-200/70">
                  <li>Tema visual preferido</li>
                  <li>Configuración de galería y filtros</li>
                  <li>Preferencias de notificaciones</li>
                </ul>
              </CookieType>
            </div>
          </AnimatedSection>

          <AnimatedSection icon={Settings} title="IV. Gestión de Cookies" id="gestion" delay={0.5}>
            <p>Puedes gestionar tus preferencias de cookies en cualquier momento:</p>
            <ul className="mt-4 list-inside list-disc space-y-2 text-amber-200/70">
              <li>
                <strong className="text-amber-200">Banner de consentimiento:</strong> Al visitar el
                sitio por primera vez, puedes elegir aceptar todas las cookies o solo las
                esenciales.
              </li>
              <li>
                <strong className="text-amber-200">Configuración del navegador:</strong> Puedes
                configurar tu navegador para bloquear o eliminar cookies.
              </li>
              <li>
                <strong className="text-amber-200">Eliminar datos:</strong> Para eliminar tu
                consentimiento, borra las cookies de este sitio en tu navegador.
              </li>
            </ul>
            <motion.div
              className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4"
              whileHover={{ scale: 1.01 }}
            >
              <p className="text-sm text-amber-300">
                <strong>Advertencia:</strong> Bloquear las cookies esenciales puede impedir el
                correcto funcionamiento del sitio, incluyendo el inicio de sesión.
              </p>
            </motion.div>
          </AnimatedSection>

          <AnimatedSection
            icon={BarChart3}
            title="V. Servicios de Terceros"
            id="terceros"
            delay={0.6}
          >
            <p>
              Utilizamos los siguientes servicios de terceros que pueden establecer sus propias
              cookies:
            </p>
            <div className="mt-4 space-y-3">
              <ThirdPartyService
                name="Supabase"
                purpose="Autenticación y base de datos"
                policy="https://supabase.com/privacy"
              />
              <ThirdPartyService
                name="Vercel"
                purpose="Alojamiento y análisis"
                policy="https://vercel.com/legal/privacy-policy"
              />
              <ThirdPartyService
                name="Mapbox"
                purpose="Mapas interactivos"
                policy="https://www.mapbox.com/legal/privacy"
              />
            </div>
          </AnimatedSection>

          <AnimatedSection icon={Shield} title="VI. Tus Derechos" id="derechos" delay={0.7}>
            <p>De acuerdo con el RGPD, tienes derecho a:</p>
            <ul className="mt-4 list-inside list-disc space-y-2 text-amber-200/70">
              <li>Acceder a los datos que tenemos sobre ti</li>
              <li>Rectificar datos incorrectos</li>
              <li>Solicitar la eliminación de tus datos</li>
              <li>Oponerte al procesamiento de tus datos</li>
              <li>Portabilidad de datos</li>
            </ul>
            <p className="mt-4">
              Para ejercer estos derechos, contacta con nosotros en:{' '}
              <a
                href="mailto:contacto@grimdarklegion.com"
                className="text-amber-400 underline underline-offset-2 hover:text-amber-300"
              >
                contacto@grimdarklegion.com
              </a>
            </p>
          </AnimatedSection>

          {/* Footer seal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 border-t border-amber-500/20 pt-8 text-center"
          >
            <motion.div
              className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-6 py-3"
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(251, 191, 36, 0.2)' }}
            >
              <Shield className="h-5 w-5 text-amber-400" />
              <span className="text-sm font-medium tracking-wider text-amber-300">
                SELLO DEL ADMINISTRATUM
              </span>
            </motion.div>
            <p className="mt-4 text-[11px] tracking-[0.2em] text-amber-500/50">
              ++ DOCUMENTO OFICIAL ++ CUMPLIMIENTO RGPD ++ AVE IMPERATOR ++
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function AnimatedSection({
  icon: Icon,
  title,
  id,
  delay = 0,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  id: string
  delay?: number
  children: React.ReactNode
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay }}
      className="scroll-mt-24"
    >
      <div className="mb-5 flex items-center gap-3">
        <motion.div
          className="rounded-lg border border-amber-500/30 bg-amber-500/15 p-2.5"
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <Icon className="h-5 w-5 text-amber-400" />
        </motion.div>
        <h2 className="text-xl font-bold text-amber-100">{title}</h2>
      </div>
      <div className="space-y-4 pl-14 leading-relaxed text-amber-200/80">{children}</div>
    </motion.section>
  )
}

function CookieType({
  name,
  purpose,
  duration,
  required = false,
  children,
}: {
  name: string
  purpose: string
  duration: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <motion.div
      className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4"
      whileHover={{ scale: 1.01, borderColor: 'rgba(251, 191, 36, 0.4)' }}
    >
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-amber-200">{name}</h4>
          <p className="text-sm text-amber-400/60">{purpose}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-amber-400/50">{duration}</span>
          {required && (
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-300">
              REQUERIDO
            </span>
          )}
        </div>
      </div>
      <div className="text-sm">{children}</div>
    </motion.div>
  )
}

function ThirdPartyService({
  name,
  purpose,
  policy,
}: {
  name: string
  purpose: string
  policy: string
}) {
  return (
    <motion.div
      className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 p-4"
      whileHover={{ scale: 1.01, borderColor: 'rgba(251, 191, 36, 0.4)' }}
    >
      <div>
        <span className="font-medium text-amber-200">{name}</span>
        <span className="ml-2 text-sm text-amber-400/60">- {purpose}</span>
      </div>
      <a
        href={policy}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-amber-400 underline underline-offset-2 hover:text-amber-300"
      >
        Ver política
      </a>
    </motion.div>
  )
}
