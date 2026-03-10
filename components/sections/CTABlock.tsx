export default function CTABlock() {
  return (
    <div className="bg-white pt-12 dark:bg-gray-900">
      <div className="px-6 pt-20 border-t border-gray-200 dark:border-gray-700 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg/8 text-gray-600 dark:text-gray-300">
            Get a free, no-obligation quote for your home or business.
            We&apos;ll confirm your service area, walk you through your options,
            and have you set up before the first storm hits.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="#"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
            >
              Get a Free Quote
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
