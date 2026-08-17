import { AlertTriangle, X, ShieldAlert, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function ToxicWarning({ message, onClose }) {
  if (!message) return null

  const isBlocked = message.toLowerCase().includes('violat') || message.toLowerCase().includes('block')

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="overflow-hidden mb-4"
      >
        <div
          className={`relative rounded-2xl p-4 sm:p-5 border backdrop-blur-xl transition-all shadow-lg ${
            isBlocked
              ? 'bg-rose-500/10 dark:bg-rose-950/40 border-rose-500/30 text-rose-900 dark:text-rose-200 shadow-rose-500/5'
              : 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/30 text-amber-900 dark:text-amber-200 shadow-amber-500/5'
          }`}
        >
          {/* Subtle glowing accent */}
          <div
            className={`absolute top-0 left-0 h-full w-1.5 rounded-l-2xl ${
              isBlocked ? 'bg-rose-500' : 'bg-amber-500'
            }`}
          />

          <div className="flex items-start gap-3.5 pl-1.5">
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                isBlocked
                  ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                  : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
              }`}
            >
              {isBlocked ? <ShieldAlert className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            </div>

            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold tracking-tight">
                  {isBlocked ? 'Content Blocked by AI Safety Filter' : 'Content Guidelines Advisory'}
                </h4>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isBlocked
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {isBlocked ? 'Action Required' : 'Suggested Review'}
                </span>
              </div>

              <p className="text-xs sm:text-sm mt-1.5 leading-relaxed opacity-90 font-medium">
                {message}
              </p>

              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] opacity-75">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span>Keep community discussions respectful, constructive, and helpful for travelers.</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-current transition-colors shrink-0"
              aria-label="Dismiss warning"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
