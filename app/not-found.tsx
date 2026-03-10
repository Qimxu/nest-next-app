'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center px-4">
        {/* 404 数字 */}
        <h1 className="text-9xl font-bold text-gray-200 tracking-wider">404</h1>

        {/* 提示信息 */}
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">
          页面未找到
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          抱歉，您访问的页面不存在或已被移除。请检查URL是否正确，或返回首页继续浏览。
        </p>

        {/* 返回按钮 */}
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            返回首页
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-white text-gray-700 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            返回上页
          </button>
        </div>
      </div>
    </div>
  );
}
