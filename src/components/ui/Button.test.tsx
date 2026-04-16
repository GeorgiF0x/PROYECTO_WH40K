import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Submit</Button>)

    await user.click(screen.getByRole('button', { name: 'Submit' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not fire onClick when disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Button onClick={onClick} disabled>
        Submit
      </Button>
    )

    await user.click(screen.getByRole('button', { name: 'Submit' }))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders the loading state and disables the button', () => {
    render(<Button isLoading>Save</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveTextContent(/cargando/i)
  })

  it('does not fire onClick while loading', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Button onClick={onClick} isLoading>
        Save
      </Button>
    )

    await user.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it.each(['primary', 'secondary', 'outline', 'ghost', 'danger'] as const)(
    'renders the %s variant without errors',
    (variant) => {
      render(<Button variant={variant}>Variant</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    }
  )

  it('forwards ref to the underlying button element', () => {
    let buttonRef: HTMLButtonElement | null = null
    render(
      <Button
        ref={(el) => {
          buttonRef = el
        }}
      >
        Ref test
      </Button>
    )
    expect(buttonRef).toBeInstanceOf(HTMLButtonElement)
  })

  it('merges custom className with default styles', () => {
    render(<Button className="custom-class">Hi</Button>)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  it('passes through native button attributes (type, aria-label)', () => {
    render(
      <Button type="submit" aria-label="Send form">
        Send
      </Button>
    )
    const button = screen.getByRole('button', { name: 'Send form' })
    expect(button).toHaveAttribute('type', 'submit')
  })
})
