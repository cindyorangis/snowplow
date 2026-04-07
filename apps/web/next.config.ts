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
} satisfies NextConfig

export default withBundleAnalyzer(nextConfig)
