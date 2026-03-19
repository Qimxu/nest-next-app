const { load } = require('js-yaml');
const { readFileSync } = require('fs');
const { join } = require('path');

function resolveConfigEnv(
  nodeEnv,
  { testEnvName = 'test', fallbackEnv = 'development' } = {},
) {
  const env = nodeEnv || fallbackEnv;
  return env === testEnvName ? fallbackEnv : env;
}

function loadYamlConfig(
  nodeEnv,
  { configDir = join(process.cwd(), 'config'), silent = false } = {},
) {
  const env = resolveConfigEnv(nodeEnv);
  const configFile = `app.config.${env}.yaml`;
  const configPath = join(configDir, configFile);

  try {
    return load(readFileSync(configPath, 'utf-8')) || {};
  } catch (e) {
    if (!silent) {
      console.warn(`Config file not found: ${configPath}`);
    }
    return {};
  }
}

module.exports = { loadYamlConfig, resolveConfigEnv };
