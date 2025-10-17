// next.config.js (ESM)
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

  // Giảm tải build tối đa cho máy RAM thấp
  productionBrowserSourceMaps: false,   // tắt sourcemaps production

  // Bỏ kiểm tra type & eslint trong bước build (giảm RAM và thời gian)
  typescript: { ignoreBuildErrors: true },
  eslint:     { ignoreDuringBuilds: true },

  // Tắt tối ưu ảnh (tránh pipeline optimizer ngốn bộ nhớ)
  images: { unoptimized: true },

  // Biến môi trường cần dùng ở runtime
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    NEXT_PUBLIC_REVERB_APP_KEY: process.env.NEXT_PUBLIC_REVERB_APP_KEY || '93385i7cbeyurzx9ktyz',
    NEXT_PUBLIC_REVERB_HOST: process.env.NEXT_PUBLIC_REVERB_HOST || 'localhost',
    NEXT_PUBLIC_REVERB_PORT: process.env.NEXT_PUBLIC_REVERB_PORT || '8080',
    NEXT_PUBLIC_REVERB_SCHEME: process.env.NEXT_PUBLIC_REVERB_SCHEME || 'http',
  },

  // Hạn chế số worker để không “bùng” RAM
  experimental: {
    workerThreads: false,
    cpus: 1,
  },

  // Loại bỏ devtool ở client trong build prod để nhẹ hơn
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.devtool = false;
    }
    return config;
  },

  // Tùy chọn: bật output standalone để deploy nhẹ hơn
  // output: 'standalone',
};

if (process.env.ANALYZE === 'true') {
  const withBundleAnalyzer = (await import('@next/bundle-analyzer')).default({
    enabled: true,
  });
  nextConfig = withBundleAnalyzer(nextConfig);
}

export default withNextIntl(nextConfig);
