import { load } from 'js-yaml';
import { readFileSync } from 'fs';
import { join } from 'path';

export type YamlConfigLoadOptions = {
  /**
   * Which config folder to read from.
   * Defaults to `<cwd>/config`.
   */
  configDir?: string;
  /**
   * If NODE_ENV equals this value, we will fall back to `fallbackEnv`.
   * Defaults to `test -> development`.
   */
  testEnvName?: string;
  fallbackEnv?: string;
  /**
   * Suppress console warning when file doesn't exist.
   */
  silent?: boolean;
};

export function resolveConfigEnv(
  nodeEnv: string | undefined,
  {
    testEnvName = 'test',
    fallbackEnv = 'development',
  }: YamlConfigLoadOptions = {},
) {
  const env = nodeEnv || fallbackEnv;
  return env === testEnvName ? fallbackEnv : env;
}

export function loadYamlConfig(
  nodeEnv: string | undefined,
  options: YamlConfigLoadOptions = {},
): Record<string, any> {
  const { configDir = join(process.cwd(), 'config'), silent = false } = options;

  const env = resolveConfigEnv(nodeEnv, options);
  const configFile = `app.config.${env}.yaml`;
  const configPath = join(configDir, configFile);

  try {
    return (load(readFileSync(configPath, 'utf-8')) as any) || {};
  } catch (e) {
    if (!silent) {
      // eslint-disable-next-line no-console
      console.warn(`Config file not found: ${configPath}`);
    }
    return {};
  }
}
