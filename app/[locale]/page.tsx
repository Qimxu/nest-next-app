'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const t = useTranslations();
  const _locale = useLocale();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const coreFeatures = [
    {
      icon: '🔥',
      title: t('home.coreFeatures.singleProcess.title'),
      description: t('home.coreFeatures.singleProcess.description'),
      highlight: t('home.coreFeatures.singleProcess.highlight'),
      problem: t('home.coreFeatures.singleProcess.problem'),
      solution: t('home.coreFeatures.singleProcess.solution'),
    },
    {
      icon: '🔐',
      title: t('home.coreFeatures.ssrAuth.title'),
      description: t('home.coreFeatures.ssrAuth.description'),
      highlight: t('home.coreFeatures.ssrAuth.highlight'),
      problem: t('home.coreFeatures.ssrAuth.problem'),
      solution: t('home.coreFeatures.ssrAuth.solution'),
    },
    {
      icon: '🎨',
      title: t('home.coreFeatures.uiComponents.title'),
      description: t('home.coreFeatures.uiComponents.description'),
      highlight: t('home.coreFeatures.uiComponents.highlight'),
      problem: t('home.coreFeatures.uiComponents.problem'),
      solution: t('home.coreFeatures.uiComponents.solution'),
    },
    {
      icon: '⚡',
      title: t('home.coreFeatures.fullStack.title'),
      description: t('home.coreFeatures.fullStack.description'),
      highlight: t('home.coreFeatures.fullStack.highlight'),
      problem: t('home.coreFeatures.fullStack.problem'),
      solution: t('home.coreFeatures.fullStack.solution'),
    },
  ];

  const features = [
    {
      icon: '⚡',
      title: t('home.features.nestjs.title'),
      description: t('home.features.nestjs.description'),
    },
    {
      icon: '🚀',
      title: t('home.features.nextjs.title'),
      description: t('home.features.nextjs.description'),
    },
    {
      icon: '🔒',
      title: t('home.features.auth.title'),
      description: t('home.features.auth.description'),
    },
    {
      icon: '📦',
      title: t('home.features.redis.title'),
      description: t('home.features.redis.description'),
    },
    {
      icon: '🌐',
      title: t('home.features.i18n.title'),
      description: t('home.features.i18n.description'),
    },
    {
      icon: '💻',
      title: t('home.features.typescript.title'),
      description: t('home.features.typescript.description'),
    },
  ];

  const techStack = [
    { name: 'Next.js 14', color: '#38bdf8', tag: 'Frontend' },
    { name: 'NestJS', color: '#a855f7', tag: 'Backend' },
    { name: 'TypeScript', color: '#818cf8', tag: 'Language' },
    { name: 'MySQL', color: '#4479A1', tag: 'Database' },
    { name: 'Redis', color: '#DC382D', tag: 'Cache' },
    { name: 'Tailwind', color: '#38bdf8', tag: 'Styling' },
    { name: 'TypeORM', color: '#E83524', tag: 'ORM' },
    { name: 'next-intl', color: '#10B981', tag: 'i18n' },
  ];

  const codeExamples = [
    {
      title: t('home.codeExamples.ssrAuth.title'),
      code: `// SSR 认证 - 无闪烁获取用户信息
const user = await getServerFullUser();
// 自动解析 cookie 中的 JWT
// 服务端获取用户详情
// 首屏无需 loading 状态`,
    },
    {
      title: t('home.codeExamples.passwordToggle.title'),
      code: `// 密码显示/隐藏切换
const [showPassword, setShowPassword] = useState(false);
<input
  type={showPassword ? 'text' : 'password'}
/>
<button onClick={() => setShowPassword(!showPassword)}>
  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
</button>`,
    },
    {
      title: t('home.codeExamples.apiResponse.title'),
      code: `// 统一 API 响应格式
{
  code: 200,
  data: { user: {...} },
  message: "success",
  timestamp: 1710000000000,
  path: "/api/users"
}`,
    },
  ];

  const steps = [
    {
      step: '01',
      title: t('home.quickStart.step1.title'),
      desc: t('home.quickStart.step1.desc'),
      command: 'git clone https://github.com/Qimxu/nest-next-app.git',
    },
    {
      step: '02',
      title: t('home.quickStart.step2.title'),
      desc: t('home.quickStart.step2.desc'),
      command: 'cp .env.example .env && npm install',
    },
    {
      step: '03',
      title: t('home.quickStart.step3.title'),
      desc: t('home.quickStart.step3.desc'),
      command: 'npm run start:dev',
    },
  ];

  const uiShowcases = [
    {
      title: t('home.showcases.passwordInput.title'),
      description: t('home.showcases.passwordInput.description'),
      icon: '👁️',
    },
    {
      title: t('home.showcases.resetPassword.title'),
      description: t('home.showcases.resetPassword.description'),
      icon: '🔑',
    },
    {
      title: t('home.showcases.i18nRoutes.title'),
      description: t('home.showcases.i18nRoutes.description'),
      icon: '🌍',
    },
    {
      title: t('home.showcases.responsiveDesign.title'),
      description: t('home.showcases.responsiveDesign.description'),
      icon: '📱',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0d0b14] relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d0b14] via-[#110d1c] to-[#0d0b14]" />
        <div className="absolute inset-0 bg-cyber-grid opacity-40" />
        {/* Purple orb — NestJS */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#a855f7]/12 rounded-full blur-3xl" />
        {/* Blue orb — Next.js */}
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#38bdf8]/10 rounded-full blur-3xl" />
        {/* Indigo center orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#818cf8]/8 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-16">
        <div
          className={`text-center max-w-5xl mx-auto transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight font-['Orbitron'] animate-fade-in-up delay-100">
            <span className="text-white">{t('home.title')}</span>
            <br />
            <span className="text-gradient">{t('home.titleHighlight')}</span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            {t('home.description')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
            <a href="/docs" className="btn-cyber">
              {t('home.cta.docs')}
            </a>
          </div>

          {/* Tech Stack */}
          <div className="mt-16 pt-8 border-t border-white/5 animate-fade-in-up delay-400">
            <p className="font-['Orbitron'] text-xs tracking-widest text-gray-500 mb-4 uppercase">
              {t('home.techStack')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {techStack.map((tech) => (
                <div
                  key={tech.name}
                  className="flex items-center gap-2 px-4 py-2 bg-white/4 border border-white/8 hover:border-[#a855f7]/40 hover:bg-[#a855f7]/8 transition-all duration-300 rounded-xl group"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: tech.color }}
                  />
                  <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                    {tech.name}
                  </span>
                  <span className="text-xs text-gray-600 font-['Orbitron']">
                    {tech.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Features - 框架特色 */}
      <section id="core-features" className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#a855f7]/10 border border-[#a855f7]/30 rounded-full mb-6">
              <span className="w-2 h-2 bg-[#a855f7] rounded-full animate-pulse" />
              <span className="text-sm text-[#a855f7] font-medium">
                {t('home.coreFeatures.badge')}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-['Orbitron'] text-white">
              <span className="text-[#a855f7]">&lt;</span>
              {t('home.coreFeatures.title')}
              <span className="text-[#a855f7]">/&gt;</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {t('home.coreFeatures.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coreFeatures.map((feature, index) => (
              <div
                key={index}
                className="card-cyber p-8 rounded-2xl group hover:border-[#a855f7]/40 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-[#a855f7] transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed mb-4">
                      {feature.description}
                    </p>
                    {/* Problem vs Solution */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-start gap-2 text-sm">
                        <span className="text-red-400 font-medium flex-shrink-0">
                          {t('home.problemLabel')}:
                        </span>
                        <span className="text-gray-500">{feature.problem}</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <span className="text-green-400 font-medium flex-shrink-0">
                          {t('home.solutionLabel')}:
                        </span>
                        <span className="text-gray-500">
                          {feature.solution}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#38bdf8]">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature.highlight}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Examples Section */}
      <section className="relative z-10 py-24 px-6 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-['Orbitron'] text-white">
              <span className="text-[#38bdf8]">&lt;</span>
              {t('home.codeExamples.title')}
              <span className="text-[#38bdf8]">/&gt;</span>
            </h2>
            <p className="text-gray-400 text-lg">
              {t('home.codeExamples.subtitle')}
            </p>
          </div>

          <div className="card-cyber rounded-2xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-white/10">
              {codeExamples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${
                    activeTab === index
                      ? 'text-[#38bdf8] bg-[#38bdf8]/10 border-b-2 border-[#38bdf8]'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {example.title}
                </button>
              ))}
            </div>
            {/* Code Content */}
            <div className="p-6 bg-[#0a090f]">
              <pre className="text-sm text-gray-300 font-mono leading-relaxed overflow-x-auto">
                <code>{codeExamples[activeTab].code}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* UI Showcases */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-['Orbitron'] text-white">
              <span className="text-[#818cf8]">&lt;</span>
              {t('home.showcases.title')}
              <span className="text-[#818cf8]">/&gt;</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {t('home.showcases.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {uiShowcases.map((showcase, index) => (
              <div
                key={index}
                className="card-cyber p-6 rounded-2xl text-center group hover:scale-105 transition-transform"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                  {showcase.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">
                  {showcase.title}
                </h3>
                <p className="text-sm text-gray-400">{showcase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="relative z-10 py-24 px-6 bg-white/[0.01]"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-['Orbitron'] text-white">
              <span className="text-[#a855f7]">&lt;</span>
              {t('home.features.title')}
              <span className="text-[#a855f7]">/&gt;</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {t('home.features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="card-cyber p-8 rounded-2xl group">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section
        id="architecture"
        className="relative z-10 py-24 px-6 bg-white/[0.01]"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-['Orbitron'] text-white">
              <span className="text-[#38bdf8]">&lt;</span>
              {t('home.architecture.title')}
              <span className="text-[#38bdf8]">/&gt;</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {t('home.architecture.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Frontend — Next.js (Blue) */}
            <div className="card-cyber p-8 rounded-2xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#38bdf8]/10 border border-[#38bdf8]/30 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-[#38bdf8]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {t('home.architecture.frontend')}
                  </h3>
                  <p className="text-[#38bdf8] text-sm">Next.js 14</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed">
                {t('home.architecture.frontendDesc')}
              </p>
            </div>

            {/* Backend — NestJS (Purple) */}
            <div className="card-cyber p-8 rounded-2xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/30 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-[#a855f7]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.75L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.75m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {t('home.architecture.backend')}
                  </h3>
                  <p className="text-[#a855f7] text-sm">NestJS</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed">
                {t('home.architecture.backendDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section id="start" className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-['Orbitron'] text-white">
              <span className="text-[#818cf8]">&lt;</span>
              {t('home.quickStart.title')}
              <span className="text-[#818cf8]">/&gt;</span>
            </h2>
            <p className="text-gray-400 text-lg">
              {t('home.quickStart.subtitle')}
            </p>
          </div>

          <div className="space-y-6">
            {steps.map((item, index) => (
              <div
                key={index}
                className="card-cyber rounded-2xl p-6 group hover:border-[#a855f7]/30 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="text-4xl font-bold text-[#a855f7]/30 font-['Orbitron'] w-16 flex-shrink-0 group-hover:text-[#a855f7]/50 transition-colors">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1 text-white group-hover:text-[#a855f7] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-3">{item.desc}</p>
                  </div>
                  {item.command && (
                    <div className="md:w-auto">
                      <code className="px-4 py-2 bg-[#0a090f] border border-white/10 rounded-lg text-sm text-[#38bdf8] font-mono">
                        {item.command}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <a
              href="https://github.com/Qimxu/nest-next-app"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cyber"
            >
              {t('home.cta.getStarted')}
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Glowing card */}
          <div className="relative p-12 rounded-3xl border border-[#a855f7]/20 bg-gradient-to-br from-[#a855f7]/6 to-[#38bdf8]/6 overflow-hidden">
            <div className="absolute inset-0 bg-[#a855f7]/5 rounded-3xl blur-xl" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-['Orbitron'] text-white">
                {t('home.cta.title')}
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                {t('home.cta.description')}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="https://github.com/Qimxu/nest-next-app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-cyber"
                >
                  {t('home.cta.getStarted')}
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>
                <a href="/docs" className="btn-cyber-outline">
                  {t('api.documentation')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-gradient-to-b from-transparent to-[#0a090f]/50">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#a855f7]/20 to-[#38bdf8]/20 border border-[#a855f7]/30 flex items-center justify-center">
                  <Image
                    src="/static/logo.png"
                    alt="Logo"
                    width={24}
                    height={24}
                  />
                </div>
                <span className="font-['Orbitron'] text-lg font-bold">
                  <span className="text-[#a855f7]">NEST</span>
                  <span className="text-[#38bdf8]">NEXT</span>
                </span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                {t('home.footer.tagline')}
              </p>
              {/* Social Icons */}
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/Qimxu/nest-next-app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-[#a855f7] hover:border-[#a855f7]/50 hover:bg-[#a855f7]/10 transition-all"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="font-['Orbitron'] text-sm font-semibold text-white mb-4 tracking-wider">
                {t('home.footer.product')}
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#features"
                    className="text-sm text-gray-500 hover:text-[#a855f7] transition-colors"
                  >
                    核心特性
                  </a>
                </li>
                <li>
                  <a
                    href="#core-features"
                    className="text-sm text-gray-500 hover:text-[#a855f7] transition-colors"
                  >
                    框架特色
                  </a>
                </li>
                <li>
                  <a
                    href="#architecture"
                    className="text-sm text-gray-500 hover:text-[#a855f7] transition-colors"
                  >
                    架构设计
                  </a>
                </li>
                <li>
                  <a
                    href="/docs"
                    className="text-sm text-gray-500 hover:text-[#a855f7] transition-colors"
                  >
                    开发文档
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h4 className="font-['Orbitron'] text-sm font-semibold text-white mb-4 tracking-wider">
                {t('home.footer.resources')}
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://nestjs.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:text-[#a855f7] transition-colors"
                  >
                    NestJS 官网
                  </a>
                </li>
                <li>
                  <a
                    href="https://nextjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:text-[#a855f7] transition-colors"
                  >
                    Next.js 官网
                  </a>
                </li>
                <li>
                  <a
                    href="https://tailwindcss.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:text-[#a855f7] transition-colors"
                  >
                    Tailwind CSS
                  </a>
                </li>
                <li>
                  <a
                    href="https://next-intl-docs.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:text-[#a855f7] transition-colors"
                  >
                    next-intl
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Column */}
            <div>
              <h4 className="font-['Orbitron'] text-sm font-semibold text-white mb-4 tracking-wider">
                {t('home.footer.contact')}
              </h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm text-gray-500">
                  <svg
                    className="w-4 h-4 text-[#a855f7]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                  <a
                    href="mailto:xqian7024@gmail.com"
                    className="hover:text-[#a855f7] transition-colors"
                  >
                    xqian7024@gmail.com
                  </a>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-500">
                  <svg
                    className="w-4 h-4 text-[#38bdf8]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                    />
                  </svg>
                  <a
                    href="https://qimxu.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#38bdf8] transition-colors"
                  >
                    qimxu.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-600">
                © {new Date().getFullYear()} NESTNEXT. All rights reserved.
              </p>
              {/* ICP Filing */}
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-600">青绪Max</span>
                <span className="text-gray-700">|</span>
                <a
                  href="https://beian.miit.gov.cn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
                >
                  粤ICP备2026027454号-1
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
