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
      'End-of-driveway windrow removal (the pile left by city plows)',
      'Salting on request',
    ],
    available_as: 'Per-push or Seasonal Contract',
  },
  {
    name: 'Commercial Snow Removal',
    tagline: 'Open for business — no matter the weather.',
    description:
      'We service parking lots, loading docks, building entrances, and fire lanes. Commercial clients receive priority scheduling with guaranteed pre-dawn clearing so your property is ready before staff and customers arrive.',
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
      'Slip-and-fall liability is real. We clear sidewalks, walkways, and pathways to keep your property safe and compliant with municipal by-laws requiring cleared public sidewalks within 12 hours of a snowfall.',
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
      'Applied after every plow or as a standalone service during freezing rain and ice events. We use professional-grade ice melt and offer eco-friendly low-sodium options on request — better for your landscaping and the environment.',
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
      'Pay once at the start of the season and we handle every storm — no per-visit billing, no watching the forecast, no calling to schedule. Seasonal contract clients always receive priority service over per-push customers.',
    includes: [
      'Unlimited plow visits all season (November – April)',
      'Priority scheduling over per-push clients',
      'Dedicated service window for your property',
      'Salting included or available as add-on',
      'Season runs November 1 – April 30',
    ],
    available_as:
      'Homeowners and businesses who want peace of mind and predictable costs.',
  },
  {
    name: 'Per-Push Service',
    tagline: 'Only pay when it snows.',
    description:
      'No commitment, no contract. Request service after each storm and pay per visit. Great for lighter winters or customers who want flexibility. Note that seasonal contract clients receive priority scheduling — per-push clients are serviced after contracted properties.',
    available_as:
      'Customers who want flexibility or are trying us out for the first time.',
  },
]

export default function Services() {
  return (
    <div className="bg-white py-24 sm:py-32 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none">
          <div className="col-span-2">
            <h2 className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400">
              Everything you need
            </h2>
            <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
              Snow Removal Services in Toronto & GTA
            </p>
            <p className="mt-6 text-base/7 text-gray-700 dark:text-gray-300">
              From single driveways to full commercial lots — we show up after
              every storm so you don&apos;t have to.
            </p>
          </div>
          <dl className="col-span-3 grid grid-cols-1 gap-x-8 gap-y-10 text-base/7 text-gray-600 sm:grid-cols-2 lg:gap-y-16 dark:text-gray-400">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-9">
                <dt className="font-semibold text-gray-900 dark:text-white">
                  <CheckIcon
                    aria-hidden="true"
                    className="absolute left-0 top-1 size-5 text-indigo-500 dark:text-indigo-400"
                  />
                  {feature.name}
                </dt>
                <dd className="mt-2">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="mx-auto max-w-2xl text-base/7 text-gray-600 sm:text-lg dark:text-gray-400">
          <h2 className="mt-16 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            How It Works
          </h2>
          <ol className="mt-6 space-y-6 text-gray-600 dark:text-gray-400">
            <li>
              <span className="font-semibold">
                Step 1 &mdash; Get a Free Quote.
              </span>{' '}
              Fill out our quote form with your address, property type, and the
              services you need. We&apos;ll get back to you within 24 hours.
            </li>
            <li>
              <span className="font-semibold">
                Step 2 &mdash; We Assess Your Property.
              </span>{' '}
              We review your property details and confirm pricing, service
              windows, and any specific access notes (gate codes, tight spaces,
              etc.).
            </li>
            <li>
              <span className="font-semibold">
                Step 3 &mdash; Relax All Winter.
              </span>{' '}
              When it snows, we show up. You&apos;ll receive a notification when
              your property has been cleared.
            </li>
          </ol>
          <h2 className="mt-16 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Why SnowPro Services?
          </h2>
          <ul
            role="list"
            className="mt-8 max-w-2xl space-y-8 text-gray-600 dark:text-gray-400"
          >
            <li className="flex gap-x-3">
              <CheckCircleIcon
                aria-hidden="true"
                className="mt-1 size-5 flex-none text-indigo-600 dark:text-indigo-400"
              />
              <span>
                <strong className="font-semibold text-gray-900 dark:text-white">
                  24/7 Storm Response.
                </strong>{' '}
                We monitor forecasts around the clock and mobilize before and
                during every significant snowfall event.
              </span>
            </li>
            <li className="flex gap-x-3">
              <CheckCircleIcon
                aria-hidden="true"
                className="mt-1 size-5 flex-none text-indigo-600 dark:text-indigo-400"
              />
              <span>
                <strong className="font-semibold text-gray-900 dark:text-white">
                  Fully Insured.
                </strong>{' '}
                SnowPro Services carries full liability insurance. Your property
                — and ours — is covered.
              </span>
            </li>
            <li className="flex gap-x-3">
              <CheckCircleIcon
                aria-hidden="true"
                className="mt-1 size-5 flex-none text-indigo-600 dark:text-indigo-400"
              />
              <span>
                <strong className="font-semibold text-gray-900 dark:text-white">
                  Serving Toronto & GTA.
                </strong>{' '}
                We service Toronto, North York, Scarborough, Etobicoke, and
                surrounding areas. Not sure if we cover your area? Get in touch.
              </span>
            </li>
            <li className="flex gap-x-3">
              <CheckCircleIcon
                aria-hidden="true"
                className="mt-1 size-5 flex-none text-indigo-600 dark:text-indigo-400"
              />
              <span>
                <strong className="font-semibold text-gray-900 dark:text-white">
                  Reliable Every Time.
                </strong>{' '}
                We don&apos;t cancel because of bad weather. That&apos;s kind of
                the point.
              </span>
            </li>
          </ul>
          <h2 className="mt-16 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Service Area
          </h2>
          <div className="mt-6 text-gray-600 dark:text-gray-400">
            <p>We currently service the following areas:</p>
            <ul className="mt-2 ml-5 list-disc space-y-1">
              <li>Toronto (all neighbourhoods)</li>
              <li>North York</li>
              <li>Scarborough</li>
              <li>Etobicoke</li>
              <li>East York</li>
              <li>York</li>
            </ul>
            <p className="mt-4">
              Not on the list? <strong>Contact us</strong> — we may still be
              able to help depending on your location.
            </p>
          </div>
          <CTABlock />
        </div>
      </div>
    </div>
  )
}
