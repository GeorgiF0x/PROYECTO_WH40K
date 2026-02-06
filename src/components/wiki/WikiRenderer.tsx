'use client'

import Link from 'next/link'
import type { WikiContent, TiptapContent, TiptapNode, TiptapMark } from '@/lib/supabase/wiki.types'
import { QuoteBlock, WarningBlock, ImageBlock, LoreBlock } from './blocks'
import { cn } from '@/lib/utils'

interface WikiRendererProps {
  content: WikiContent
  factionColor?: string
  className?: string
}

export function WikiRenderer({ content, factionColor = '#C9A227', className }: WikiRendererProps) {
  if (!content) return null

  // BlockNote format
  if (content.type === 'blocknote' && Array.isArray(content.blocks)) {
    return (
      <article className={cn('wiki-content', className)}>
        {content.blocks.map((block, index) => (
          <RenderBlockNoteBlock key={index} block={block as BlockNoteBlock} factionColor={factionColor} />
        ))}
      </article>
    )
  }

  // Tiptap (legacy) format
  const tiptapContent = content as TiptapContent
  if (!tiptapContent?.content) return null

  return (
    <article className={cn('wiki-content', className)}>
      {tiptapContent.content.map((node, index) => (
        <RenderNode key={index} node={node} factionColor={factionColor} />
      ))}
    </article>
  )
}

// =============================================================================
// BLOCKNOTE RENDERER
// =============================================================================

interface BlockNoteBlock {
  id?: string
  type: string
  props?: Record<string, unknown>
  content?: BlockNoteInlineContent[] | BlockNoteBlock[]
  children?: BlockNoteBlock[]
}

interface BlockNoteInlineContent {
  type: string
  text?: string
  styles?: Record<string, unknown>
  href?: string
  content?: BlockNoteInlineContent[]
}

function RenderBlockNoteBlock({ block, factionColor }: { block: BlockNoteBlock; factionColor: string }) {
  const children = block.children?.length ? (
    <div className="pl-6">
      {block.children.map((child, i) => (
        <RenderBlockNoteBlock key={i} block={child} factionColor={factionColor} />
      ))}
    </div>
  ) : null

  switch (block.type) {
    case 'paragraph':
      return (
        <>
          <p className="font-body text-bone/85 leading-relaxed mb-4">
            <RenderBlockNoteInlineContent content={block.content as BlockNoteInlineContent[]} factionColor={factionColor} />
          </p>
          {children}
        </>
      )

    case 'heading': {
      const level = (block.props?.level as number) || 1
      return (
        <>
          <RenderBNHeading level={level} factionColor={factionColor}>
            <RenderBlockNoteInlineContent content={block.content as BlockNoteInlineContent[]} factionColor={factionColor} />
          </RenderBNHeading>
          {children}
        </>
      )
    }

    case 'bulletListItem':
      return (
        <ul className="list-disc list-inside mb-2 space-y-1 font-body text-bone/85">
          <li>
            <RenderBlockNoteInlineContent content={block.content as BlockNoteInlineContent[]} factionColor={factionColor} />
            {children}
          </li>
        </ul>
      )

    case 'numberedListItem':
      return (
        <ol className="list-decimal list-inside mb-2 space-y-1 font-body text-bone/85">
          <li>
            <RenderBlockNoteInlineContent content={block.content as BlockNoteInlineContent[]} factionColor={factionColor} />
            {children}
          </li>
        </ol>
      )

    case 'checkListItem':
      return (
        <div className="flex items-start gap-2 mb-2 font-body text-bone/85">
          <input
            type="checkbox"
            checked={block.props?.checked as boolean}
            readOnly
            className="mt-1 accent-imperial-gold"
          />
          <span>
            <RenderBlockNoteInlineContent content={block.content as BlockNoteInlineContent[]} factionColor={factionColor} />
          </span>
          {children}
        </div>
      )

    case 'image':
      return (
        <>
          <ImageBlock
            src={(block.props?.url as string) || ''}
            alt={(block.props?.name as string) || ''}
            caption={block.props?.caption as string}
            factionColor={factionColor}
          />
          {children}
        </>
      )

    case 'codeBlock':
      return (
        <>
          <pre
            className="my-4 p-4 rounded-lg bg-void-dark overflow-x-auto"
            style={{ border: `1px solid ${factionColor}20` }}
          >
            <code className="font-mono text-sm text-bone/90">
              {block.props?.code as string}
            </code>
          </pre>
          {children}
        </>
      )

    // Custom blocks
    case 'alertBlock':
      return (
        <>
          <WarningBlock
            type={(block.props?.alertType as 'heresy' | 'danger' | 'info' | 'imperial') || 'info'}
            title={block.props?.title as string}
          >
            <RenderBlockNoteInlineContent content={block.content as BlockNoteInlineContent[]} factionColor={factionColor} />
          </WarningBlock>
          {children}
        </>
      )

    case 'loreBlock':
      return (
        <>
          <LoreBlock
            title={(block.props?.title as string) || 'Lore'}
            icon={(block.props?.icon as 'book' | 'scroll') || 'book'}
            factionColor={factionColor}
          >
            <p className="font-body text-bone/85 leading-relaxed">
              <RenderBlockNoteInlineContent content={block.content as BlockNoteInlineContent[]} factionColor={factionColor} />
            </p>
          </LoreBlock>
          {children}
        </>
      )

    case 'quoteBlock':
      return (
        <>
          <QuoteBlock
            text={(block.props?.text as string) || ''}
            author={block.props?.author as string}
            source={block.props?.source as string}
            factionColor={factionColor}
          />
          {children}
        </>
      )

    default:
      // Attempt to render content for unknown block types
      if (block.content && Array.isArray(block.content)) {
        return (
          <>
            <p className="font-body text-bone/85 leading-relaxed mb-4">
              <RenderBlockNoteInlineContent content={block.content as BlockNoteInlineContent[]} factionColor={factionColor} />
            </p>
            {children}
          </>
        )
      }
      return children
  }
}

function RenderBNHeading({ level, factionColor, children }: { level: number; factionColor: string; children: React.ReactNode }) {
  const baseClasses = 'font-display font-bold text-white mb-4'
  const levelClasses: Record<number, string> = {
    1: 'text-3xl md:text-4xl mt-12 mb-6',
    2: 'text-2xl md:text-3xl mt-10 mb-5',
    3: 'text-xl md:text-2xl mt-8 mb-4',
  }
  const headingClass = cn(baseClasses, levelClasses[level] || levelClasses[3])
  const headingStyle = { color: level <= 2 ? factionColor : undefined }

  switch (level) {
    case 1: return <h1 className={headingClass} style={headingStyle}>{children}</h1>
    case 2: return <h2 className={headingClass} style={headingStyle}>{children}</h2>
    case 3: return <h3 className={headingClass} style={headingStyle}>{children}</h3>
    default: return <h3 className={headingClass} style={headingStyle}>{children}</h3>
  }
}

function RenderBlockNoteInlineContent({ content, factionColor }: { content?: BlockNoteInlineContent[]; factionColor: string }) {
  if (!content || !Array.isArray(content)) return null

  return (
    <>
      {content.map((item, i) => (
        <RenderBNInline key={i} item={item} factionColor={factionColor} />
      ))}
    </>
  )
}

function RenderBNInline({ item, factionColor }: { item: BlockNoteInlineContent; factionColor: string }) {
  if (item.type === 'text') {
    let node: React.ReactNode = item.text
    const styles = item.styles || {}

    if (styles.bold) node = <strong className="font-bold">{node}</strong>
    if (styles.italic) node = <em className="italic">{node}</em>
    if (styles.underline) node = <u className="underline">{node}</u>
    if (styles.strikethrough) node = <s className="line-through">{node}</s>
    if (styles.code) {
      node = (
        <code className="px-1.5 py-0.5 rounded text-sm font-mono" style={{ background: `${factionColor}15`, color: factionColor }}>
          {node}
        </code>
      )
    }
    if (styles.backgroundColor && styles.backgroundColor !== 'default') {
      node = <mark className="px-1 rounded" style={{ background: `${factionColor}30`, color: 'inherit' }}>{node}</mark>
    }

    return <>{node}</>
  }

  if (item.type === 'link') {
    const href = item.href || '#'
    const isExternal = href.startsWith('http')
    const linkContent = item.content?.map((child, i) => (
      <RenderBNInline key={i} item={child} factionColor={factionColor} />
    ))

    if (isExternal) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80 transition-opacity" style={{ color: factionColor }}>
          {linkContent}
        </a>
      )
    }
    return (
      <Link href={href} className="underline hover:opacity-80 transition-opacity" style={{ color: factionColor }}>
        {linkContent}
      </Link>
    )
  }

  if (item.type === 'hardBreak') {
    return <br />
  }

  return null
}

// =============================================================================
// TIPTAP (LEGACY) RENDERER
// =============================================================================

interface RenderNodeProps {
  node: TiptapNode
  factionColor: string
}

function RenderNode({ node, factionColor }: RenderNodeProps) {
  switch (node.type) {
    case 'paragraph':
      return (
        <p className="font-body text-bone/85 leading-relaxed mb-4">
          {node.content?.map((child, i) => (
            <RenderInline key={i} node={child} factionColor={factionColor} />
          ))}
        </p>
      )

    case 'heading':
      return <RenderHeading node={node} factionColor={factionColor} />

    case 'bulletList':
      return (
        <ul className="list-disc list-inside mb-4 space-y-2 font-body text-bone/85">
          {node.content?.map((item, i) => (
            <RenderNode key={i} node={item} factionColor={factionColor} />
          ))}
        </ul>
      )

    case 'orderedList':
      return (
        <ol className="list-decimal list-inside mb-4 space-y-2 font-body text-bone/85">
          {node.content?.map((item, i) => (
            <RenderNode key={i} node={item} factionColor={factionColor} />
          ))}
        </ol>
      )

    case 'listItem':
      return (
        <li>
          {node.content?.map((child, i) => (
            <RenderInlineContent key={i} node={child} factionColor={factionColor} />
          ))}
        </li>
      )

    case 'blockquote':
      if (node.attrs?.author || node.attrs?.source) {
        const text = extractTextContent(node)
        return (
          <QuoteBlock
            text={text}
            author={node.attrs?.author as string}
            source={node.attrs?.source as string}
            factionColor={factionColor}
          />
        )
      }
      return (
        <blockquote
          className="border-l-4 pl-4 my-4 italic text-bone/70"
          style={{ borderColor: factionColor }}
        >
          {node.content?.map((child, i) => (
            <RenderNode key={i} node={child} factionColor={factionColor} />
          ))}
        </blockquote>
      )

    case 'codeBlock':
      return (
        <pre
          className="my-4 p-4 rounded-lg bg-void-dark overflow-x-auto"
          style={{ border: `1px solid ${factionColor}20` }}
        >
          <code className="font-mono text-sm text-bone/90">
            {node.content?.map((child) => child.text).join('')}
          </code>
        </pre>
      )

    case 'horizontalRule':
      return (
        <hr
          className="my-8 border-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${factionColor}40, transparent)` }}
        />
      )

    case 'image':
      return (
        <ImageBlock
          src={node.attrs?.src as string || ''}
          alt={node.attrs?.alt as string || ''}
          caption={node.attrs?.title as string}
          factionColor={factionColor}
        />
      )

    case 'warningBlock':
      return (
        <WarningBlock
          type={node.attrs?.type as 'heresy' | 'danger' | 'info' | 'imperial'}
          title={node.attrs?.title as string}
        >
          {node.content?.map((child, i) => (
            <RenderInlineContent key={i} node={child} factionColor={factionColor} />
          ))}
        </WarningBlock>
      )

    case 'loreBlock':
      return (
        <LoreBlock
          title={node.attrs?.title as string || 'Lore'}
          icon={node.attrs?.icon as 'book' | 'scroll'}
          factionColor={factionColor}
        >
          {node.content?.map((child, i) => (
            <RenderNode key={i} node={child} factionColor={factionColor} />
          ))}
        </LoreBlock>
      )

    case 'quoteBlock':
      return (
        <QuoteBlock
          text={node.attrs?.text as string || extractTextContent(node)}
          author={node.attrs?.author as string}
          source={node.attrs?.source as string}
          factionColor={factionColor}
        />
      )

    default:
      if (node.content) {
        return (
          <>
            {node.content.map((child, i) => (
              <RenderNode key={i} node={child} factionColor={factionColor} />
            ))}
          </>
        )
      }
      return null
  }
}

function RenderHeading({ node, factionColor }: RenderNodeProps) {
  const level = (node.attrs?.level as number) || 1
  const baseClasses = 'font-display font-bold text-white mb-4'

  const levelClasses: Record<number, string> = {
    1: 'text-3xl md:text-4xl mt-12 mb-6',
    2: 'text-2xl md:text-3xl mt-10 mb-5',
    3: 'text-xl md:text-2xl mt-8 mb-4',
    4: 'text-lg md:text-xl mt-6 mb-3',
    5: 'text-base md:text-lg mt-4 mb-2',
    6: 'text-sm md:text-base mt-4 mb-2',
  }

  const headingContent = node.content?.map((child, i) => (
    <RenderInline key={i} node={child} factionColor={factionColor} />
  ))

  const headingClass = cn(baseClasses, levelClasses[level] || levelClasses[3])
  const headingStyle = { color: level <= 2 ? factionColor : undefined }

  switch (level) {
    case 1:
      return <h1 className={headingClass} style={headingStyle}>{headingContent}</h1>
    case 2:
      return <h2 className={headingClass} style={headingStyle}>{headingContent}</h2>
    case 3:
      return <h3 className={headingClass} style={headingStyle}>{headingContent}</h3>
    case 4:
      return <h4 className={headingClass} style={headingStyle}>{headingContent}</h4>
    case 5:
      return <h5 className={headingClass} style={headingStyle}>{headingContent}</h5>
    case 6:
      return <h6 className={headingClass} style={headingStyle}>{headingContent}</h6>
    default:
      return <h3 className={headingClass} style={headingStyle}>{headingContent}</h3>
  }
}

function RenderInline({ node, factionColor }: RenderNodeProps) {
  if (node.type === 'text') {
    let content: React.ReactNode = node.text

    if (node.marks) {
      for (const mark of node.marks) {
        content = applyMark(content, mark, factionColor)
      }
    }

    return <>{content}</>
  }

  if (node.type === 'hardBreak') {
    return <br />
  }

  return null
}

function RenderInlineContent({ node, factionColor }: RenderNodeProps) {
  if (node.type === 'paragraph') {
    return (
      <>
        {node.content?.map((child, i) => (
          <RenderInline key={i} node={child} factionColor={factionColor} />
        ))}
      </>
    )
  }
  return <RenderNode node={node} factionColor={factionColor} />
}

function applyMark(content: React.ReactNode, mark: TiptapMark, factionColor: string): React.ReactNode {
  switch (mark.type) {
    case 'bold':
      return <strong className="font-bold">{content}</strong>

    case 'italic':
      return <em className="italic">{content}</em>

    case 'underline':
      return <u className="underline">{content}</u>

    case 'strike':
      return <s className="line-through">{content}</s>

    case 'code':
      return (
        <code
          className="px-1.5 py-0.5 rounded text-sm font-mono"
          style={{
            background: `${factionColor}15`,
            color: factionColor,
          }}
        >
          {content}
        </code>
      )

    case 'link': {
      const href = mark.attrs?.href as string
      const isExternal = href?.startsWith('http')
      if (isExternal) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80 transition-opacity"
            style={{ color: factionColor }}
          >
            {content}
          </a>
        )
      }
      return (
        <Link
          href={href || '#'}
          className="underline hover:opacity-80 transition-opacity"
          style={{ color: factionColor }}
        >
          {content}
        </Link>
      )
    }

    case 'highlight':
      return (
        <mark
          className="px-1 rounded"
          style={{ background: `${factionColor}30`, color: 'inherit' }}
        >
          {content}
        </mark>
      )

    default:
      return content
  }
}

function extractTextContent(node: TiptapNode): string {
  if (node.text) return node.text
  if (!node.content) return ''
  return node.content.map(extractTextContent).join('')
}
