import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'

const titles = {
  '/': 'Voyager — AI-Powered Travel Planning',
  '/destinations': 'Explore Destinations — Voyager',
  '/trips': 'My Trips — Voyager',
  '/login': 'Sign In — Voyager',
  '/register': 'Create Account — Voyager',
}

export function SEO() {
  const { pathname } = useLocation()
  const base = titles[pathname] || 'Voyager Travel'
  const title = pathname.startsWith('/destinations/') ? 'Destination — Voyager' : base

  return (
    <Helmet>
      <title>{title}</title>
      <meta
        name="description"
        content="Premium AI travel planning — discover destinations, predict events, book trips, and get context-aware assistance."
      />
      <meta name="theme-color" content="#4338a8" />
    </Helmet>
  )
}
