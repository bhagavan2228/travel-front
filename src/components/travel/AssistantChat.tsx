import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'
import { assistantApi } from '@/api/endpoints'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const defaultSuggestions = [
  'Best places to visit in Paris?',
  'Is it safe to travel this weekend?',
  'Find cheap flights to Tokyo',
]

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function AssistantChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string>()
  const [suggestions, setSuggestions] = useState(defaultSuggestions)
  const bottomRef = useRef<HTMLDivElement>(null)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    if (!isAuthenticated) {
      setMessages((m) => [
        ...m,
        { role: 'user', content: text },
        { role: 'assistant', content: 'Please sign in to use the AI travel assistant.' },
      ])
      return
    }

    setMessages((m) => [...m, { role: 'user', content: text }, { role: 'assistant', content: '' }])
    setInput('')
    setLoading(true)

    // Extract destination ID from URL if user is viewing a specific destination page (e.g. /destinations/9)
    let destinationId: number | undefined = undefined
    const match = window.location.pathname.match(/\/destinations\/(\d+)/)
    if (match) {
      destinationId = Number(match[1])
    }

    try {
      const token = localStorage.getItem('access_token') || undefined
      const stream = await assistantApi.chatStream({ message: text, sessionId, destinationId }, token)
      
      if (!stream) {
        throw new Error('No stream available')
      }

      const reader = stream.getReader()
      const decoder = new TextDecoder()
      let currentReply = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6)
            if (dataStr === '[DONE]') {
              continue
            }
            try {
              const data = JSON.parse(dataStr)
              if (data.sessionId) setSessionId(data.sessionId)
              if (data.suggestions?.length) setSuggestions(data.suggestions)
              if (data.reply) {
                currentReply += data.reply
                setMessages((m) => {
                  const newM = [...m]
                  const lastIndex = newM.length - 1
                  newM[lastIndex] = { ...newM[lastIndex], content: currentReply }
                  return newM
                })
              }
            } catch {
              // Parse error on incomplete chunk, handled by buffer in real app but simplifed here
            }
          }
        }
      }
    } catch {
      setMessages((m) => {
        const newM = [...m]
        newM[newM.length - 1].content = 'Sorry, I could not reach the assistant. Please try again.'
        return newM
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full',
          'bg-brand-700 text-white shadow-xl shadow-brand-700/30',
          'flex items-center justify-center hover:bg-brand-800 transition-colors',
          open && 'scale-0 opacity-0 pointer-events-none'
        )}
        aria-label="Open travel assistant"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle className="h-6 w-6" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[min(100vw-2rem,400px)] h-[min(70vh,560px)] glass-strong rounded-2xl flex flex-col shadow-2xl overflow-hidden"
            role="dialog"
            aria-label="Travel assistant chat"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/50 dark:border-white/10">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Travel Assistant</h3>
                <p className="text-xs text-slate-500">Context-aware AI guidance</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-500 mb-3">Quick suggestions:</p>
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="block w-full text-left text-sm glass rounded-xl px-4 py-3 hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'ml-auto bg-brand-700 text-white'
                      : 'glass text-slate-700 dark:text-slate-200'
                  )}
                >
                  {msg.content}
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form
              className="p-4 border-t border-slate-200/50 dark:border-white/10 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                send(input)
              }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about your trip..."
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                aria-label="Chat message"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2.5 rounded-xl bg-brand-700 text-white hover:bg-brand-800 disabled:opacity-50 transition-colors"
                aria-label="Send message"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
