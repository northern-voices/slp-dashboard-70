import { useState, useRef, useLayoutEffect } from 'react'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'

interface MultiEmailInputProps {
  recipientEmails: string[]
  onChange: (emails: string[]) => void
  emailHistory: string[]
  removableEmails?: Set<string>
  onDeleteSuggestion?: (email: string) => void
}

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const DROPDOWN_MAX_HEIGHT = 160

const MultiEmailInput = ({
  recipientEmails,
  onChange,
  emailHistory,
  removableEmails,
  onDeleteSuggestion,
}: MultiEmailInputProps) => {
  const [emailInput, setEmailInput] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [openUpward, setOpenUpward] = useState(false)
  const [canScrollMore, setCanScrollMore] = useState(false)
  const [scrollThumb, setScrollThumb] = useState<{ heightPct: number; topPct: number } | null>(null)

  const listRef = useRef<HTMLUListElement>(null)
  const inputWrapperRef = useRef<HTMLDivElement>(null)

  const updateScrollHint = () => {
    const el = listRef.current
    if (!el) {
      setCanScrollMore(false)
      setScrollThumb(null)
      return
    }

    const { scrollHeight, scrollTop, clientHeight } = el
    setCanScrollMore(scrollHeight - scrollTop - clientHeight > 1)

    if (scrollHeight <= clientHeight) {
      setScrollThumb(null)
      return
    }

    setScrollThumb({
      heightPct: (clientHeight / scrollHeight) * 100,
      topPct: (scrollTop / scrollHeight) * 100,
    })
  }

  useLayoutEffect(() => {
    if (suggestions.length === 0 || !inputWrapperRef.current) {
      setCanScrollMore(false)
      return
    }

    const rect = inputWrapperRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top

    setOpenUpward(spaceBelow < DROPDOWN_MAX_HEIGHT && spaceAbove > spaceBelow)
    updateScrollHint()
  }, [suggestions])

  const addEmail = (email: string) => {
    const trimmed = email.trim()

    if (
      trimmed &&
      isValidEmail(trimmed) &&
      !recipientEmails.includes(trimmed) &&
      recipientEmails.length < 5
    ) {
      const updatedRecipients = [...recipientEmails, trimmed]
      onChange(updatedRecipients)
      setEmailInput('')
      setSuggestions(emailHistory.filter(history => !updatedRecipients.includes(history)))
      setHighlightedIndex(-1)
    }
  }

  const getMatchingSuggestions = (value: string) =>
    emailHistory.filter(
      history =>
        history.toLowerCase().includes(value.toLowerCase()) && !recipientEmails.includes(history)
    )

  const handleDeleteSuggestion = (email: string) => {
    setSuggestions(prev => prev.filter(e => e !== email))
    onDeleteSuggestion?.(email)
  }

  return (
    <div className='space-y-1'>
      <Label htmlFor='recipient' className='text-sm font-medium'>
        Recipient Email(s)
      </Label>
      <div className='min-h-[42px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'>
        <div className='flex flex-wrap gap-2'>
          {recipientEmails.map((email, index) => (
            <Badge key={index} variant='secondary' className='flex items-center gap-1 px-2 py-1'>
              <span>{email}</span>
              <button
                type='button'
                className='ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5'
                onClick={() => onChange(recipientEmails.filter(e => e !== email))}>
                <X className='w-3 h-3' />
              </button>
            </Badge>
          ))}

          <div ref={inputWrapperRef} className='relative flex-1 min-w-[120px]'>
            <input
              type='text'
              id='recipient'
              autoComplete='new-password'
              value={emailInput}
              onChange={e => {
                const value = e.target.value
                setEmailInput(value)
                setHighlightedIndex(-1)
                setSuggestions(getMatchingSuggestions(value))
              }}
              onFocus={() => setSuggestions(getMatchingSuggestions(emailInput))}
              onKeyDown={e => {
                if (suggestions.length > 0) {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    setHighlightedIndex(prev => (prev + 1) % suggestions.length)
                    return
                  }
                  if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    setHighlightedIndex(prev => (prev <= 0 ? suggestions.length - 1 : prev - 1))
                    return
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault()
                    setSuggestions([])
                    setHighlightedIndex(-1)
                    return
                  }
                  if (e.key === 'Enter' && highlightedIndex >= 0) {
                    e.preventDefault()
                    addEmail(suggestions[highlightedIndex])
                    return
                  }
                }
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addEmail(emailInput)
                } else if (
                  e.key === 'Backspace' &&
                  emailInput === '' &&
                  recipientEmails.length > 0
                ) {
                  onChange(recipientEmails.slice(0, -1))
                }
              }}
              onBlur={() => {
                setSuggestions([])
                setHighlightedIndex(-1)
                addEmail(emailInput)
              }}
              placeholder={recipientEmails.length === 0 ? 'Type email and press Enter (max 5)' : ''}
              className='w-full outline-none bg-transparent'
            />

            {suggestions.length > 0 && (
              <div
                className={`absolute z-10 left-0 right-0 ${openUpward ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
                <ul
                  ref={listRef}
                  onScroll={updateScrollHint}
                  className='suggestions-scrollbar bg-white border border-gray-200 rounded-md shadow-md max-h-40 overflow-y-auto'>
                  {suggestions.map((email, index) => (
                    <li
                      key={email}
                      className={`flex items-center justify-between gap-2 px-3 py-2 text-sm ${index === highlightedIndex ? 'bg-gray-100' : 'hover:bg-gray-100'}`}>
                      <span
                        onMouseDown={e => {
                          e.preventDefault()
                          addEmail(email)
                        }}
                        className='flex-1 cursor-pointer truncate'>
                        {email}
                      </span>
                      {removableEmails?.has(email) && (
                        <button
                          type='button'
                          onMouseDown={e => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleDeleteSuggestion(email)
                          }}
                          className='shrink-0 rounded-full p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700'
                          aria-label={`Remove ${email} from suggestions`}>
                          <X className='w-3 h-3' />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
                {canScrollMore && (
                  <div className='pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-white to-transparent rounded-b-md' />
                )}
                {scrollThumb && (
                  <div className='pointer-events-none absolute right-0.5 top-1 bottom-1 w-2 rounded-full bg-gray-100'>
                    <div
                      className='absolute inset-x-0 rounded-full bg-gray-300'
                      style={{ height: `${scrollThumb.heightPct}%`, top: `${scrollThumb.topPct}%` }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <p className='text-xs text-gray-500'>
        Press Enter to add up to 5 recipients. Click x or Backspace to remove.
      </p>
    </div>
  )
}

export default MultiEmailInput
