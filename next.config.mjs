import createNextIntlPlugin from 'next-intl/plugin';

// 1. Explicitly point the plugin to your root i18n.ts file
const withNextIntl = createNextIntlPlugin('./i18n.ts');

// 2. Declare nextConfig ONLY ONCE
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

// 3. Export the wrapped config
export default withNextIntl(nextConfig);