"use client";

import { useEffect, useState } from "react";
import {
  FaShieldAlt,
  FaHeart,
  FaTruck,
  FaUndoAlt,
} from "react-icons/fa";

const iconsMap = {
  shield:  <FaShieldAlt className="w-5 h-5 sm:w-6 sm:h-6" />,
  heart:   <FaHeart     className="w-5 h-5 sm:w-6 sm:h-6" />,
  truck:   <FaTruck     className="w-5 h-5 sm:w-6 sm:h-6" />,
  refresh: <FaUndoAlt   className="w-5 h-5 sm:w-6 sm:h-6" />,
};

export default function AboutPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/data?collection=about");
        if (!res.ok) throw new Error("فشل تحميل بيانات الصفحة");
        const arr = await res.json();
        setData(arr[0]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border border-stone-300 border-t-stone-700 rounded-full animate-spin" />
          <span className="text-stone-400 text-xs tracking-widest">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <p className="text-stone-600 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="border border-stone-300 text-stone-500 px-6 py-2 text-xs tracking-widest hover:border-stone-500 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  const { hero, story, stats, values, team, cta } = data;

  return (
    <div dir="rtl" className="min-h-screen bg-white text-stone-800" style={{ fontFamily: "'Cairo', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap');
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out both; }
      `}</style>

      {/* ── Hero ── */}
      <section className="relative h-56 sm:h-72 md:h-96 flex items-center justify-center overflow-hidden bg-stone-900">
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80"
          alt="hero"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative z-10 text-center px-4 space-y-3 animate-fade-in w-full max-w-2xl mx-auto">
          <div className="flex justify-center">
            <div className="border border-stone-400/50 px-4 sm:px-8 py-1.5 backdrop-blur-sm">
              <span className="text-stone-300 text-[10px] sm:text-xs tracking-[0.3em] sm:tracking-[0.5em] uppercase">Bazaar Doha</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white leading-none">
            {hero.title}
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.3em]">{hero.subtitle}</p>
          <p className="text-stone-400 text-xs sm:text-sm max-w-xs sm:max-w-md mx-auto leading-relaxed">{hero.description}</p>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-stone-900 py-8 sm:py-10">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center">
          {stats.map((stat, i) => (
            <div key={i} className="space-y-1 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <p className="text-white font-black text-2xl sm:text-3xl">{stat.value}</p>
              <p className="text-stone-400 text-[10px] sm:text-xs tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Story ── */}
      <section className="py-12 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto space-y-5">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="h-px w-8 sm:w-12 bg-stone-800" />
            <h2 className="text-xl sm:text-2xl font-bold text-stone-800">{story.title}</h2>
          </div>
          {story.paragraphs.map((p, i) => (
            <p key={i} className="text-stone-500 text-sm leading-loose animate-fade-in" style={{ animationDelay: `${i * 150}ms` }}>
              {p}
            </p>
          ))}
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-12 sm:py-16 px-4 bg-stone-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 space-y-2">
            <div className="flex justify-center items-center gap-3">
              <div className="h-px w-8 sm:w-12 bg-stone-800" />
              <h2 className="text-xl sm:text-2xl font-bold text-stone-800">قيمنا</h2>
              <div className="h-px w-8 sm:w-12 bg-stone-800" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {values.map((val, i) => (
              <div
                key={i}
                className="bg-white border border-stone-200 p-5 sm:p-6 space-y-3 hover:border-stone-400 hover:shadow-md transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-stone-100 border border-stone-300 flex items-center justify-center text-stone-700">
                  {iconsMap[val.icon]}
                </div>
                <h3 className="text-stone-800 font-bold text-sm">{val.title}</h3>
                <p className="text-stone-400 text-xs leading-relaxed">{val.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-16 sm:py-24 px-4 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80"
          alt="cta background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6 sm:space-y-8">
          <div className="flex justify-center">
            <div className="border border-stone-400/50 px-4 sm:px-6 py-1.5 backdrop-blur-sm">
              <span className="text-stone-300 text-[10px] sm:text-xs tracking-[0.3em] sm:tracking-[0.4em] uppercase">Bazaar Doha</span>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
              {cta.title}
            </h2>
            <div className="flex justify-center">
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-stone-400 to-transparent" />
            </div>
          </div>

          <p className="text-stone-300 text-xs sm:text-sm tracking-widest leading-relaxed max-w-xs sm:max-w-md mx-auto">
            {cta.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
            <a
              href="/all"
              className="group inline-flex items-center gap-3 bg-white text-black px-8 sm:px-10 py-3 sm:py-4 text-xs sm:text-sm font-bold tracking-widest hover:bg-stone-200 transition-colors duration-300 w-full sm:w-auto justify-center"
            >
              {cta.buttonLabel}
              <svg
                className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a
              href="/about"
              className="text-stone-400 hover:text-white text-xs sm:text-sm tracking-widest border-b border-transparent hover:border-white transition-all duration-300 pb-px"
            >
              تعرف علينا أكثر
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}