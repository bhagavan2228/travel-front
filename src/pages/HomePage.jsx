import { Hero } from '@/components/sections/Hero'
import { Features } from '@/components/sections/Features'
import { Testimonials } from '@/components/sections/Testimonials'
import { TrendingDestinations } from '@/components/sections/TrendingDestinations'
import { FAQ } from '@/components/sections/FAQ'

export function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <TrendingDestinations />
      <Testimonials />
      <FAQ />
    </>
  )
}
