import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { onMessageListener, requestNotificationPermission } from '@/lib/firebase'

export function NotificationListener() {
  const [notification, setNotification] = useState<{ title: string; body: string } | null>(null)

  useEffect(() => {
    // Request permission when component mounts (or could be triggered by user action)
    requestNotificationPermission()

    let isMounted = true

    const setupListener = async () => {
      try {
        const payload = await onMessageListener() as { notification?: { title: string; body: string } }
        if (isMounted && payload?.notification) {
          setNotification({
            title: payload.notification.title,
            body: payload.notification.body,
          })
          
          // Auto clear after 5 seconds
          setTimeout(() => {
            setNotification(null)
          }, 5000)
        }
        
        // Setup listener again for next message
        setupListener()
      } catch (err) {
        console.error('Failed to listen for message', err)
      }
    }

    setupListener()
  }, [])

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -50, x: '-50%' }}
          className="fixed top-20 left-1/2 z-[100] w-[min(90vw,400px)] glass-strong rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden"
        >
          <div className="flex items-start gap-4 p-4">
            <div className="bg-brand-100 dark:bg-brand-900/30 p-2 rounded-xl shrink-0">
              <Bell className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {notification.title}
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {notification.body}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
