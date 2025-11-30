/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // External packages that should be processed by Webpack instead of Turbopack
  serverExternalPackages: ["ipfs-http-client", "electron-fetch"],
  // Webpack configuration (fallback for non-Turbopack builds)
  webpack: (config, { isServer, webpack }) => {
    // Fixes npm packages that depend on `electron` module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        electron: false,
        "ipfs-http-client": false,
      };
    }
    // For server-side, ignore electron module
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push("electron");
      // Also add resolve alias to stub electron
      config.resolve.alias = {
        ...config.resolve.alias,
        electron: false,
      };
    }
    // Ignore electron module for both client and server
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^electron$/,
      })
    );
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    config.output.webassemblyModuleFilename = "static/wasm/[modulehash].wasm";
    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/async",
    });
    return config;
  },
};

export default nextConfig;
