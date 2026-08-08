/** @type {import('next').NextConfig} */
const nextConfig = {
    devIndicators: false,
    allowedDevOrigins: process.env.ALLOWED_DEV_ORIGINS?.split(',') ?? []
}

export default nextConfig
