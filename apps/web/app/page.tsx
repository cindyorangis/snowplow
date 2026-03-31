import { CheckCircleIcon, CheckIcon } from '@heroicons/react/20/solid'

import Hero from '@/components/sections/Hero'
import Services from '@/components/sections/Services'

const whyUs = [
  {
    title: '24/7 Storm Response',
    body: 'We monitor forecasts around the clock and mobilize before and during every significant snowfall event.',
  },
  {
    title: 'Fully Insured',
    body: 'Snow Plow Services carries full liability insurance. Your property — and ours — is covered.',
  },
  {
    title: 'Serving Toronto & GTA',
    body: 'We service Toronto, North York, Scarborough, Etobicoke, and surrounding areas. Not sure if we cover your area? Get in touch.',
  },
  {
    title: 'Reliable Every Time',
    body: "We don't cancel because of bad weather. That's kind of the point.",
  },
]

export default function Home() {
  return (
    <div className="bg-white py-24 sm:py-32 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Hero />
        <Services />
        {/* Why Snow Plow */}
        <div className="mx-auto mt-24 max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Why Snow Plow Services?
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {whyUs.map((item) => (
              <li
                key={item.title}
                className="flex gap-x-3 rounded-2xl border border-gray-200 p-6 dark:border-gray-700"
              >
                <CheckCircleIcon className="mt-0.5 size-5 flex-none text-indigo-600 dark:text-indigo-400" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Service Area */}
        <div className="mx-auto mt-24 max-w-3xl rounded-2xl border border-gray-200 p-8 dark:border-gray-700">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Service Area
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            We currently service the following areas:
          </p>
          <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              'Toronto',
              'North York',
              'Scarborough',
              'Etobicoke',
              'East York',
              'York',
            ].map((area) => (
              <li
                key={area}
                className="flex items-center gap-x-2 text-sm text-gray-600 dark:text-gray-400"
              >
                <CheckIcon className="size-4 flex-none text-indigo-500" />
                {area}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            Not on the list?{' '}
            <a
              href="/contact"
              className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              Contact Us
            </a>{' '}
            - We may still be able to help.
          </p>
        </div>

        {/* How It Works */}
        <div className="mx-auto mt-24 max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            How It Works
          </h2>
          <ol className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Get a Free Quote',
                body: "Fill out our quote form with your address, property type, and services needed. We'll get back to you within 24 hours.",
              },
              {
                step: '02',
                title: 'We Assess Your Property',
                body: 'We confirm pricing, service windows, and any access notes like gate codes or tight spaces.',
              },
              {
                step: '03',
                title: 'Relax All Winter',
                body: "When it snows, we show up. You'll get a notification when your property has been cleared.",
              },
            ].map((item) => (
              <li
                key={item.step}
                className="rounded-2xl border border-gray-200 p-6 dark:border-gray-700"
              >
                <p className="text-3xl font-bold text-indigo-100 dark:text-indigo-900">
                  {item.step}
                </p>
                <p className="mt-2 font-semibold text-gray-900 dark:text-white">
                  {item.title}
                </p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
