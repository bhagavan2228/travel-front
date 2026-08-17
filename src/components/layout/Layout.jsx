import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { AssistantChat } from '@/components/travel/AssistantChat'
import { PageTransition } from './PageTransition'
import { NotificationListener } from './NotificationListener'

export function Layout() {
  const location = useLocation()
  const isAuthPage = ['/login', '/register'].includes(location.pathname)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <NotificationListener />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      {!isAuthPage && <Footer />}
      <AssistantChat />
    </div>
  )
}
