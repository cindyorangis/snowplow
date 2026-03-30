import CTABlock from '@/components/sections/CTABlock'
import { CheckIcon } from '@heroicons/react/20/solid'

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

        {/* CTA */}
        <div className="mt-24">
          <CTABlock />
        </div>
      </div>
    </div>
  )
}
