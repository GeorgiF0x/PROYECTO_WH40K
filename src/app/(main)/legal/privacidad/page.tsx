import { Metadata } from 'next'
import Link from 'next/link'
import {
  Shield,
  Eye,
  Lock,
  Database,
  Globe,
  UserCheck,
  Mail,
  ArrowLeft,
  FileText,
  Server,
  AlertTriangle,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Política de Privacidad | Administratum Imperial',
  description: 'Decreto oficial sobre la protección de datos personales en el dominio Grimdark Legion',
}

export default function PrivacidadPage() {
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
              Decreto de Protección de Datos
            </span>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gold/10 rounded-lg border border-gold/20">
                <Eye className="w-8 h-8 text-gold" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-bone">
                  Política de Privacidad
                </h1>
                <p className="text-sm text-bone/50 mt-1">
                  Ref: ADMINISTRATUM/PRIVACY/M41.999 | Última actualización: 28.01.026.M3
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          <Section
            icon={FileText}
            title="I. Información General"
            id="info"
          >
            <p>
              En cumplimiento del Reglamento (UE) 2016/679 del Parlamento Europeo (RGPD) y la
              Ley Orgánica 3/2018 de Protección de Datos Personales (LOPDGDD), te informamos
              sobre el tratamiento de tus datos personales en <strong className="text-gold">Grimdark Legion</strong>.
            </p>
            <div className="mt-4 p-4 bg-bone/5 border border-bone/10 rounded-lg">
              <h4 className="font-semibold text-bone mb-2">Responsable del Tratamiento</h4>
              <ul className="space-y-1 text-sm text-bone/70">
                <li><strong>Nombre:</strong> Grimdark Legion</li>
                <li><strong>Email:</strong> contacto@grimdarklegion.com</li>
                <li><strong>Sitio web:</strong> https://grimdarklegion.com</li>
              </ul>
            </div>
          </Section>

          <Section
            icon={Database}
            title="II. Datos que Recopilamos"
            id="datos"
          >
            <p>
              Recopilamos los siguientes tipos de datos personales:
            </p>
            <div className="mt-4 space-y-3">
              <DataCategory
                title="Datos de Registro"
                items={[
                  'Email (requerido para crear cuenta)',
                  'Nombre de usuario (requerido)',
                  'Contraseña (almacenada de forma encriptada)',
                  'Nombre para mostrar (opcional)',
                  'Avatar (opcional)',
                ]}
              />
              <DataCategory
                title="Datos de Perfil"
                items={[
                  'Biografía',
                  'Ubicación',
                  'Enlaces a redes sociales',
                  'Facciones favoritas',
                ]}
              />
              <DataCategory
                title="Contenido Generado"
                items={[
                  'Imágenes de miniaturas',
                  'Descripciones y títulos',
                  'Comentarios',
                  'Anuncios del mercado',
                  'Información de tiendas',
                ]}
              />
              <DataCategory
                title="Datos Técnicos"
                items={[
                  'Dirección IP',
                  'Tipo de navegador',
                  'Datos de cookies (ver Política de Cookies)',
                ]}
              />
            </div>
          </Section>

          <Section
            icon={Lock}
            title="III. Finalidad del Tratamiento"
            id="finalidad"
          >
            <p>
              Tus datos personales son tratados para las siguientes finalidades:
            </p>
            <ul className="list-disc list-inside space-y-2 text-bone/70 mt-4">
              <li>
                <strong className="text-bone">Prestación del servicio:</strong> Gestión de tu cuenta,
                publicación de contenido, comunicación entre usuarios.
              </li>
              <li>
                <strong className="text-bone">Mejora del servicio:</strong> Análisis de uso para
                mejorar la plataforma y detectar problemas técnicos.
              </li>
              <li>
                <strong className="text-bone">Seguridad:</strong> Prevención de fraude, abuso y
                cumplimiento de nuestras normas de comunidad.
              </li>
              <li>
                <strong className="text-bone">Comunicaciones:</strong> Notificaciones sobre tu cuenta,
                actualizaciones importantes del servicio.
              </li>
            </ul>
          </Section>

          <Section
            icon={Server}
            title="IV. Base Legal"
            id="base-legal"
          >
            <p>
              El tratamiento de tus datos se basa en:
            </p>
            <ul className="list-disc list-inside space-y-2 text-bone/70 mt-4">
              <li>
                <strong className="text-bone">Ejecución de contrato:</strong> Necesario para
                prestarte el servicio al que te has registrado (Art. 6.1.b RGPD).
              </li>
              <li>
                <strong className="text-bone">Consentimiento:</strong> Para cookies no esenciales
                y comunicaciones opcionales (Art. 6.1.a RGPD).
              </li>
              <li>
                <strong className="text-bone">Interés legítimo:</strong> Para seguridad y mejora
                del servicio (Art. 6.1.f RGPD).
              </li>
            </ul>
          </Section>

          <Section
            icon={Globe}
            title="V. Compartición de Datos"
            id="comparticion"
          >
            <p>
              Tus datos pueden ser compartidos con:
            </p>
            <div className="mt-4 space-y-3">
              <ThirdParty
                name="Supabase (PostgreSQL)"
                purpose="Almacenamiento de datos y autenticación"
                location="UE/EE.UU. (cláusulas contractuales tipo)"
              />
              <ThirdParty
                name="Vercel"
                purpose="Alojamiento de la aplicación"
                location="EE.UU. (cláusulas contractuales tipo)"
              />
              <ThirdParty
                name="Mapbox"
                purpose="Mapas para tiendas y eventos"
                location="EE.UU."
              />
            </div>
            <div className="mt-4 p-4 bg-bone/5 border border-bone/10 rounded-lg">
              <p className="text-sm text-bone/70">
                <strong className="text-bone">Nota:</strong> No vendemos ni alquilamos tus datos
                personales a terceros. Solo compartimos datos cuando es necesario para
                proporcionar el servicio o cuando la ley lo requiere.
              </p>
            </div>
          </Section>

          <Section
            icon={UserCheck}
            title="VI. Tus Derechos"
            id="derechos"
          >
            <p>
              Como ciudadano de la UE, tienes los siguientes derechos sobre tus datos:
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <Right
                title="Acceso"
                description="Solicitar una copia de tus datos personales"
              />
              <Right
                title="Rectificación"
                description="Corregir datos inexactos o incompletos"
              />
              <Right
                title="Supresión"
                description="Solicitar la eliminación de tus datos"
              />
              <Right
                title="Limitación"
                description="Restringir el procesamiento de tus datos"
              />
              <Right
                title="Portabilidad"
                description="Recibir tus datos en formato estructurado"
              />
              <Right
                title="Oposición"
                description="Oponerte a ciertos tipos de procesamiento"
              />
            </div>
            <p className="mt-4">
              Para ejercer estos derechos, contacta con nosotros en:{' '}
              <a href="mailto:contacto@grimdarklegion.com" className="text-gold hover:underline">
                contacto@grimdarklegion.com
              </a>
            </p>
            <p className="mt-2 text-bone/70 text-sm">
              Responderemos a tu solicitud en un plazo máximo de 30 días.
            </p>
          </Section>

          <Section
            icon={AlertTriangle}
            title="VII. Retención de Datos"
            id="retencion"
          >
            <p>
              Conservamos tus datos personales mientras tu cuenta esté activa. Si decides
              eliminar tu cuenta:
            </p>
            <ul className="list-disc list-inside space-y-2 text-bone/70 mt-4">
              <li>Tu perfil y datos personales serán eliminados inmediatamente</li>
              <li>El contenido que hayas publicado (miniaturas, comentarios) se anonimizará</li>
              <li>Los datos de facturación se conservarán según requisitos legales (si aplica)</li>
              <li>Los logs técnicos se eliminan automáticamente después de 90 días</li>
            </ul>
          </Section>

          <Section
            icon={Mail}
            title="VIII. Contacto y Reclamaciones"
            id="contacto"
          >
            <p>
              Si tienes preguntas sobre esta política o quieres ejercer tus derechos:
            </p>
            <div className="mt-4 p-4 bg-bone/5 border border-bone/10 rounded-lg">
              <p className="text-bone">
                <strong>Email:</strong>{' '}
                <a href="mailto:contacto@grimdarklegion.com" className="text-gold hover:underline">
                  contacto@grimdarklegion.com
                </a>
              </p>
            </div>
            <p className="mt-4 text-bone/70">
              Si consideras que no hemos atendido adecuadamente tus derechos, puedes presentar
              una reclamación ante la{' '}
              <a
                href="https://www.aepd.es"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:underline"
              >
                Agencia Española de Protección de Datos (AEPD)
              </a>.
            </p>
          </Section>

          {/* Footer seal */}
          <div className="mt-12 pt-8 border-t border-gold/20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/20 rounded-lg">
              <Shield className="w-4 h-4 text-gold" />
              <span className="text-xs text-gold tracking-wider">SELLO DEL ADMINISTRATUM</span>
            </div>
            <p className="text-[10px] text-bone/30 mt-4 tracking-wider">
              ++ DOCUMENTO OFICIAL ++ PROTECCIÓN DE DATOS ++ TUS DATOS, TU CONTROL ++
            </p>

            {/* Related links */}
            <div className="flex items-center justify-center gap-6 mt-6">
              <Link
                href="/legal/cookies"
                className="text-sm text-bone/50 hover:text-gold transition-colors"
              >
                Política de Cookies
              </Link>
            </div>
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

function DataCategory({
  title,
  items,
}: {
  title: string
  items: string[]
}) {
  return (
    <div className="p-4 bg-bone/5 border border-bone/10 rounded-lg">
      <h4 className="font-semibold text-bone mb-2">{title}</h4>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-bone/70 flex items-start gap-2">
            <span className="text-gold mt-1">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ThirdParty({
  name,
  purpose,
  location,
}: {
  name: string
  purpose: string
  location: string
}) {
  return (
    <div className="p-3 bg-bone/5 border border-bone/10 rounded-lg">
      <div className="flex items-start justify-between">
        <div>
          <span className="font-medium text-bone">{name}</span>
          <p className="text-sm text-bone/50">{purpose}</p>
        </div>
        <span className="text-xs text-bone/40">{location}</span>
      </div>
    </div>
  )
}

function Right({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="p-3 bg-bone/5 border border-bone/10 rounded-lg">
      <h4 className="font-semibold text-bone text-sm">{title}</h4>
      <p className="text-xs text-bone/50 mt-1">{description}</p>
    </div>
  )
}
