"use client";

import { useState, useEffect } from "react";
import { FaInstagram, FaSnapchat, FaTiktok, FaWhatsapp, FaPhone, FaEnvelope } from "react-icons/fa";

const socialIconsMap = {
  instagram: { Icon: FaInstagram, label: "Instagram" },
  snapchat:  { Icon: FaSnapchat,  label: "Snapchat"  },
  tiktok:    { Icon: FaTiktok,    label: "TikTok"    },
  whatsapp:  { Icon: FaWhatsapp,  label: "WhatsApp"  },
};

export default function Footer() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/data?collection=footer");
        if (!res.ok) throw new Error("فشل تحميل بيانات الفوتر");
        const arr = await res.json();
        setData(arr[0].footer);
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
      <footer className="bg-black pt-12 sm:pt-16 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 pb-10 border-b border-white/10">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
                <div className="h-3 w-3/4 bg-white/5 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </footer>
    );
  }

  if (error || !data) {
    return (
      <footer className="bg-black py-6 text-center px-4">
        <p className="text-white/30 text-xs tracking-widest">
          {error ?? "تعذّر تحميل الفوتر"}
        </p>
      </footer>
    );
  }

  const { brand, links, contact, social, trust, copyright } = data;

  return (
    <footer
      dir="rtl"
      className="bg-black text-white pt-12 sm:pt-16 pb-6 relative overflow-hidden"
      style={{ fontFamily: "'Cairo', sans-serif" }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.5) 40px, rgba(255,255,255,0.5) 41px)`,
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative">

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 pb-10 sm:pb-12 border-b border-white/10">

          {/* Brand + Social */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1 space-y-4 sm:space-y-5">
            <span className="text-white font-bold text-lg sm:text-xl tracking-[0.25em] uppercase">
              {brand.name}
            </span>
            <p className="text-white/50 text-xs sm:text-sm leading-loose border-r-2 border-white/20 pr-3">
              {brand.tagline}
            </p>
            <div className="flex items-center gap-2 pt-1">
              {social.map(({ platform, href }) => {
                const entry = socialIconsMap[platform];
                if (!entry) return null;
                const { Icon, label } = entry;
                return (
                  <a
                    key={platform}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-8 h-8 sm:w-9 sm:h-9 border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white hover:bg-white/10 transition-all duration-300"
                    style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}
                  >
                    <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4 sm:space-y-5">
            <h3 className="text-white text-[10px] sm:text-xs font-bold tracking-[0.35em] uppercase flex items-center gap-2 sm:gap-3">
              <span className="h-px w-4 sm:w-5 bg-white/40" />
              الصفحات
            </h3>
            <ul className="space-y-2 sm:space-y-2.5">
              {links.map(({ label, href }) => (
                <li key={href}>
                  <a href={href} className="text-white/50 text-xs sm:text-sm hover:text-white transition-all duration-200 flex items-center gap-2 sm:gap-3 group">
                    <span className="h-px w-0 bg-white group-hover:w-3 sm:group-hover:w-4 transition-all duration-300" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4 sm:space-y-5">
            <h3 className="text-white text-[10px] sm:text-xs font-bold tracking-[0.35em] uppercase flex items-center gap-2 sm:gap-3">
              <span className="h-px w-4 sm:w-5 bg-white/40" />
              تواصل معنا
            </h3>
            <ul className="space-y-3 sm:space-y-4">
              <li>
                <a href={`mailto:${contact.email}`} className="flex items-center gap-2 sm:gap-3 text-white/50 text-xs sm:text-sm hover:text-white transition-colors duration-200 group">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 border border-white/15 flex items-center justify-center shrink-0 group-hover:border-white/50 group-hover:bg-white/5 transition-all duration-200">
                    <FaEnvelope className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </span>
                  <span className="break-all text-[11px] sm:text-sm">{contact.email}</span>
                </a>
              </li>
              <li>
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 sm:gap-3 text-white/50 text-xs sm:text-sm hover:text-white transition-colors duration-200 group">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 border border-white/15 flex items-center justify-center shrink-0 group-hover:border-white/50 group-hover:bg-white/5 transition-all duration-200">
                    <FaPhone className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </span>
                  <span dir="ltr" className="text-[11px] sm:text-sm">{contact.phone}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Trust */}
          <div className="space-y-4 sm:space-y-5">
            <h3 className="text-white text-[10px] sm:text-xs font-bold tracking-[0.35em] uppercase flex items-center gap-2 sm:gap-3">
              <span className="h-px w-4 sm:w-5 bg-white/40" />
              تسوق بثقة
            </h3>
            <ul className="space-y-2 sm:space-y-2.5 text-white/50 text-xs sm:text-sm">
              {trust.map((item) => (
                <li key={item} className="flex items-center gap-2 sm:gap-3 group hover:text-white transition-colors duration-200">
                  <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 border border-white/20 flex items-center justify-center shrink-0 group-hover:border-white/60 transition-colors duration-200">
                    <span className="w-1 h-1 bg-white/60 group-hover:bg-white transition-colors duration-200" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-5 sm:pt-7 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/30 text-[10px] sm:text-xs tracking-[0.2em] text-center sm:text-right">{copyright}</p>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="h-px w-6 sm:w-8 bg-white/20" />
            <span className="text-white font-black tracking-[0.4em] text-[10px] sm:text-xs uppercase">Bazaar Doha</span>
            <span className="h-px w-6 sm:w-8 bg-white/20" />
          </div>
        </div>

      </div>
    </footer>
  );
}