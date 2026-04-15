import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // 重写规则：将 /uploads/ 代理到 MinIO
  async rewrites() {
    // 本地开发：npm run dev 时使用 localhost:9000
    if (process.env.NODE_ENV === 'development') {
      return [{
        source: '/uploads/:path*',
        destination: 'http://localhost:9000/uploads/:path*',
      }];
    }

    // Docker容器环境：使用容器网络地址 minio:9000
    return [{
      source: '/uploads/:path*',
      destination: 'http://minio:9000/uploads/:path*',
    }];
  },
  // 对于较老的 Next.js 版本，使用 transpilePackages 替代
  transpilePackages: ["pdfjs-dist"],
};

export default nextConfig;
