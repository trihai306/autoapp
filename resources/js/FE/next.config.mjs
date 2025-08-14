import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
let nextConfig = {
    // Remove deprecated options
    // swcMinify and fastRefresh are enabled by default in newer Next.js versions
    
    // Use the correct property name for external packages
    serverExternalPackages: [],
    
    // Environment variables
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
        NEXT_PUBLIC_REVERB_APP_KEY: process.env.NEXT_PUBLIC_REVERB_APP_KEY || '93385i7cbeyurzx9ktyz',
        NEXT_PUBLIC_REVERB_HOST: process.env.NEXT_PUBLIC_REVERB_HOST || 'localhost',
        NEXT_PUBLIC_REVERB_PORT: process.env.NEXT_PUBLIC_REVERB_PORT || '8080',
        NEXT_PUBLIC_REVERB_SCHEME: process.env.NEXT_PUBLIC_REVERB_SCHEME || 'http',
    },
    
    // For SSL issues in development, we'll handle this differently
    // since env config is not allowed for NODE_TLS_REJECT_UNAUTHORIZED
};

if (process.env.ANALYZE === 'true') {
    const withBundleAnalyzer = require('@next/bundle-analyzer')({
        enabled: true,
    });
    nextConfig = withBundleAnalyzer(nextConfig);
}

export default withNextIntl(nextConfig);
