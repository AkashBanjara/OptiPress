import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development", // Disable service worker in development to allow hot-reloading without caching issues
});

const nextConfig: NextConfig = {
  turbopack: {},
};

export default withPWA(nextConfig);
