import { Accordion, AccordionItem } from '@/components/ui/Accordion'

const faqs = [
  {
    q: 'How does AI event prediction work?',
    a: 'We analyze destination data, seasonal patterns, and historical events to surface festivals, concerts, and cultural happenings aligned with your trip dates.',
  },
  {
    q: 'Is my booking data secure?',
    a: 'Yes. All data is encrypted in transit and at rest. We use JWT authentication and never store payment card details on our servers.',
  },
  {
    q: 'Can I use Voyager without creating an account?',
    a: 'You can browse destinations publicly. Creating a free account unlocks trip planning, bookings, reviews, and the AI assistant.',
  },
  {
    q: 'How does the toxicity filter protect the community?',
    a: 'Every comment is scored before posting. High-toxicity content is blocked; borderline content shows a warning so you can revise before submitting.',
  },
  {
    q: 'Which external services power the app?',
    a: 'Weather, maps, food, flights, and AI assistants integrate with industry-leading APIs. The app works with graceful fallbacks when optional keys are not configured.',
  },
]

export function FAQ() {
  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-white mb-4">
            Frequently asked questions
          </h2>
        </div>
        <Accordion>
          {faqs.map((faq, i) => (
            <AccordionItem key={faq.q} question={faq.q} answer={faq.a} defaultOpen={i === 0} />
          ))}
        </Accordion>
      </div>
    </section>
  )
}
