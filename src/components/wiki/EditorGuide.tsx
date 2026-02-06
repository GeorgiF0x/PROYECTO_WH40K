'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  BookOpen,
  Quote,
  AlertTriangle,
  AlertCircle,
  Info,
  Shield,
  Heading1,
  Heading2,
  Heading3,
  Type,
  List,
  ListOrdered,
  Image,
  Bold,
  Italic,
  Link,
  Code,
  Lightbulb,
  type LucideIcon,
} from 'lucide-react'

interface GuideSection {
  id: string
  title: string
  icon: LucideIcon
  content: React.ReactNode
}

function SectionToggle({
  section,
  isOpen,
  onToggle,
}: {
  section: GuideSection
  isOpen: boolean
  onToggle: () => void
}) {
  const Icon = section.icon
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 py-2.5 px-3 rounded-lg text-left hover:bg-imperial-gold/5 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Icon className="w-4 h-4 shrink-0" style={{ color: 'rgba(201,162,39,0.6)' }} />
          <span className="text-sm font-medium text-bone/80">{section.title}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-bone/40" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 text-sm text-bone/60 leading-relaxed">
              {section.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function BlockItem({
  icon: Icon,
  name,
  desc,
  color,
}: {
  icon: LucideIcon
  name: string
  desc: string
  color?: string
}) {
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      <Icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: color || 'rgba(201,162,39,0.6)' }} />
      <div>
        <span className="text-bone/80 font-medium">{name}</span>
        <span className="text-bone/40 ml-1.5">— {desc}</span>
      </div>
    </div>
  )
}

function AlertSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: color }} />
      <span className="text-bone/70">{label}</span>
    </div>
  )
}

export function EditorGuide({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['basics']))

  function toggleSection(id: string) {
    setOpenSections(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const sections: GuideSection[] = [
    {
      id: 'basics',
      title: 'Comandos Basicos',
      icon: Type,
      content: (
        <div className="space-y-1">
          <p className="mb-2 text-bone/50 font-mono text-xs">
            Escribe <kbd className="px-1.5 py-0.5 rounded bg-imperial-gold/10 border border-imperial-gold/20 text-imperial-gold/80 font-mono text-[11px]">/</kbd> para ver todos los bloques disponibles
          </p>
          <BlockItem icon={Heading1} name="Encabezado 1" desc="Markdown: # + Espacio" />
          <BlockItem icon={Heading2} name="Encabezado 2" desc="Markdown: ## + Espacio" />
          <BlockItem icon={Heading3} name="Encabezado 3" desc="Markdown: ### + Espacio" />
          <BlockItem icon={Type} name="Parrafo" desc="Texto normal por defecto" />
          <BlockItem icon={List} name="Lista con viñetas" desc="Markdown: - + Espacio" />
          <BlockItem icon={ListOrdered} name="Lista numerada" desc="Markdown: 1. + Espacio" />
          <BlockItem icon={Image} name="Imagen" desc="Arrastra o usa /imagen" />
        </div>
      ),
    },
    {
      id: 'imperial',
      title: 'Bloques Imperiales',
      icon: BookOpen,
      content: (
        <div className="space-y-1">
          <BlockItem icon={BookOpen} name="Bloque de Lore" desc="Seccion decorada para narrativa de lore" />
          <BlockItem icon={Quote} name="Bloque de Cita" desc="Cita con atribucion de autor" />
        </div>
      ),
    },
    {
      id: 'alerts',
      title: 'Alertas',
      icon: AlertTriangle,
      content: (
        <div className="space-y-1">
          <p className="mb-2 text-bone/50 text-xs">4 tipos de alerta con estilos unicos:</p>
          <AlertSwatch color="#DC2626" label="Herejia — Advertencia de contenido hereje" />
          <AlertSwatch color="#EA580C" label="Peligro — Aviso de peligro" />
          <AlertSwatch color="#14B8A6" label="Info — Nota informativa" />
          <AlertSwatch color="#C9A227" label="Decreto Imperial — Decreto del Emperador" />
        </div>
      ),
    },
    {
      id: 'formatting',
      title: 'Formato de Texto',
      icon: Bold,
      content: (
        <div className="space-y-1">
          <p className="mb-2 text-bone/50 text-xs">Selecciona texto para ver la barra de formato</p>
          <BlockItem icon={Bold} name="Negrita" desc="Ctrl+B" />
          <BlockItem icon={Italic} name="Cursiva" desc="Ctrl+I" />
          <BlockItem icon={Link} name="Enlace" desc="Ctrl+K" />
          <BlockItem icon={Code} name="Codigo" desc="Ctrl+E" />
        </div>
      ),
    },
    {
      id: 'images',
      title: 'Imagenes',
      icon: Image,
      content: (
        <div className="space-y-2">
          <p className="text-bone/50 text-xs">
            Escribe <kbd className="px-1.5 py-0.5 rounded bg-imperial-gold/10 border border-imperial-gold/20 text-imperial-gold/80 font-mono text-[11px]">/</kbd> y selecciona <span className="text-bone/80">Imagen</span>, o arrastra una imagen directamente al editor.
          </p>
          <p className="text-bone/50 text-xs">
            Las imagenes se comprimen automaticamente y se suben a Supabase Storage.
          </p>
        </div>
      ),
    },
    {
      id: 'tips',
      title: 'Consejos para Buenas Entradas',
      icon: Lightbulb,
      content: (
        <ul className="space-y-1.5 text-xs list-none">
          <li className="flex items-start gap-2">
            <span className="text-imperial-gold/50 mt-0.5 shrink-0">+</span>
            <span>Usa un titulo descriptivo y claro</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-imperial-gold/50 mt-0.5 shrink-0">+</span>
            <span>Comienza con un extracto que resuma el contenido</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-imperial-gold/50 mt-0.5 shrink-0">+</span>
            <span>Usa bloques de Lore para narrativa extensa</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-imperial-gold/50 mt-0.5 shrink-0">+</span>
            <span>Anade alertas para informacion importante</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-imperial-gold/50 mt-0.5 shrink-0">+</span>
            <span>Incluye imagenes de referencia</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-imperial-gold/50 mt-0.5 shrink-0">+</span>
            <span>Revisa antes de publicar</span>
          </li>
        </ul>
      ),
    },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
        >
          <div
            className="border-t px-4 py-4 space-y-1"
            style={{
              borderColor: 'rgba(201,162,39,0.15)',
              background: 'rgba(201,162,39,0.03)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[10px] text-imperial-gold/50 tracking-[0.2em] uppercase">
                GUIA DEL EDITOR
              </span>
              <button
                type="button"
                onClick={onClose}
                className="text-[10px] font-mono text-bone/30 hover:text-bone/60 transition-colors"
              >
                CERRAR
              </button>
            </div>
            <div className="divide-y divide-bone/5">
              {sections.map(section => (
                <SectionToggle
                  key={section.id}
                  section={section}
                  isOpen={openSections.has(section.id)}
                  onToggle={() => toggleSection(section.id)}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
