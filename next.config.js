const { load } = require('js-yaml');
const { readFileSync } = require('fs');
const { join } = require('path');
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n.ts');

// 加载配置
const env = process.env.NODE_ENV || 'development';
const configFile = `app.config.${env}.yaml`;
const configPath = join(process.cwd(), 'config', configFile);

let config = {};
try {
  config = load(readFileSync(configPath, 'utf-8')) || {};
} catch (e) {
  console.warn(`Config file not found: ${configPath}`);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  distDir: '.next',
  env: {
    API_BASE_URL: config.app?.apiBaseUrl || 'http://localhost:3000',
    NEXT_PUBLIC_API_BASE_URL:
      config.app?.apiBaseUrl || 'http://localhost:3000',
  },
};

module.exports = withNextIntl(nextConfig);
