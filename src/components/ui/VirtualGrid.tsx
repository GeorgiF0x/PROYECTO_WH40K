'use client'

import { useRef, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'

export interface ColumnConfig {
  base: number
  sm?: number
  lg?: number
  xl?: number
}

interface VirtualGridProps<T> {
  items: T[]
  columns: ColumnConfig
  estimatedRowHeight: number
  gap?: number
  renderItem: (item: T, index: number) => ReactNode
  keyExtractor: (item: T, index: number) => string | number
}

function getColumns(config: ColumnConfig): number {
  if (typeof window === 'undefined') return config.base
  const w = window.innerWidth
  if (config.xl && w >= 1280) return config.xl
  if (config.lg && w >= 1024) return config.lg
  if (config.sm && w >= 640) return config.sm
  return config.base
}

export function VirtualGrid<T>({
  items,
  columns: columnConfig,
  estimatedRowHeight,
  gap = 24,
  renderItem,
  keyExtractor,
}: VirtualGridProps<T>) {
  const listRef = useRef<HTMLDivElement>(null)
  const [cols, setCols] = useState(() => getColumns(columnConfig))

  const updateCols = useCallback(() => {
    setCols(getColumns(columnConfig))
  }, [columnConfig])

  useEffect(() => {
    updateCols()
    const mql640 = window.matchMedia('(min-width: 640px)')
    const mql1024 = window.matchMedia('(min-width: 1024px)')
    const mql1280 = window.matchMedia('(min-width: 1280px)')

    mql640.addEventListener('change', updateCols)
    mql1024.addEventListener('change', updateCols)
    mql1280.addEventListener('change', updateCols)

    return () => {
      mql640.removeEventListener('change', updateCols)
      mql1024.removeEventListener('change', updateCols)
      mql1280.removeEventListener('change', updateCols)
    }
  }, [updateCols])

  const rowCount = Math.ceil(items.length / cols)

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => estimatedRowHeight + gap,
    overscan: 2,
    scrollMargin: listRef.current?.offsetTop ?? 0,
  })

  const virtualRows = virtualizer.getVirtualItems()

  return (
    <div ref={listRef}>
      <div
        style={{
          height: virtualizer.getTotalSize(),
          position: 'relative',
          width: '100%',
        }}
      >
        {virtualRows.map((virtualRow) => {
          const rowStart = virtualRow.index * cols
          const rowItems = items.slice(rowStart, rowStart + cols)

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`,
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                  gap,
                }}
              >
                {rowItems.map((item, colIndex) => {
                  const itemIndex = rowStart + colIndex
                  return (
                    <div key={keyExtractor(item, itemIndex)}>
                      {renderItem(item, itemIndex)}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
