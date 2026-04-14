'use client'

import { useState } from 'react'
import { getSupabaseClient } from '@snowplow/lib/supabase'

import { CheckCircleIcon } from '@heroicons/react/16/solid'

const propertyTypes = [
  {
    id: 'residential',
    title: 'Residential',
    description: 'Driveway, walkway, steps',
  },
  {
    id: 'commercial',
    title: 'Commercial',
    description: 'Parking lot, loading dock',
  },
]

export default function QuotePage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quoteId, setQuoteId] = useState<string | null>(null)
  const [insertedRow, setInsertedRow] = useState<{
    id: string
    property_type: string
    address: string
    city: string
  } | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = e.currentTarget
    const data = new FormData(form)

    const supabase = getSupabaseClient()
    const { data: inserted, error: sbError } = await supabase
      .from('quote_requests')
      .insert({
        first_name: data.get('first-name') as string,
        last_name: data.get('last-name') as string,
        email: data.get('email') as string,
        address: data.get('street-address') as string,
        city: data.get('city') as string,
        province: data.get('region') as string,
        postal_code: data.get('postal-code') as string,
        property_type: data.get('property-type') as string,
        message: data.get('about') as string,
      })
      .select()
      .single()

    setLoading(false)

    if (sbError) {
      setError('Something went wrong. Please try again.')
      console.error(sbError)
      return
    }

    setInsertedRow(inserted)
    setQuoteId(inserted.id)
    setSubmitted(true)
  }

  if (submitted && quoteId) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center px-6 py-24 lg:px-8">
        <CheckCircleIcon className="size-12 text-indigo-600 dark:text-indigo-500" />
        <h2 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white">
          You're all set!
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          We'll review your request and get back to you shortly.
        </p>

        <div className="mt-8 w-full max-w-sm rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-white/10 dark:bg-white/5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Your quote summary
          </h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Reference #</dt>
              <dd className="font-mono text-xs text-gray-900 dark:text-white">
                {quoteId.slice(0, 8).toUpperCase()}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">
                Property type
              </dt>
              <dd className="capitalize text-gray-900 dark:text-white">
                {insertedRow?.property_type}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Address</dt>
              <dd className="text-right text-gray-900 dark:text-white">
                {insertedRow?.address}, {insertedRow?.city}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Status</dt>
              <dd className="text-gray-900 dark:text-white">Pending review</dd>
            </div>
          </dl>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <form onSubmit={handleSubmit}>
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
              Tell us about your property
            </h2>
            <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
              We&apos;ll use this to confirm service availability and size up
              the job.
            </p>

            <div className="mt-8 space-y-10">
              <fieldset>
                <legend className="text-sm/6 font-semibold text-gray-900 dark:text-white">
                  Property type
                </legend>
                <div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                  {propertyTypes.map((propertyType) => (
                    <label
                      key={propertyType.id}
                      aria-label={propertyType.title}
                      aria-description={propertyType.description}
                      className="group relative flex rounded-lg border border-gray-300 bg-white p-4 has-checked:outline-2 has-checked:-outline-offset-2 has-checked:outline-indigo-600 has-focus-visible:outline-3 has-focus-visible:-outline-offset-1 has-disabled:border-gray-400 has-disabled:bg-gray-200 has-disabled:opacity-25 dark:border-white/10 dark:bg-gray-800/50 dark:has-checked:bg-indigo-500/10 dark:has-checked:outline-indigo-500 dark:has-disabled:border-white/10 dark:has-disabled:bg-gray-800"
                    >
                      <input
                        defaultValue={propertyType.id}
                        defaultChecked={propertyType === propertyTypes[0]}
                        name="property-type"
                        type="radio"
                        className="absolute inset-0 appearance-none focus:outline-none"
                      />
                      <div className="flex-1">
                        <span className="block text-sm font-medium text-gray-900 dark:text-white">
                          {propertyType.title}
                        </span>
                        <span className="mt-1 block text-sm text-gray-500 dark:text-gray-400">
                          {propertyType.description}
                        </span>
                      </div>
                      <CheckCircleIcon
                        aria-hidden="true"
                        className="invisible size-5 text-indigo-600 group-has-checked:visible dark:text-indigo-500"
                      />
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label
                htmlFor="first-name"
                className="block text-sm/6 font-medium text-gray-900 dark:text-white"
              >
                First name
              </label>
              <div className="mt-2">
                <input
                  id="first-name"
                  name="first-name"
                  type="text"
                  autoComplete="given-name"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="last-name"
                className="block text-sm/6 font-medium text-gray-900 dark:text-white"
              >
                Last name
              </label>
              <div className="mt-2">
                <input
                  id="last-name"
                  name="last-name"
                  type="text"
                  autoComplete="family-name"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label
                htmlFor="email"
                className="block text-sm/6 font-medium text-gray-900 dark:text-white"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                />
              </div>
            </div>

            <div className="col-span-full">
              <label
                htmlFor="street-address"
                className="block text-sm/6 font-medium text-gray-900 dark:text-white"
              >
                Street address
              </label>
              <div className="mt-2">
                <input
                  id="street-address"
                  name="street-address"
                  type="text"
                  autoComplete="street-address"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                />
              </div>
            </div>

            <div className="sm:col-span-2 sm:col-start-1">
              <label
                htmlFor="city"
                className="block text-sm/6 font-medium text-gray-900 dark:text-white"
              >
                City
              </label>
              <div className="mt-2">
                <input
                  id="city"
                  name="city"
                  type="text"
                  autoComplete="address-level2"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="region"
                className="block text-sm/6 font-medium text-gray-900 dark:text-white"
              >
                Province
              </label>
              <div className="mt-2">
                <input
                  id="region"
                  name="region"
                  type="text"
                  autoComplete="address-level1"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="postal-code"
                className="block text-sm/6 font-medium text-gray-900 dark:text-white"
              >
                Postal code
              </label>
              <div className="mt-2">
                <input
                  id="postal-code"
                  name="postal-code"
                  type="text"
                  autoComplete="postal-code"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                />
              </div>
            </div>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full">
              <label
                htmlFor="about"
                className="block text-sm/6 font-medium text-gray-900 dark:text-white"
              >
                Message (optional)
              </label>
              <div className="mt-2">
                <textarea
                  id="about"
                  name="about"
                  rows={3}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                  defaultValue={''}
                />
              </div>
              <p className="mt-3 text-sm/6 text-gray-600 dark:text-gray-400">
                Write a few sentences about your inquiry.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button
            type="button"
            className="text-sm/6 font-semibold text-gray-900 dark:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:focus-visible:outline-indigo-500"
          >
            Send
          </button>
        </div>
        {error && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        setQuoteId(inserted.id) setSubmitted(true)
        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button
            type="button"
            className="text-sm/6 font-semibold text-gray-900 dark:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:focus-visible:outline-indigo-500"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  )
}
