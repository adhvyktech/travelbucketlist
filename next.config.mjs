import withPWA from 'next-pwa'

const config = {
  reactStrictMode: true,
  swcMinify: true,
}

const nextConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
})(config)

export default nextConfig