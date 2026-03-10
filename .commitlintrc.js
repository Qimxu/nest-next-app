/**
 * Commitlint 配置
 * 基于 @commitlint/config-conventional 规范
 *
 * 提交格式: type(scope): subject
 *
 * 类型说明:
 * - feat:     新功能
 * - fix:      修复 bug
 * - docs:     文档更新
 * - style:    代码格式（不影响功能）
 * - refactor: 重构（不是新功能也不是修复 bug）
 * - perf:     性能优化
 * - test:     添加测试
 * - chore:    构建过程或辅助工具的变动
 * - revert:   回退
 * - build:    构建系统或外部依赖项的更改
 */

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 类型定义
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'chore',
        'revert',
        'build',
      ],
    ],
    // subject 不能为空
    'subject-empty': [2, 'never'],
    // subject 不能以句号结尾
    'subject-full-stop': [2, 'never', '.'],
    // subject 大小写
    'subject-case': [0],
    // type 不能为空
    'type-empty': [2, 'never'],
    // type 格式
    'type-case': [2, 'always', 'lower-case'],
    // header 最大长度
    'header-max-length': [2, 'always', 100],
    // body 以空行开头
    'body-leading-blank': [2, 'always'],
    // footer 以空行开头
    'footer-leading-blank': [2, 'always'],
  },
};
