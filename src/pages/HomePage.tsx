import { Hero } from '@/components/sections/Hero'
import { Features } from '@/components/sections/Features'
import { Stats } from '@/components/sections/Stats'
import { Testimonials } from '@/components/sections/Testimonials'
import { Pricing } from '@/components/sections/Pricing'
import { FAQ } from '@/components/sections/FAQ'

export function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <Stats />
      <Testimonials />
      <Pricing />
      <FAQ />
    </>
  )
}
