/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.igdb.com",
            },
        ],
    },
}

export default nextConfig
