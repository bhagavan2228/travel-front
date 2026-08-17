import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Send, Loader2, Sparkles, Compass,
  Utensils, CloudSun, DollarSign, Bot,
  RefreshCw, ChevronRight
} from 'lucide-react'
import { assistantApi } from '@/api/endpoints'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const DEFAULT_SUGGESTION_CARDS = [
  {
    icon: Compass,
    category: 'Itinerary',
    prompt: 'Plan a 2-day budget itinerary with top highlights',
    color: 'from-brand-500/20 to-rose-500/20 text-brand-600 dark:text-brand-400 border-brand-500/30',
  },
  {
    icon: Utensils,
    category: 'Gastronomy',
    prompt: 'What are the top 3 authentic local dishes to try?',
    color: 'from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
  },
  {
    icon: CloudSun,
    category: 'Weather & Gear',
    prompt: 'What is the current weather and what should I pack?',
    color: 'from-blue-500/20 to-cyan-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
  },
  {
    icon: DollarSign,
    category: 'Budget Tips',
    prompt: 'How can I save on transit and flights for this route?',
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  },
]

export function AssistantChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState()
  const [quickPills, setQuickPills] = useState([
    'Top tourist spots',
    'Best food joints',
    'Safety precautions',
    'Transit options',
  ])
  const bottomRef = useRef(null)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text) => {
    if (!text.trim() || loading) return
    if (!isAuthenticated) {
      setMessages((m) => [
        ...m,
        { role: 'user', content: text },
        { role: 'assistant', content: '🔒 Please sign in to unlock personalized Voyager AI travel assistant advice.' },
      ])
      return
    }

    setMessages((m) => [...m, { role: 'user', content: text }, { role: 'assistant', content: '' }])
    setInput('')
    setLoading(true)

    // Check if viewing a destination page
    let destinationId = undefined
    const match = window.location.pathname.match(/\/destinations\/(\d+)/)
    if (match) {
      destinationId = Number(match[1])
    }

    try {
      const token = localStorage.getItem('accessToken') || undefined
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
              if (data.suggestions?.length) setQuickPills(data.suggestions)
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
              // Parse error on incomplete chunk
            }
          }
        }
      }
    } catch {
      setMessages((m) => {
        const newM = [...m]
        newM[newM.length - 1].content = '✈️ Safe travels! Our AI assistant is ready to help with your itinerary, food recommendations, and weather forecast.'
        return newM
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Trigger Button with Glow */}
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full',
          'bg-gradient-to-tr from-brand-700 via-brand-600 to-rose-500 text-white shadow-xl shadow-brand-700/40',
          'flex items-center justify-center hover:scale-105 active:scale-95 transition-all border border-white/20',
          open && 'scale-0 opacity-0 pointer-events-none'
        )}
        aria-label="Open travel assistant"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        <Sparkles className="h-6 w-6 animate-pulse" />
      </motion.button>

      {/* Chat Modal / Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.94 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed bottom-6 right-6 z-50 w-[min(100vw-2rem,430px)] h-[min(78vh,620px)] glass-strong rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-white/30 dark:border-white/10"
            role="dialog"
            aria-label="Voyager AI Travel Concierge"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/50 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Voyager AI</h3>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      ⚡ FAST
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Contextual Travel Concierge</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setMessages([])}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                    title="Reset chat"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  aria-label="Close chat"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="space-y-4 py-2">
                  <div className="text-center px-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 mx-auto flex items-center justify-center mb-2">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">
                      How can I help you explore?
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Choose an AI suggestion below or ask anything about destinations, cuisine & bookings.
                    </p>
                  </div>

                  {/* Assistant Suggestion Cards Grid */}
                  <div className="grid grid-cols-1 gap-2.5 pt-1">
                    {DEFAULT_SUGGESTION_CARDS.map((card, idx) => {
                      const Icon = card.icon
                      return (
                        <motion.button
                          key={idx}
                          type="button"
                          onClick={() => send(card.prompt)}
                          whileHover={{ scale: 1.01, x: 2 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex items-center gap-3.5 p-3.5 rounded-2xl border text-left bg-gradient-to-r ${card.color} backdrop-blur-md shadow-sm transition-all group`}
                        >
                          <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 shadow-sm shrink-0">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-75 block">
                              {card.category}
                            </span>
                            <p className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                              {card.prompt}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Message List */}
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'max-w-[88%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-sm',
                    msg.role === 'user'
                      ? 'ml-auto bg-gradient-to-r from-brand-600 to-rose-600 text-white font-medium rounded-br-sm'
                      : 'glass-strong text-slate-800 dark:text-slate-100 rounded-bl-sm border border-white/40 dark:border-white/10'
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 p-3 glass-strong rounded-2xl max-w-[140px] text-slate-500 text-xs font-medium"
                >
                  <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
                  Generating...
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick Pills Footer */}
            {messages.length > 0 && quickPills.length > 0 && !loading && (
              <div className="px-4 py-2 flex gap-2 overflow-x-auto hide-scrollbar bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-200/40 dark:border-white/5">
                {quickPills.map((pill, i) => (
                  <button
                    key={i}
                    onClick={() => send(pill)}
                    className="px-3 py-1.5 rounded-full text-[11px] font-semibold glass border border-white/30 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 shrink-0 whitespace-nowrap transition-colors"
                  >
                    ✨ {pill}
                  </button>
                ))}
              </div>
            )}

            {/* Input Form */}
            <form
              className="p-3.5 border-t border-slate-200/50 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                send(input)
              }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Voyager AI anything..."
                className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 px-4 py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all shadow-inner"
                aria-label="Chat message"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-3 rounded-2xl bg-gradient-to-r from-brand-600 to-rose-600 text-white hover:opacity-95 active:scale-95 disabled:opacity-40 transition-all shadow-md shadow-brand-600/20"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
