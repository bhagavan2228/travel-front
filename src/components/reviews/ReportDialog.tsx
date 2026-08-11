import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, X, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ReportDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (reason: string, description: string) => void
  isSubmitting?: boolean
}

const REPORT_REASONS = [
  { label: 'Spam or misleading', value: 'SPAM' },
  { label: 'Abusive or harmful', value: 'HARASSMENT' },
  { label: 'Fake review or misinformation', value: 'MISINFORMATION' },
  { label: 'Inappropriate or offensive', value: 'OFFENSIVE' },
  { label: 'Other', value: 'OTHER' },
]

export function ReportDialog({ isOpen, onClose, onSubmit, isSubmitting }: ReportDialogProps) {
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
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
        >
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              Report Review
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              onSubmit(reason, description)
            }}
            className="p-5 space-y-5"
          >
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Reason for reporting
              </label>
              <div className="space-y-2">
                {REPORT_REASONS.map((r) => (
                  <label key={r.value} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="reportReason"
                        value={r.value}
                        checked={reason === r.value}
                        onChange={(e) => setReason(e.target.value)}
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 peer-checked:border-brand-600 peer-checked:bg-brand-600 transition-all" />
                      <div className="absolute w-2 h-2 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      {r.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="details" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Additional details (optional)
              </label>
              <textarea
                id="details"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Help us understand why you're reporting this..."
                rows={3}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>Reports are reviewed by our moderation team. False reports may affect your credibility score.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
