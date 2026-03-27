export default function Hero() {
  return (
    <div className="mx-auto max-w-2xl lg:text-center">
      <h2 className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400">
        We plow. You sleep in.
      </h2>
      <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl lg:text-balance dark:text-white">
        Toronto&apos;s Trusted Snow & Ice Removal
      </p>
      <p className="mt-6 text-lg/8 text-gray-600 dark:text-gray-300">
        Serving Toronto and the GTA with fast, reliable snow plowing, salting,
        and ice removal. Residential driveways to commercial lots — we show up
        after every storm so you don&apos;t have to.
      </p>

      {/* CTA buttons */}
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <a
          href="/contact"
          className="rounded-md bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Get a Free Quote
        </a>
        <a
          href="/pricing"
          className="text-sm/6 font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          See Pricing <span aria-hidden="true">→</span>
        </a>
      </div>
    </div>
  )
}
