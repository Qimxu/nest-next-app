const createNextIntlPlugin = require('next-intl/plugin');
const { loadYamlConfig } = require('./config/load-yaml-config');

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const config = loadYamlConfig(process.env.NODE_ENV);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: '.next',
  env: {
    API_BASE_URL: config.app?.apiBaseUrl || 'http://localhost:3000',
    NEXT_PUBLIC_API_BASE_URL: config.app?.apiBaseUrl || 'http://localhost:3000',
  },
  turbopack: {
    root: __dirname,
  },
};

module.exports = withNextIntl(nextConfig);
