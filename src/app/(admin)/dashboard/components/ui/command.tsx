'use client'

import * as React from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommandContextType {
  search: string
  setSearch: (search: string) => void
}

const CommandContext = React.createContext<CommandContextType>({
  search: '',
  setSearch: () => {},
})

interface CommandProps extends React.HTMLAttributes<HTMLDivElement> {}

const Command = React.forwardRef<HTMLDivElement, CommandProps>(
  ({ className, children, ...props }, ref) => {
    const [search, setSearch] = React.useState('')

    return (
      <CommandContext.Provider value={{ search, setSearch }}>
        <div
          ref={ref}
          className={cn(
            'flex h-full w-full flex-col overflow-hidden rounded-lg bg-void-light text-bone',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </CommandContext.Provider>
    )
  }
)
Command.displayName = 'Command'

interface CommandInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {}

const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(
  ({ className, placeholder, ...props }, ref) => {
    const { search, setSearch } = React.useContext(CommandContext)

    return (
      <div className="flex items-center border-b border-bone/10 px-3">
        <Search className="mr-2 h-4 w-4 shrink-0 text-bone/40" />
        <input
          ref={ref}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            'flex h-11 w-full rounded-md bg-transparent py-3 text-sm text-bone outline-none placeholder:text-bone/40 disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          placeholder={placeholder}
          {...props}
        />
      </div>
    )
  }
)
CommandInput.displayName = 'CommandInput'

interface CommandListProps extends React.HTMLAttributes<HTMLDivElement> {}

const CommandList = React.forwardRef<HTMLDivElement, CommandListProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('max-h-[300px] overflow-y-auto overflow-x-hidden', className)}
      {...props}
    />
  )
)
CommandList.displayName = 'CommandList'

interface CommandEmptyProps extends React.HTMLAttributes<HTMLDivElement> {}

const CommandEmpty = React.forwardRef<HTMLDivElement, CommandEmptyProps>(
  ({ className, ...props }, ref) => {
    const { search } = React.useContext(CommandContext)

    // Only show empty state if there's a search query
    if (!search) return null

    return (
      <div
        ref={ref}
        className={cn('py-6 text-center text-sm text-bone/50', className)}
        {...props}
      />
    )
  }
)
CommandEmpty.displayName = 'CommandEmpty'

interface CommandGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  heading?: string
}

const CommandGroup = React.forwardRef<HTMLDivElement, CommandGroupProps>(
  ({ className, heading, children, ...props }, ref) => {
    const { search } = React.useContext(CommandContext)

    // Filter children based on search
    const filteredChildren = React.Children.toArray(children).filter((child) => {
      if (!search) return true
      if (React.isValidElement(child)) {
        const value = (child.props as { value?: string }).value || ''
        return value.toLowerCase().includes(search.toLowerCase())
      }
      return true
    })

    if (filteredChildren.length === 0 && search) return null

    return (
      <div
        ref={ref}
        className={cn('overflow-hidden p-1 text-bone', className)}
        {...props}
      >
        {heading && (
          <div className="px-2 py-1.5 text-xs font-medium text-bone/50">
            {heading}
          </div>
        )}
        {filteredChildren}
      </div>
    )
  }
)
CommandGroup.displayName = 'CommandGroup'

interface CommandSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

const CommandSeparator = React.forwardRef<HTMLDivElement, CommandSeparatorProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('-mx-1 h-px bg-bone/10', className)}
      {...props}
    />
  )
)
CommandSeparator.displayName = 'CommandSeparator'

interface CommandItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onSelect?: () => void
  disabled?: boolean
}

const CommandItem = React.forwardRef<HTMLDivElement, CommandItemProps>(
  ({ className, value, onSelect, disabled, children, ...props }, ref) => {
    const [selected, setSelected] = React.useState(false)

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm text-bone/70 outline-none transition-colors',
          'hover:bg-bone/10 hover:text-bone',
          selected && 'bg-bone/10 text-bone',
          disabled && 'pointer-events-none opacity-50',
          className
        )}
        onClick={() => {
          if (!disabled && onSelect) {
            onSelect()
          }
        }}
        onMouseEnter={() => setSelected(true)}
        onMouseLeave={() => setSelected(false)}
        data-value={value}
        {...props}
      >
        {children}
      </div>
    )
  }
)
CommandItem.displayName = 'CommandItem'

interface CommandShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {}

const CommandShortcut = ({ className, ...props }: CommandShortcutProps) => {
  return (
    <span
      className={cn('ml-auto text-xs tracking-widest text-bone/40', className)}
      {...props}
    />
  )
}
CommandShortcut.displayName = 'CommandShortcut'

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
