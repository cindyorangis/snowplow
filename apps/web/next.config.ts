import path from 'path'
import type { NextConfig } from 'next'
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../../'), // point to monorepo root
  trailingSlash: false,

  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.snowplow.services' }],
        destination: 'https://snowplow.services/:path*',
        permanent: true,
      },
    ]
  },
} satisfies NextConfig

export default withBundleAnalyzer(nextConfig)
