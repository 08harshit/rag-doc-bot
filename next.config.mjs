/** @type {import('next').NextConfig} */
const nextConfig = {
    // Use webpack instead of turbopack for more stable hot reload
    webpack: (config, { dev }) => {
        if (dev) {
            config.watchOptions = {
                poll: 1000,
                aggregateTimeout: 300,
            };
        }
        return config;
    },
};

export default nextConfig;
