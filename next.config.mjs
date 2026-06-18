/** @type {import('next').NextConfig} */
const nextConfig = {
  // pglite uses WASM — allow it through Next.js bundler
  webpack: (config) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    return config;
  },
};

export default nextConfig;
