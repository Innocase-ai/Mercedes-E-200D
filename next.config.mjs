/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'i.postimg.cc',
            },
            {
                protocol: 'https',
                hostname: 'assets.gqmagazine.fr',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
    },
    output: 'standalone',
};

export default nextConfig;
