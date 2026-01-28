import { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Cookie, Database, BarChart3, Settings, ArrowLeft, ScrollText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Política de Cookies | Administratum Imperial',
  description: 'Decreto oficial sobre el uso de archivos de datos (cookies) en el dominio Grimdark Legion',
}

export default function CookiesPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-bone/50 hover:text-gold transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Forge
        </Link>

        {/* Header */}
        <div className="relative bg-void-light border border-gold/30 rounded-lg overflow-hidden mb-8">
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-gold/50" />
          <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-gold/50" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-gold/50" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-gold/50" />

          <div className="bg-gold/10 border-b border-gold/20 px-6 py-3 flex items-center gap-3">
            <Shield className="w-5 h-5 text-gold" />
            <span className="text-sm font-bold text-gold uppercase tracking-wider">
              Decreto Oficial del Administratum
            </span>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gold/10 rounded-lg border border-gold/20">
                <Cookie className="w-8 h-8 text-gold" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-bone">
                  Política de Cookies
                </h1>
                <p className="text-sm text-bone/50 mt-1">
                  Ref: ADMINISTRATUM/COOKIES/M41.999 | Última actualización: 28.01.026.M3
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          <Section
            icon={ScrollText}
            title="I. Preámbulo Imperial"
            id="preambulo"
          >
            <p>
              Por la autoridad conferida por el Administratum Imperial y en cumplimiento de las
              regulaciones terrenales conocidas como RGPD (Reglamento General de Protección de Datos)
              y LSSI-CE (Ley de Servicios de la Sociedad de la Información), se decreta el presente
              documento que regula el uso de archivos de datos, comúnmente conocidos como "cookies",
              en el dominio <strong className="text-gold">grimdarklegion.com</strong>.
            </p>
            <p>
              Todo ciudadano imperial que acceda a este dominio queda sujeto a las disposiciones
              aquí establecidas. El desconocimiento de este decreto no exime de su cumplimiento.
            </p>
          </Section>

          <Section
            icon={Database}
            title="II. ¿Qué son las Cookies?"
            id="que-son"
          >
            <p>
              Las cookies son pequeños archivos de datos que se almacenan en tu dispositivo
              (cogitador personal, dataslate o terminal vox) cuando visitas un sitio web.
              Estos archivos permiten al sitio recordar información sobre tu visita, como
              tu idioma preferido, credenciales de acceso y otras configuraciones.
            </p>
            <p>
              Las cookies pueden ser "propias" (establecidas por este dominio) o "de terceros"
              (establecidas por servicios externos que utilizamos).
            </p>
          </Section>

          <Section
            icon={Cookie}
            title="III. Tipos de Cookies que Utilizamos"
            id="tipos"
          >
            <div className="space-y-4">
              <CookieType
                name="Cookies Esenciales"
                purpose="Funcionamiento del Servicio"
                duration="Sesión / 1 año"
                required
              >
                <ul className="list-disc list-inside space-y-1 text-bone/70">
                  <li><code className="text-gold text-xs">sb-*-auth-token</code> - Autenticación de Supabase</li>
                  <li><code className="text-gold text-xs">grimdark-legion-cookies-accepted</code> - Preferencias de cookies</li>
                </ul>
              </CookieType>

              <CookieType
                name="Cookies de Análisis"
                purpose="Estadísticas y Mejora"
                duration="2 años"
              >
                <ul className="list-disc list-inside space-y-1 text-bone/70">
                  <li><code className="text-gold text-xs">_ga, _gid</code> - Google Analytics (si está activo)</li>
                  <li>Nos ayudan a entender cómo los usuarios interactúan con el sitio</li>
                </ul>
              </CookieType>

              <CookieType
                name="Cookies de Preferencias"
                purpose="Personalización"
                duration="1 año"
              >
                <ul className="list-disc list-inside space-y-1 text-bone/70">
                  <li>Tema visual preferido</li>
                  <li>Configuración de galería y filtros</li>
                  <li>Preferencias de notificaciones</li>
                </ul>
              </CookieType>
            </div>
          </Section>

          <Section
            icon={Settings}
            title="IV. Gestión de Cookies"
            id="gestion"
          >
            <p>
              Puedes gestionar tus preferencias de cookies en cualquier momento:
            </p>
            <ul className="list-disc list-inside space-y-2 text-bone/70 mt-4">
              <li>
                <strong className="text-bone">Banner de consentimiento:</strong> Al visitar el sitio por primera vez,
                puedes elegir aceptar todas las cookies o solo las esenciales.
              </li>
              <li>
                <strong className="text-bone">Configuración del navegador:</strong> Puedes configurar tu navegador
                para bloquear o eliminar cookies. Consulta la ayuda de tu navegador para más información.
              </li>
              <li>
                <strong className="text-bone">Eliminar datos:</strong> Para eliminar tu consentimiento, borra
                las cookies de este sitio en tu navegador.
              </li>
            </ul>
            <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-sm text-amber-400">
                <strong>Advertencia:</strong> Bloquear las cookies esenciales puede impedir el correcto
                funcionamiento del sitio, incluyendo el inicio de sesión y otras funcionalidades básicas.
              </p>
            </div>
          </Section>

          <Section
            icon={BarChart3}
            title="V. Servicios de Terceros"
            id="terceros"
          >
            <p>
              Utilizamos los siguientes servicios de terceros que pueden establecer sus propias cookies:
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
          </Section>

          <Section
            icon={Shield}
            title="VI. Tus Derechos"
            id="derechos"
          >
            <p>
              De acuerdo con el RGPD, tienes derecho a:
            </p>
            <ul className="list-disc list-inside space-y-2 text-bone/70 mt-4">
              <li>Acceder a los datos que tenemos sobre ti</li>
              <li>Rectificar datos incorrectos</li>
              <li>Solicitar la eliminación de tus datos</li>
              <li>Oponerte al procesamiento de tus datos</li>
              <li>Portabilidad de datos</li>
            </ul>
            <p className="mt-4">
              Para ejercer estos derechos, contacta con nosotros en:{' '}
              <a href="mailto:contacto@grimdarklegion.com" className="text-gold hover:underline">
                contacto@grimdarklegion.com
              </a>
            </p>
          </Section>

          {/* Footer seal */}
          <div className="mt-12 pt-8 border-t border-gold/20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/20 rounded-lg">
              <Shield className="w-4 h-4 text-gold" />
              <span className="text-xs text-gold tracking-wider">SELLO DEL ADMINISTRATUM</span>
            </div>
            <p className="text-[10px] text-bone/30 mt-4 tracking-wider">
              ++ DOCUMENTO OFICIAL ++ CUMPLIMIENTO RGPD ++ AVE IMPERATOR ++
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({
  icon: Icon,
  title,
  id,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  id: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gold/10 rounded border border-gold/20">
          <Icon className="w-5 h-5 text-gold" />
        </div>
        <h2 className="text-xl font-bold text-bone">{title}</h2>
      </div>
      <div className="pl-12 space-y-4 text-bone/80 leading-relaxed">
        {children}
      </div>
    </section>
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
    <div className="p-4 bg-bone/5 border border-bone/10 rounded-lg">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-semibold text-bone">{name}</h4>
          <p className="text-sm text-bone/50">{purpose}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-bone/40">{duration}</span>
          {required && (
            <span className="text-[10px] px-1.5 py-0.5 bg-gold/20 text-gold rounded">
              REQUERIDO
            </span>
          )}
        </div>
      </div>
      <div className="text-sm">{children}</div>
    </div>
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
    <div className="flex items-center justify-between p-3 bg-bone/5 rounded-lg">
      <div>
        <span className="font-medium text-bone">{name}</span>
        <span className="text-bone/50 text-sm ml-2">- {purpose}</span>
      </div>
      <a
        href={policy}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-gold hover:underline"
      >
        Política
      </a>
    </div>
  )
}
