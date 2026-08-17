import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, X, ShieldAlert, CheckCircle2, MessageSquareX, AlertOctagon, HelpCircle, Ban } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const REPORT_REASONS = [
  { label: 'Spam or Advertising', value: 'SPAM', icon: Ban, desc: 'Promotional content, scams, or irrelevant links' },
  { label: 'Harassment or Abuse', value: 'HARASSMENT', icon: ShieldAlert, desc: 'Targeted attacks, threats, or hate speech' },
  { label: 'Misinformation or Fake', value: 'MISINFORMATION', icon: MessageSquareX, desc: 'False travel information or deceptive reviews' },
  { label: 'Offensive or Explicit', value: 'OFFENSIVE', icon: AlertOctagon, desc: 'Profanity, graphic material, or inappropriate topics' },
  { label: 'Other Concerns', value: 'OTHER', icon: HelpCircle, desc: 'Any other safety or quality issue' },
]

export function ReportDialog({ isOpen, onClose, onSubmit, isSubmitting }) {
  const [reason, setReason] = useState(REPORT_REASONS[0].value)
  const [description, setDescription] = useState('')

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/60 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Report Review to Moderation
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Help maintain a helpful & trustworthy community
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              onSubmit(reason, description)
            }}
            className="p-6 space-y-5 overflow-y-auto"
          >
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Select Violation Category
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {REPORT_REASONS.map((r) => {
                  const Icon = r.icon
                  const isSelected = reason === r.value
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setReason(r.value)}
                      className={`relative flex items-center gap-3.5 p-3.5 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-rose-500 bg-rose-500/10 dark:bg-rose-500/15 shadow-sm ring-1 ring-rose-500/50'
                          : 'border-slate-200/70 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          isSelected
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${isSelected ? 'text-rose-900 dark:text-rose-200' : 'text-slate-800 dark:text-slate-200'}`}>
                          {r.label}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {r.desc}
                        </p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="h-4 w-4 text-rose-500 shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label htmlFor="report-details" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Context or Details (Optional)
              </label>
              <textarea
                id="report-details"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Share any additional context to assist the trust & safety team..."
                rows={3}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all resize-none"
              />
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>Reports are audited by automated moderation and human reviewers. False reports affect community standings.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg shadow-rose-600/25"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
