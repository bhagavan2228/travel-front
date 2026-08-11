import { Link } from 'react-router-dom'
import { Compass, Globe, Share2, Mail } from 'lucide-react'

const footerLinks = {
  Product: [
    { label: 'Features', to: '/#features' },
    { label: 'Destinations', to: '/destinations' },
    { label: 'Pricing', to: '/#pricing' },
  ],
  Company: [
    { label: 'About', to: '#' },
    { label: 'Blog', to: '#' },
    { label: 'Careers', to: '#' },
  ],
  Legal: [
    { label: 'Privacy', to: '#' },
    { label: 'Terms', to: '#' },
  ],
}

const social = [
  { icon: Globe, label: 'Website', href: '#' },
  { icon: Share2, label: 'Share', href: '#' },
  { icon: Mail, label: 'Contact', href: '#' },
]

export function Footer() {
  return (
    <footer className="border-t border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-white">
                <Compass className="h-5 w-5" />
              </span>
              <span className="font-display text-lg font-semibold">Voyager</span>
            </Link>
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
              Premium AI travel planning for the modern explorer.
            </p>
            <div className="flex gap-3 mt-6">
              {social.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="p-2.5 rounded-xl glass hover:bg-white dark:hover:bg-white/10 transition-colors"
                >
                  <Icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </a>
              ))}
            </div>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-slate-500 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-slate-200/60 dark:border-white/5 flex flex-col sm:flex-row justify-between gap-4 text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Voyager Travel. All rights reserved.</p>
          <p>Built with React & Tailwind CSS</p>
        </div>
      </div>
    </footer>
  )
}
