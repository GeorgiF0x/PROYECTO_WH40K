'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
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
  Clock,
} from 'lucide-react'

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-void via-amber-950/5 to-void">
      {/* Background decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/3 -right-32 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/3 -left-32 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl"
          animate={{ scale: [1.3, 1, 1.3], opacity: [0.4, 0.2, 0.4] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-amber-400/70 hover:text-amber-400 transition-colors mb-8 group"
          >
            <motion.span whileHover={{ x: -4 }} transition={{ type: 'spring', stiffness: 400 }}>
              <ArrowLeft className="w-4 h-4" />
            </motion.span>
            Volver al Forge
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative bg-gradient-to-br from-amber-950/80 via-amber-900/60 to-amber-950/80 border-2 border-amber-500/40 rounded-2xl overflow-hidden mb-10"
        >
          {/* Animated scan line */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-amber-400/5 via-transparent to-transparent h-20"
            animate={{ y: ['-100%', '500%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />

          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-8 h-8 border-l-3 border-t-3 border-amber-400" />
          <div className="absolute top-0 right-0 w-8 h-8 border-r-3 border-t-3 border-amber-400" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-l-3 border-b-3 border-amber-400" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-r-3 border-b-3 border-amber-400" />

          <div className="bg-amber-500/15 border-b border-amber-500/30 px-6 py-3 flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Shield className="w-5 h-5 text-amber-400" />
            </motion.div>
            <span className="text-sm font-bold text-amber-300 uppercase tracking-wider">
              Decreto de Protección de Datos
            </span>
          </div>

          <div className="p-6 md:p-8 relative">
            <div className="flex items-center gap-5">
              <motion.div
                className="p-4 bg-amber-500/20 rounded-xl border border-amber-500/30"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Eye className="w-10 h-10 text-amber-400" />
              </motion.div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-amber-100">
                  Política de Privacidad
                </h1>
                <p className="text-sm text-amber-400/60 mt-1">
                  Ref: ADMINISTRATUM/PRIVACY/M41.999 | Última actualización: 28.01.026.M3
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="space-y-10">
          <AnimatedSection
            icon={FileText}
            title="I. Información General"
            id="info"
            delay={0.2}
          >
            <p>
              En cumplimiento del Reglamento (UE) 2016/679 del Parlamento Europeo (<span className="text-amber-400">RGPD</span>) y la
              Ley Orgánica 3/2018 de Protección de Datos Personales (<span className="text-amber-400">LOPDGDD</span>), te informamos
              sobre el tratamiento de tus datos personales en <strong className="text-amber-300">Grimdark Legion</strong>.
            </p>
            <motion.div
              className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl"
              whileHover={{ scale: 1.01 }}
            >
              <h4 className="font-semibold text-amber-200 mb-2">Responsable del Tratamiento</h4>
              <ul className="space-y-1 text-sm text-amber-300/70">
                <li><strong className="text-amber-200">Nombre:</strong> Grimdark Legion</li>
                <li><strong className="text-amber-200">Email:</strong> contacto@grimdarklegion.com</li>
                <li><strong className="text-amber-200">Sitio web:</strong> https://grimdarklegion.com</li>
              </ul>
            </motion.div>
          </AnimatedSection>

          <AnimatedSection
            icon={Database}
            title="II. Datos que Recopilamos"
            id="datos"
            delay={0.3}
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
          </AnimatedSection>

          <AnimatedSection
            icon={Lock}
            title="III. Finalidad del Tratamiento"
            id="finalidad"
            delay={0.4}
          >
            <p>
              Tus datos personales son tratados para las siguientes finalidades:
            </p>
            <ul className="list-disc list-inside space-y-2 text-amber-200/70 mt-4">
              <li>
                <strong className="text-amber-200">Prestación del servicio:</strong> Gestión de tu cuenta,
                publicación de contenido, comunicación entre usuarios.
              </li>
              <li>
                <strong className="text-amber-200">Mejora del servicio:</strong> Análisis de uso para
                mejorar la plataforma y detectar problemas técnicos.
              </li>
              <li>
                <strong className="text-amber-200">Seguridad:</strong> Prevención de fraude, abuso y
                cumplimiento de nuestras normas de comunidad.
              </li>
              <li>
                <strong className="text-amber-200">Comunicaciones:</strong> Notificaciones sobre tu cuenta,
                actualizaciones importantes del servicio.
              </li>
            </ul>
          </AnimatedSection>

          <AnimatedSection
            icon={Server}
            title="IV. Base Legal"
            id="base-legal"
            delay={0.5}
          >
            <p>
              El tratamiento de tus datos se basa en:
            </p>
            <ul className="list-disc list-inside space-y-2 text-amber-200/70 mt-4">
              <li>
                <strong className="text-amber-200">Ejecución de contrato:</strong> Necesario para
                prestarte el servicio al que te has registrado (Art. 6.1.b RGPD).
              </li>
              <li>
                <strong className="text-amber-200">Consentimiento:</strong> Para cookies no esenciales
                y comunicaciones opcionales (Art. 6.1.a RGPD).
              </li>
              <li>
                <strong className="text-amber-200">Interés legítimo:</strong> Para seguridad y mejora
                del servicio (Art. 6.1.f RGPD).
              </li>
            </ul>
          </AnimatedSection>

          <AnimatedSection
            icon={Globe}
            title="V. Compartición de Datos"
            id="comparticion"
            delay={0.6}
          >
            <p>
              Tus datos pueden ser compartidos con:
            </p>
            <div className="mt-4 space-y-3">
              <ThirdParty name="Supabase (PostgreSQL)" purpose="Almacenamiento de datos y autenticación" location="UE/EE.UU." />
              <ThirdParty name="Vercel" purpose="Alojamiento de la aplicación" location="EE.UU." />
              <ThirdParty name="Mapbox" purpose="Mapas para tiendas y eventos" location="EE.UU." />
            </div>
            <motion.div
              className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl"
              whileHover={{ scale: 1.01 }}
            >
              <p className="text-sm text-amber-300/80">
                <strong className="text-amber-200">Nota:</strong> No vendemos ni alquilamos tus datos
                personales a terceros. Solo compartimos datos cuando es necesario para
                proporcionar el servicio o cuando la ley lo requiere.
              </p>
            </motion.div>
          </AnimatedSection>

          <AnimatedSection
            icon={UserCheck}
            title="VI. Tus Derechos"
            id="derechos"
            delay={0.7}
          >
            <p>
              Como ciudadano de la UE, tienes los siguientes derechos sobre tus datos:
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <Right title="Acceso" description="Solicitar una copia de tus datos personales" />
              <Right title="Rectificación" description="Corregir datos inexactos o incompletos" />
              <Right title="Supresión" description="Solicitar la eliminación de tus datos" />
              <Right title="Limitación" description="Restringir el procesamiento de tus datos" />
              <Right title="Portabilidad" description="Recibir tus datos en formato estructurado" />
              <Right title="Oposición" description="Oponerte a ciertos tipos de procesamiento" />
            </div>
            <p className="mt-4">
              Para ejercer estos derechos, contacta con nosotros en:{' '}
              <a href="mailto:contacto@grimdarklegion.com" className="text-amber-400 hover:text-amber-300 underline underline-offset-2">
                contacto@grimdarklegion.com
              </a>
            </p>
            <p className="mt-2 text-amber-400/60 text-sm">
              Responderemos a tu solicitud en un plazo máximo de 30 días.
            </p>
          </AnimatedSection>

          <AnimatedSection
            icon={Clock}
            title="VII. Retención de Datos"
            id="retencion"
            delay={0.8}
          >
            <p>
              Conservamos tus datos personales mientras tu cuenta esté activa. Si decides
              eliminar tu cuenta:
            </p>
            <ul className="list-disc list-inside space-y-2 text-amber-200/70 mt-4">
              <li>Tu perfil y datos personales serán eliminados inmediatamente</li>
              <li>El contenido que hayas publicado (miniaturas, comentarios) se anonimizará</li>
              <li>Los datos de facturación se conservarán según requisitos legales (si aplica)</li>
              <li>Los logs técnicos se eliminan automáticamente después de 90 días</li>
            </ul>
          </AnimatedSection>

          <AnimatedSection
            icon={Mail}
            title="VIII. Contacto y Reclamaciones"
            id="contacto"
            delay={0.9}
          >
            <p>
              Si tienes preguntas sobre esta política o quieres ejercer tus derechos:
            </p>
            <motion.div
              className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl"
              whileHover={{ scale: 1.01 }}
            >
              <p className="text-amber-200">
                <strong>Email:</strong>{' '}
                <a href="mailto:contacto@grimdarklegion.com" className="text-amber-400 hover:text-amber-300 underline underline-offset-2">
                  contacto@grimdarklegion.com
                </a>
              </p>
            </motion.div>
            <p className="mt-4 text-amber-300/70">
              Si consideras que no hemos atendido adecuadamente tus derechos, puedes presentar
              una reclamación ante la{' '}
              <a
                href="https://www.aepd.es"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 underline underline-offset-2"
              >
                Agencia Española de Protección de Datos (AEPD)
              </a>.
            </p>
          </AnimatedSection>

          {/* Footer seal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 pt-8 border-t border-amber-500/20 text-center"
          >
            <motion.div
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500/10 border border-amber-500/30 rounded-xl"
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(251, 191, 36, 0.2)' }}
            >
              <Shield className="w-5 h-5 text-amber-400" />
              <span className="text-sm text-amber-300 tracking-wider font-medium">SELLO DEL ADMINISTRATUM</span>
            </motion.div>
            <p className="text-[11px] text-amber-500/50 mt-4 tracking-[0.2em]">
              ++ DOCUMENTO OFICIAL ++ PROTECCIÓN DE DATOS ++ TUS DATOS, TU CONTROL ++
            </p>

            {/* Related links */}
            <div className="flex items-center justify-center gap-6 mt-6">
              <Link
                href="/legal/cookies"
                className="text-sm text-amber-400/70 hover:text-amber-400 transition-colors"
              >
                Política de Cookies
              </Link>
            </div>
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
      <div className="flex items-center gap-3 mb-5">
        <motion.div
          className="p-2.5 bg-amber-500/15 rounded-lg border border-amber-500/30"
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <Icon className="w-5 h-5 text-amber-400" />
        </motion.div>
        <h2 className="text-xl font-bold text-amber-100">{title}</h2>
      </div>
      <div className="pl-14 space-y-4 text-amber-200/80 leading-relaxed">
        {children}
      </div>
    </motion.section>
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
    <motion.div
      className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl"
      whileHover={{ scale: 1.01, borderColor: 'rgba(251, 191, 36, 0.4)' }}
    >
      <h4 className="font-semibold text-amber-200 mb-3">{title}</h4>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            viewport={{ once: true }}
            className="text-sm text-amber-300/70 flex items-start gap-2"
          >
            <span className="text-amber-400 mt-0.5">•</span>
            {item}
          </motion.li>
        ))}
      </ul>
    </motion.div>
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
    <motion.div
      className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl"
      whileHover={{ scale: 1.01, borderColor: 'rgba(251, 191, 36, 0.4)' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="font-medium text-amber-200">{name}</span>
          <p className="text-sm text-amber-400/60 mt-0.5">{purpose}</p>
        </div>
        <span className="text-xs text-amber-400/50 bg-amber-500/10 px-2 py-1 rounded">{location}</span>
      </div>
    </motion.div>
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
    <motion.div
      className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl"
      whileHover={{ scale: 1.02, borderColor: 'rgba(251, 191, 36, 0.4)' }}
    >
      <h4 className="font-semibold text-amber-200 text-sm">{title}</h4>
      <p className="text-xs text-amber-400/60 mt-1">{description}</p>
    </motion.div>
  )
}
