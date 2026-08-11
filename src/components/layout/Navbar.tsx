import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Sun, Moon, Compass } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const navLinks = [
  { to: '/#features', label: 'Features' },
  { to: '/destinations', label: 'Explore' },
  { to: '/book', label: 'Bookings' },
  { to: '/trips', label: 'My Trips', auth: true },
  { to: '/leaderboard', label: 'Leaderboard' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-4 pt-4">
      <nav
        className="glass-strong mx-auto max-w-6xl rounded-2xl px-4 sm:px-6"
        aria-label="Main navigation"
      >
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-white shadow-lg shadow-brand-700/30 transition-transform group-hover:scale-105">
              <Compass className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
              Voyager
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks
              .filter((l) => !l.auth || isAuthenticated)
              .map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'relative px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                      'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
                      isActive && 'text-brand-700 dark:text-brand-300'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      {isActive && (
                        <motion.span
                          layoutId="nav-underline"
                          className="absolute inset-x-2 -bottom-0.5 h-0.5 bg-brand-600 rounded-full"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-3">
                <span className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-[120px]">
                  {user?.fullName?.split(' ')[0]}
                </span>
                <Button variant="ghost" size="sm" onClick={logout}>
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="hidden sm:flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Log in
                </Button>
                <Button size="sm" onClick={() => navigate('/register')}>
                  Get started
                </Button>
              </div>
            )}

            <button
              type="button"
              className="md:hidden p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-slate-200/50 dark:border-white/10"
            >
              <div className="py-4 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className="px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-sm font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
                {!isAuthenticated && (
                  <div className="flex flex-col gap-2 px-4 pt-2">
                    <Button variant="outline" onClick={() => { navigate('/login'); setOpen(false) }}>
                      Log in
                    </Button>
                    <Button onClick={() => { navigate('/register'); setOpen(false) }}>
                      Get started
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}
