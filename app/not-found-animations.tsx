'use client';

export default function NotFoundAnimations() {
  return (
    <>
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d0b14] via-[#110d1c] to-[#0d0b14]" />
        <div className="absolute inset-0 bg-cyber-grid opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#a855f7]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#38bdf8]/8 rounded-full blur-3xl" />
      </div>

      {/* Orbital Rings Animation */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-5">
        <div className="relative w-[300px] h-[300px]">
          <div className="absolute inset-0 border border-[#a855f7]/20 rounded-full animate-spin-slow" />
          <div className="absolute inset-6 border border-[#38bdf8]/20 rounded-full animate-spin-reverse" />
          <div
            className="absolute inset-12 border border-[#818cf8]/30 rounded-full animate-spin-slow"
            style={{ animationDuration: '10s' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#a855f7]/20 to-[#38bdf8]/20 rounded-full blur-xl animate-pulse" />
          </div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-5">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#a855f7]/30 rounded-full animate-float"
            style={{
              left: `${15 + i * 4}%`,
              top: `${10 + i * 3.5}%`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}
