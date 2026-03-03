import {
  ArrowPathIcon,
  CloudArrowUpIcon,
  LockClosedIcon,
} from '@heroicons/react/20/solid'

const features = [
  {
    name: 'Residential',
    description:
      'Commodo nec sagittis tortor mauris sed. Turpis tortor quis scelerisque diam id accumsan nullam tempus. Pulvinar etiam lacus volutpat eu.',
    href: '#',
    icon: CloudArrowUpIcon,
  },
  {
    name: 'Commercial',
    description:
      'Pellentesque enim a commodo malesuada turpis eleifend risus. Facilisis donec placerat sapien consequat tempor fermentum nibh.',
    href: '#',
    icon: LockClosedIcon,
  },
  {
    name: 'Salting & De-icing',
    description:
      'Pellentesque sit elit congue ante nec amet. Dolor aenean curabitur viverra suspendisse iaculis eget. Nec mollis placerat ultricies euismod.',
    href: '#',
    icon: ArrowPathIcon,
  },
]

export default function Services() {
  return (
    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
      <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.name} className="flex flex-col">
            <dt className="flex items-center gap-x-3 text-base/7 font-semibold text-gray-900 dark:text-white">
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
