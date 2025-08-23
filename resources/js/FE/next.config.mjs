import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';
import { fileURLToPath } from 'url';

const withNextIntl = createNextIntlPlugin();

// Xác định __dirname trong ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
let nextConfig = {
    // Cố định workspace root để Next không suy luận sai (đa lockfiles)
    outputFileTracingRoot: __dirname,

    // Remove deprecated options
    // swcMinify and fastRefresh are enabled by default in newer Next.js versions
    
    // Use the correct property name for external packages
    serverExternalPackages: [],
    
    // Thêm cấu hình để ổn định hơn
    // serverComponentsExternalPackages đã được chuyển thành serverExternalPackages
    
    // Tắt một số tính năng có thể gây lỗi
    typescript: {
        ignoreBuildErrors: false,
    },
    
    eslint: {
        ignoreDuringBuilds: false,
    },
    
    // Tắt một số warning không cần thiết
    onDemandEntries: {
        maxInactiveAge: 25 * 1000,
        pagesBufferLength: 2,
    },
    
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
