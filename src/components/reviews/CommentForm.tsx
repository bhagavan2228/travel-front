import { useState, useEffect } from 'react'
import { Star, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ToxicWarning } from './ToxicWarning'
import { toxicityApi } from '@/api/endpoints'
import { useDebounce } from '@/hooks/useDebounce'

interface CommentFormProps {
  onSubmit: (data: { rating: number; title: string; body: string }) => void
  isSubmitting?: boolean
  initialRating?: number
  placeholder?: string
}

export function CommentForm({ onSubmit, isSubmitting, initialRating = 5, placeholder = "Share your experience..." }: CommentFormProps) {
  const [rating, setRating] = useState(initialRating)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [warning, setWarning] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  
  const debouncedBody = useDebounce(body, 500)

  useEffect(() => {
    async function checkToxicity() {
      if (!debouncedBody.trim()) {
        setWarning('')
        return
      }
      setIsChecking(true)
      try {
        const res = await toxicityApi.check(debouncedBody)
        if (res.blocked) {
          setWarning('Your review contains language that violates our community guidelines. Please revise it.')
        } else if (res.warning) {
          setWarning('Your review contains potentially sensitive or toxic language. Please consider revising.')
        } else {
          setWarning('')
        }
      } catch {
      // Error is handled by API interceptore if toxicity check fails
      } finally {
        setIsChecking(false)
      }
    }
    
    checkToxicity()
  }, [debouncedBody])

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (warning && warning.includes('violates')) {
          return // Prevent submission of blocked content
        }
        onSubmit({ rating, title, body })
        setTitle('')
        setBody('')
        setRating(5)
      }}
    >
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={`p-1 transition-colors ${n <= rating ? 'text-amber-500 hover:text-amber-600' : 'text-slate-300 hover:text-slate-400'}`}
            aria-label={`Rate ${n} stars`}
          >
            <Star className={`h-6 w-6 ${n <= rating ? 'fill-current' : ''}`} />
          </button>
        ))}
      </div>
      
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Review title"
        required
        maxLength={100}
        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
      />
      
      <div className="relative">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={placeholder}
          required
          rows={4}
          maxLength={1000}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all resize-none"
        />
        {isChecking && (
          <div className="absolute bottom-3 right-3 text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </div>

      <ToxicWarning message={warning} onClose={() => setWarning('')} />

      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isSubmitting || isChecking || (!!warning && warning.includes('violates'))}
          className="gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Posting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Post review
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
