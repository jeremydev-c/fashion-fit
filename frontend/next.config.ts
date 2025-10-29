import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable standalone output for better deployment
  output: 'standalone',
  
  // Optimize images
  images: {
    domains: [
      'res.cloudinary.com', // Cloudinary images
      'lh3.googleusercontent.com', // Google profile pictures
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Environment variables validation
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  },
};

export default nextConfig;

