/**
 * 国际化客户端工具库
 * 统一导出所有 i18n 相关的 hooks 和组件
 */

// 从统一配置文件导出
export {
  locales,
  defaultLocale,
  localeNames,
  localeDirection,
  localeConfig,
  type Locale,
  isValidLocale,
  getLocaleName,
} from '../../i18n.config';

// 导出 hooks
export { useTranslation, useNumber, useDateFormat } from './useTranslation';

// 导出组件
export { LanguageSwitcher } from './LanguageSwitcher';
