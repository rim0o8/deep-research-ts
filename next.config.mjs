/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        typedRoutes: true,
        scrollRestoration: true,
    },
    typescript: {
        tsconfigPath: './tsconfig.build.json',
    }
};


export default nextConfig;
