import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { useInView } from '@/hooks/useInView'

const testimonials = [
  {
    quote: 'Voyager predicted a local festival in Kyoto that became the highlight of our honeymoon. Nothing else came close.',
    author: 'Sarah Chen',
    role: 'Product Designer',
    avatar: 'SC',
  },
  {
    quote: 'The AI assistant knew our flight was delayed and suggested restaurants near the airport. Felt genuinely magical.',
    author: 'Marcus Webb',
    role: 'Startup Founder',
    avatar: 'MW',
  },
  {
    quote: 'Clean interface, thoughtful details, and the credibility leaderboard helped us pick Bali over three other options.',
    author: 'Priya Sharma',
    role: 'Travel Photographer',
    avatar: 'PS',
  },
]

export function Testimonials() {
  const [index, setIndex] = useState(0)
  const { ref, inView } = useInView()

  useEffect(() => {
    if (!inView) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % testimonials.length), 6000)
    return () => clearInterval(timer)
  }, [inView])

  return (
    <section ref={ref} className="py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-white">
            Loved by travelers worldwide
          </h2>
        </div>

        <div className="relative glass-strong rounded-3xl p-8 sm:p-12 min-h-[280px] flex flex-col justify-center">
          <Quote className="absolute top-8 left-8 h-10 w-10 text-brand-200 dark:text-brand-800" aria-hidden />

          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
              className="relative z-10"
            >
              <p className="text-xl sm:text-2xl text-slate-700 dark:text-slate-200 leading-relaxed font-medium text-center mb-8">
                &ldquo;{testimonials[index].quote}&rdquo;
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="h-12 w-12 rounded-full bg-brand-700 text-white flex items-center justify-center font-semibold text-sm">
                  {testimonials[index].avatar}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {testimonials[index].author}
                  </p>
                  <p className="text-sm text-slate-500">{testimonials[index].role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center gap-4 mt-8">
            <button
              type="button"
              onClick={() => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === index ? 'w-6 bg-brand-600' : 'w-2 bg-slate-300 dark:bg-slate-600'
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIndex((i) => (i + 1) % testimonials.length)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
