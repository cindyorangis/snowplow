export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-center lg:px-8">
        <p className="mt-8 text-center text-sm/6 text-gray-600 md:order-1 md:mt-0 dark:text-gray-400">
          &copy; {new Date().getFullYear()} Cindy Orangis. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
