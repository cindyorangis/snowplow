import Image from 'next/image'

import {
  HomeIcon,
  BuildingOffice2Icon,
  SparklesIcon,
} from '@heroicons/react/20/solid'

const features = [
  {
    name: 'Residential Snow Removal',
    description:
      'Driveway plowing, front walkways, and steps cleared after every snowfall of 2cm or more. No scheduling required — if it snows, we show up. End-of-driveway windrows included.',
    href: '/services',
    icon: HomeIcon,
    src: '/images/mike-cox-unsplash.jpg',
    alt: 'Snow plow clearing a residential driveway in Toronto',
  },
  {
    name: 'Commercial Snow Removal',
    description:
      'Parking lots, loading docks, and building entrances cleared before business hours. Commercial clients receive priority scheduling with guaranteed pre-dawn service.',
    href: '/services',
    icon: BuildingOffice2Icon,
    src: '/images/erik-mclean-unsplash.jpg',
    alt: 'Snow removal crew clearing a commercial parking lot',
  },
  {
    name: 'Salting & De-Icing',
    description:
      'Applied after every plow or as a standalone service during ice events. Professional-grade ice melt keeps your property safe and liability-free all winter.',
    href: '/services',
    icon: SparklesIcon,
    src: '/images/evgeny-arsenev-unsplash.jpg',
    alt: 'Professional applying ice melt salt to a cleared walkway',
  },
]

export default function Services() {
  return (
    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
      <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.name} className="flex flex-col">
            <div
              key={feature.src}
              className="overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 aspect-[4/3]"
            >
              <Image
                src={feature.src}
                alt={feature.alt}
                width={650}
                height={488}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <dt className="flex mt-12 items-center gap-x-3 text-base/7 font-semibold text-gray-900 sm:mt-18 dark:text-white">
              <feature.icon
                aria-hidden="true"
                className="size-5 flex-none text-indigo-600 dark:text-indigo-400"
              />
              {feature.name}
            </dt>
            <dd className="mt-4 flex flex-auto flex-col text-base/7 text-gray-600 dark:text-gray-400">
              <p className="flex-auto">{feature.description}</p>
              <p className="mt-6">
                <a
                  href={feature.href}
                  className="text-sm/6 font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Learn more <span aria-hidden="true">→</span>
                </a>
              </p>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
