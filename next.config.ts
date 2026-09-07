import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const withMDX = createMDX({});

const nextConfig: NextConfig = {
  images: { unoptimized: true },
};

export default withMDX(nextConfig);
