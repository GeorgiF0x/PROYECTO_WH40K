'use client'

import * as React from 'react'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Loader2,
} from 'lucide-react'
import { Button } from './button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './dropdown-menu'

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════

export interface Column<T> {
  key: string
  header: string
  sortable?: boolean
  width?: string
  render?: (item: T) => React.ReactNode
}

export interface Action<T> {
  label: string | ((item: T) => string)
  icon?: React.ReactNode
  onClick: (item: T) => void
  variant?: 'default' | 'danger'
  show?: (item: T) => boolean
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  actions?: Action<T>[]
  keyField: keyof T
  searchPlaceholder?: string
  searchFields?: (keyof T)[]
  loading?: boolean
  emptyMessage?: string
  emptyIcon?: React.ReactNode
  pageSize?: number
  onRowClick?: (item: T) => void
}

// ══════════════════════════════════════════════════════════════
// DATA TABLE COMPONENT
// ══════════════════════════════════════════════════════════════

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  actions,
  keyField,
  searchPlaceholder = 'Buscar...',
  searchFields = [],
  loading = false,
  emptyMessage = 'No hay datos',
  emptyIcon,
  pageSize = 10,
  onRowClick,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)

  // Filter data by search
  const filteredData = useMemo(() => {
    if (!search.trim()) return data

    const searchLower = search.toLowerCase()
    return data.filter((item) => {
      if (searchFields.length === 0) {
        // Search all string fields
        return Object.values(item).some(
          (value) =>
            typeof value === 'string' && value.toLowerCase().includes(searchLower)
        )
      }
      return searchFields.some((field) => {
        const value = item[field]
        return typeof value === 'string' && value.toLowerCase().includes(searchLower)
      })
    })
  }, [data, search, searchFields])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]

      if (aVal === bVal) return 0
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      const comparison = aVal < bVal ? -1 : 1
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredData, sortKey, sortDirection])

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize)
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, currentPage, pageSize])

  // Reset page when search changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [search])

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortKey !== columnKey) return <ArrowUpDown className="w-3.5 h-3.5 text-zinc-600" />
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-amber-500" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-amber-500" />
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider"
                    style={{ width: column.width }}
                  >
                    {column.sortable ? (
                      <button
                        onClick={() => handleSort(column.key)}
                        className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors"
                      >
                        {column.header}
                        <SortIcon columnKey={column.key} />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                ))}
                {actions && actions.length > 0 && (
                  <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider w-16">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="px-4 py-12 text-center"
                  >
                    <Loader2 className="w-6 h-6 text-zinc-500 animate-spin mx-auto" />
                    <p className="text-sm text-zinc-500 mt-2">Cargando...</p>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="px-4 py-12 text-center"
                  >
                    {emptyIcon && <div className="mb-2">{emptyIcon}</div>}
                    <p className="text-sm text-zinc-500">{emptyMessage}</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {paginatedData.map((item, index) => (
                    <motion.tr
                      key={String(item[keyField])}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15, delay: index * 0.02 }}
                      onClick={() => onRowClick?.(item)}
                      className={`${
                        onRowClick
                          ? 'cursor-pointer hover:bg-zinc-800/50'
                          : 'hover:bg-zinc-800/30'
                      } transition-colors`}
                    >
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className="px-4 py-3 text-sm text-zinc-300"
                        >
                          {column.render
                            ? column.render(item)
                            : String(item[column.key] ?? '-')}
                        </td>
                      ))}
                      {actions && actions.length > 0 && (
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              {actions.map((action, actionIndex) => {
                                if (action.show && !action.show(item)) return null
                                return (
                                  <React.Fragment key={actionIndex}>
                                    {action.variant === 'danger' && actionIndex > 0 && (
                                      <DropdownMenuSeparator />
                                    )}
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        action.onClick(item)
                                      }}
                                      className={
                                        action.variant === 'danger'
                                          ? 'text-red-500 focus:text-red-500'
                                          : ''
                                      }
                                    >
                                      {action.icon && (
                                        <span className="mr-2">{action.icon}</span>
                                      )}
                                      {typeof action.label === 'function' ? action.label(item) : action.label}
                                    </DropdownMenuItem>
                                  </React.Fragment>
                                )
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
            <p className="text-sm text-zinc-500">
              Mostrando {(currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, sortedData.length)} de {sortedData.length}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-3 text-sm text-zinc-400">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// STATUS BADGE
// ══════════════════════════════════════════════════════════════

interface StatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive' | 'banned' | 'closed'
  labels?: Record<string, string>
}

const defaultLabels: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  active: 'Activo',
  inactive: 'Inactivo',
  banned: 'Baneado',
  closed: 'Cerrado',
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  approved: 'bg-green-500/10 text-green-500 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
  active: 'bg-green-500/10 text-green-500 border-green-500/20',
  inactive: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  banned: 'bg-red-500/10 text-red-500 border-red-500/20',
  closed: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
}

export function StatusBadge({ status, labels = defaultLabels }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${
        statusColors[status] || statusColors.inactive
      }`}
    >
      {labels[status] || status}
    </span>
  )
}

// ══════════════════════════════════════════════════════════════
// FILTER TABS
// ══════════════════════════════════════════════════════════════

interface FilterTab {
  key: string
  label: string
  count?: number
}

interface FilterTabsProps {
  tabs: FilterTab[]
  activeTab: string
  onChange: (key: string) => void
}

export function FilterTabs({ tabs, activeTab, onChange }: FilterTabsProps) {
  return (
    <div className="flex gap-1 p-1 bg-zinc-900 rounded-lg border border-zinc-800">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            activeTab === tab.key
              ? 'bg-zinc-800 text-white'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                activeTab === tab.key ? 'bg-zinc-700' : 'bg-zinc-800'
              }`}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
