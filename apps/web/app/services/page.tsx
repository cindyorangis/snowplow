import CTABlock from '@/components/sections/CTABlock'
import { CheckCircleIcon, CheckIcon } from '@heroicons/react/20/solid'

const features = [
  {
    name: 'Residential Snow Removal',
    tagline: 'Your driveway cleared before you wake up.',
    description:
      'We plow residential driveways, front walkways, and steps after every snowfall of 2cm or more. No scheduling required — if it snows, we show up.',
    includes: [
      'Driveway plowing and clearing',
      'Front walkway and steps',
      'End-of-driveway windrow removal',
      'Salting on request',
    ],
    available_as: 'Per-push or Seasonal Contract',
  },
  {
    name: 'Commercial Snow Removal',
    tagline: 'Open for business — no matter the weather.',
    description:
      'We service parking lots, loading docks, building entrances, and fire lanes. Commercial clients receive priority scheduling with guaranteed pre-dawn clearing.',
    includes: [
      'Full parking lot plowing and stacking',
      'Loading dock and dumpster area clearing',
      'Building entrance and walkway clearing',
      'Fire lane compliance maintenance',
      'Salting and de-icing',
    ],
    available_as: 'Seasonal Contract (recommended) or Per-push',
  },
  {
    name: 'Sidewalk & Walkway Clearing',
    tagline: 'Safe paths for everyone on your property.',
    description:
      'Slip-and-fall liability is real. We clear sidewalks, walkways, and pathways to keep your property safe and compliant with Toronto by-laws.',
    includes: [
      'Public sidewalk clearing',
      'Interior walkways and paths',
      'Back decks and side entries',
      'Salting and sand application',
    ],
    available_as: 'Standalone service or add-on to any plan',
  },
  {
    name: 'Salting & De-Icing',
    tagline: 'Clear surfaces. No black ice. No liability.',
    description:
      'Applied after every plow or as a standalone service during ice events. Professional-grade ice melt with eco-friendly low-sodium options available.',
    includes: [
      'Post-plow salt application',
      'Standalone ice event treatment',
      'Driveways, walkways, parking lots, and steps',
      'Eco-friendly salt options available',
    ],
    available_as: 'Add-on or standalone',
  },
  {
    name: 'Seasonal Contract',
    tagline: 'One flat rate. Zero surprises all winter.',
    description:
      'Pay once at the start of the season and we handle every storm — no per-visit billing, no watching the forecast, no calling to schedule.',
    includes: [
      'Unlimited plow visits all season (November – April)',
      'Priority scheduling over per-push clients',
      'Dedicated service window for your property',
      'Salting included or available as add-on',
    ],
    available_as:
      'Best for homeowners and businesses wanting predictable costs',
  },
  {
    name: 'Per-Push Service',
    tagline: 'Only pay when it snows.',
    description:
      'No commitment, no contract. Request service after each storm and pay per visit. Great for lighter winters or first-time customers.',
    includes: [
      'Driveway plowing per visit',
      'Front walkway and steps included',
      'Windrow removal included',
      'No season commitment required',
    ],
    available_as: 'Best for flexible or first-time customers',
  },
]

const whyUs = [
  {
    title: '24/7 Storm Response',
    body: 'We monitor forecasts around the clock and mobilize before and during every significant snowfall event.',
  },
  {
    title: 'Fully Insured',
    body: 'SnowPro Services carries full liability insurance. Your property — and ours — is covered.',
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

export default function Services() {
  return (
    <div className="bg-white py-24 sm:py-32 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400">
            Everything you need
          </h2>
          <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
            Snow Removal Services in Toronto & GTA
          </p>
          <p className="mt-6 text-lg/8 text-gray-600 dark:text-gray-300">
            From single driveways to full commercial lots — we show up after
            every storm so you don&apos;t have to.
          </p>
        </div>

        {/* Service Cards */}
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:max-w-none lg:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  {feature.available_as}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
                  {feature.name}
                </h3>
                <p className="mt-1 text-sm italic text-gray-500 dark:text-gray-400">
                  {feature.tagline}
                </p>
                <p className="mt-4 text-sm/6 text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
              {feature.includes && (
                <ul className="mt-6 space-y-2 border-t border-gray-100 pt-6 dark:border-gray-700">
                  {feature.includes.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-x-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <CheckIcon className="mt-0.5 size-4 flex-none text-indigo-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
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

        {/* Why SnowPro */}
        <div className="mx-auto mt-24 max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Why SnowPro Services?
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

        {/* CTA */}
        <div className="mt-24">
          <CTABlock />
        </div>
      </div>
    </div>
  )
}
