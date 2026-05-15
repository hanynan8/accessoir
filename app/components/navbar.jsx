"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import { ShoppingBag, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useCart } from "./cart";

function EyeIcon({ size = 16, open = true }) {
  return open ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function XIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function ArrowLeft({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function UserDropdown({ user }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const initial = user?.name?.charAt(0)?.toUpperCase() || "م";

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 border border-[#e0d9d0] rounded-lg hover:border-[#c8a97e] transition-all duration-150"
        style={{ fontFamily: "'Tajawal', sans-serif" }}
      >
        <span className="text-[11px] font-bold text-[#2c2c2c] max-w-[60px] sm:max-w-[80px] truncate hidden sm:block">
          {user?.name}
        </span>
        <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#c8a97e] text-white text-xs font-bold flex items-center justify-center">
          {initial}
        </span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] w-48 sm:w-52 bg-white border border-[#e8e2db] rounded-xl shadow-xl overflow-hidden z-50"
          style={{ animation: "dropdown 0.18s ease both", fontFamily: "'Tajawal', sans-serif" }}
          dir="rtl"
        >
          <div className="px-4 py-3 border-b border-[#f0ece6]">
            <p className="text-sm font-bold text-[#1a1a1a] truncate">{user?.name}</p>
            {user?.phone && <p className="text-xs text-[#9a8c82] mt-0.5 truncate">{user.phone}</p>}
            {user?.address && <p className="text-xs text-[#9a8c82] mt-0.5 truncate">{user.address}</p>}
          </div>
          <button
            onClick={() => { signOut({ callbackUrl: "/" }); setOpen(false); }}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#c8a97e] hover:bg-[#faf7f3] transition-colors font-medium"
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            تسجيل الخروج
          </button>
        </div>
      )}
    </div>
  );
}

function AuthModal({ mode, onClose, onSwitch }) {
const [form, setForm] = useState({ nameOrEmail: "", name: "", phone: "", address: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const overlayRef = useRef(null);
  const isLogin = mode === "login";

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [onClose]);

  const handleOverlayClick = (e) => { if (e.target === overlayRef.current) onClose(); };
  const handleChange = (field) => (e) => { setForm((f) => ({ ...f, [field]: e.target.value })); setError(""); };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.nameOrEmail || !form.password) { setError("من فضلك ادخل جميع البيانات"); return; }
    setLoading(true);
    const res = await signIn("credentials", { redirect: false, nameOrEmail: form.nameOrEmail, password: form.password });
    setLoading(false);
    if (res?.error) setError("الاسم أو كلمة المرور غلط");
    else onClose();
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.password) {
      setError("من فضلك ادخل جميع البيانات"); return;
    }
    setLoading(true);
    try {
      const checkRes = await fetch("/api/data?collection=auth", { cache: "no-store" });
      if (checkRes.ok) {
        const authData = await checkRes.json();
        const users = Array.isArray(authData) ? authData : Array.isArray(authData.auth) ? authData.auth : Array.isArray(authData.data) ? authData.data : [];
        if (users.some(u => u.name?.toLowerCase().trim() === form.name.toLowerCase().trim())) {
          setError("الاسم ده موجود بالفعل، جرب اسم تاني"); setLoading(false); return;
        }
      }
      const res = await fetch("/api/data?collection=auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, phone: form.phone, address: form.address, password: form.password }),

      });
      if (!res.ok) throw new Error();
      const signInRes = await signIn("credentials", { redirect: false, nameOrEmail: form.email, password: form.password });
      setLoading(false);
      if (signInRes?.error) { setError("تم التسجيل، حاول تسجيل الدخول"); onSwitch("login"); }
      else onClose();
    } catch {
      setLoading(false);
      setError("حصل خطأ، حاول تاني");
    }
  };

  const inputClass = "w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-[#e8e2db] text-sm font-medium text-[#1a1a1a] placeholder-[#c4bab2] outline-none focus:border-[#c8a97e] focus:ring-2 focus:ring-[#c8a97e]/10 transition-all bg-[#fdfbf8]";

  return (
    <>
      <style>{`
        @keyframes modal-in { from{opacity:0;transform:scale(0.96) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .auth-modal-card { animation: modal-in 0.22s cubic-bezier(0.34,1.4,0.64,1) both; }
        @keyframes dropdown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .auth-spin { animation: spin 0.7s linear infinite; }
      `}</style>
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
        style={{ background: "rgba(10,10,10,0.50)", backdropFilter: "blur(6px)" }}
      >
        <div className="auth-modal-card relative w-full sm:max-w-md bg-white sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }}>
          <div className="h-1 w-full bg-[#c8a97e]" />
          <button onClick={onClose} className="absolute top-3 left-3 sm:top-4 sm:left-4 p-1.5 rounded-lg text-[#9a8c82] hover:text-[#1a1a1a] hover:bg-[#f5f0eb] transition-colors z-10">
            <XIcon size={16} />
          </button>
          <div className="px-5 sm:px-8 pt-6 sm:pt-7 pb-6 sm:pb-8">
            <div className="mb-5 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-[#1a1a1a] tracking-tight">
                {isLogin ? "أهلاً بعودتك" : "إنشاء حساب"}<span className="text-[#c8a97e]">.</span>
              </h2>
              <p className="text-sm text-[#9a8c82] mt-1 font-medium">
                {isLogin ? "سجّل دخولك للمتابعة" : "ادخل بياناتك لإنشاء حساب جديد"}
              </p>
            </div>
            <form onSubmit={isLogin ? handleLogin : handleRegister} className="flex flex-col gap-3 sm:gap-4">
              {!isLogin && (
                <>
                  <div><label className="block text-xs font-bold text-[#9a8c82] uppercase tracking-wider mb-1.5">الاسم الكامل</label><input type="text" value={form.name} onChange={handleChange("name")} placeholder="الاسم الكامل" className={inputClass} /></div>
                  <div><label className="block text-xs font-bold text-[#9a8c82] uppercase tracking-wider mb-1.5">رقم الهاتف</label><input type="tel" value={form.phone} onChange={handleChange("phone")} placeholder="01XXXXXXXXX" className={inputClass} dir="ltr" /></div>
                  <div><label className="block text-xs font-bold text-[#9a8c82] uppercase tracking-wider mb-1.5">العنوان</label><input type="text" value={form.address} onChange={handleChange("address")} placeholder="المدينة، الحي، الشارع" className={inputClass} /></div>
                </>
              )}
              {isLogin && (
                <div><label className="block text-xs font-bold text-[#9a8c82] uppercase tracking-wider mb-1.5">الاسم</label><input type="text" value={form.nameOrEmail} onChange={handleChange("nameOrEmail")} placeholder="ادخل اسمك" className={inputClass} /></div>
              )}
              <div>
                <label className="block text-xs font-bold text-[#9a8c82] uppercase tracking-wider mb-1.5">كلمة المرور</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} value={form.password} onChange={handleChange("password")} placeholder="••••••••" className={`${inputClass} pl-11`} dir="ltr" />
                  <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b0a59b] hover:text-[#5a5050] transition-colors">
                    <EyeIcon size={16} open={showPass} />
                  </button>
                </div>
              </div>
              {error && (
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-red-50 border border-red-100">
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#c8a97e" strokeWidth={2.5} strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  <span className="text-xs font-semibold text-[#c8a97e]">{error}</span>
                </div>
              )}
              <button type="submit" disabled={loading} className="w-full mt-1 py-3 sm:py-3.5 bg-[#1a1a1a] text-white text-sm font-bold rounded-xl hover:bg-[#333] active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? (
                  <svg className="auth-spin" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity={0.25} /><path d="M21 12a9 9 0 00-9-9" /></svg>
                ) : (
                  <>{isLogin ? "تسجيل الدخول" : "إنشاء الحساب"}<ArrowLeft size={14} /></>
                )}
              </button>
            </form>
            <p className="text-center text-sm text-[#9a8c82] mt-4 sm:mt-5 font-medium">
              {isLogin ? "مش عندك حساب؟" : "عندك حساب بالفعل؟"}{" "}
              <button onClick={() => onSwitch(isLogin ? "register" : "login")} className="text-[#c8a97e] font-bold hover:underline transition-all">
                {isLogin ? "سجّل دلوقتي" : "سجّل دخولك"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Navbar() {
  const [data, setData] = useState(null);
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [authModal, setAuthModal] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const { getTotalItems, setIsCartOpen } = useCart();

  const isLoading = status === "loading";
  const isLoggedIn = status === "authenticated";
  const totalItems = getTotalItems();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch("/api/data?collection=navbar")
      .then((res) => res.json())
      .then((json) => setData(Array.isArray(json) ? json[0] : json))
      .catch((err) => console.error("Failed to load navbar data:", err));
  }, []);

  const announcements = data?.announcements ?? [];

  const goTo = useCallback((index) => {
    setAnimating(true);
    setTimeout(() => { setAnnouncementIndex(index); setAnimating(false); }, 300);
  }, []);

  const goNext = useCallback(() => {
    if (!announcements.length) return;
    goTo((announcementIndex + 1) % announcements.length);
  }, [announcementIndex, announcements.length, goTo]);

  const goPrev = useCallback(() => {
    if (!announcements.length) return;
    goTo((announcementIndex - 1 + announcements.length) % announcements.length);
  }, [announcementIndex, announcements.length, goTo]);

  useEffect(() => {
    if (!announcements.length) return;
    const interval = setInterval(goNext, 4000);
    return () => clearInterval(interval);
  }, [goNext, announcements.length]);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handler = (e) => {
      if (!e.target.closest('[data-mobile-menu]') && !e.target.closest('[data-menu-btn]')) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileMenuOpen]);

  if (!data) return null;

  const { store, navLinks } = data;
  const currentAnnouncement = announcements[announcementIndex]?.text ?? "";

  return (
    <>
      <style>{`
        @keyframes dropdown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes cart-badge { from{transform:scale(0)} to{transform:scale(1)} }
        @keyframes mobile-menu-in { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .navbar-nav { transition: height 0.3s ease, box-shadow 0.3s ease; }
        .mobile-menu { animation: mobile-menu-in 0.2s ease both; }
      `}</style>

      {authModal && (
        <AuthModal mode={authModal} onClose={() => setAuthModal(null)} onSwitch={(m) => setAuthModal(m)} />
      )}

<header dir="rtl" className="font-[Tajawal,sans-serif] sticky top-0 left-0 right-0 z-50">
        {/* Announcement Bar */}
        {announcements.length > 0 && (
          <div className="bg-[#1a1a1a] text-white h-9 sm:h-10 flex items-center justify-between px-3 sm:px-4 select-none border-b border-white">
            <button onClick={goPrev} aria-label="العرض السابق" className="p-1 rounded flex-shrink-0 hover:bg-white/10 transition-colors duration-150 flex items-center">
              <ChevronRight size={14} strokeWidth={2} />
            </button>
            <div className="flex-1 overflow-hidden text-center">
              <span
                key={announcementIndex}
                className={`block text-[11px] sm:text-[13px] tracking-wide font-medium transition-all duration-300 ${animating ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"}`}
              >
                <span className="underline underline-offset-2 decoration-white decoration-1">{currentAnnouncement}</span>
              </span>
            </div>
            <button onClick={goNext} aria-label="العرض التالي" className="p-1 rounded hover:bg-white/10 transition-colors duration-150 flex items-center flex-shrink-0">
              <ChevronLeft size={14} strokeWidth={2} />
            </button>
          </div>
        )}

        {/* Navbar */}
        <nav
          className="navbar-nav bg-white border-b border-stone-100 px-4 sm:px-6 md:px-12 transition-all duration-300"
 style={{
  boxShadow: "none",
  height: "100px",  // كان 56px و 72px
}}
        >
          <div className="relative flex items-center justify-between max-w-[1400px] mx-auto h-full">

            {/* Mobile: hamburger */}
            <button
              data-menu-btn
              onClick={() => setMobileMenuOpen(v => !v)}
              className="md:hidden p-1.5 text-stone-700 hover:text-stone-900 transition-colors"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Desktop Nav Links */}
            <ul className="hidden md:flex items-center gap-4 md:gap-7 list-none">
              {navLinks.map((link) => (
                <li key={link.id}>
<Link href={link.href} className="text-[18px] font-medium tracking-wide text-[#2c2c2c] border-b border-transparent pb-0.5 hover:text-black hover:border-black transition-all duration-200">
  {link.label}
</Link>
                </li>
              ))}
            </ul>

            {/* Logo */}
<Link href="/" className="absolute left-1/2 -translate-x-1/2 text-center cursor-pointer select-none overflow-hidden">
  <img
    src="/dd55.png"
    alt="logo"
    className="transition-all duration-300 object-contain"
style={{
  height: "80px",  // كان 40px و 56px
  filter: "brightness(0)",
}}
  />
</Link>

            {/* Icons + Auth */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {isLoading ? (
                <div className="w-16 sm:w-20 h-7 sm:h-8 rounded-lg bg-gray-100 animate-pulse" />
              ) : isLoggedIn ? (
                <UserDropdown user={session.user} />
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => setAuthModal("login")}
                    className="text-[16px] sm:text-[14px] font-medium text-[#2c2c2c] hover:text-black transition-colors duration-200 border-b border-transparent hover:border-[#2c2c2c] pb-0.5 hidden sm:block"
                    style={{ fontFamily: "'Tajawal', sans-serif" }}
                  >
                    تسجيل الدخول
                  </button>
                  <button
                    onClick={() => setAuthModal("register")}
                    className="text-[11px] sm:text-[13px] font-bold bg-[#1a1a1a] text-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-[#333] transition-colors duration-200"
                    style={{ fontFamily: "'Tajawal', sans-serif" }}
                  >
                    <span className="hidden sm:inline">إنشاء حساب</span>
                    <span className="sm:hidden">دخول</span>
                  </button>
                </div>
              )}

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-1.5 rounded-full text-[#2c2c2c] transition-all duration-200 hover:bg-[#ede8e1] hover:text-black"
              >
                <ShoppingBag size={26} strokeWidth={1.6} />
                {totalItems > 0 && (
                  <span
                    className="absolute -top-0.5 -left-0.5 rounded-full bg-stone-800 text-white flex items-center justify-center text-[9px] font-bold leading-none"
                    style={{ animation: 'cart-badge 0.3s cubic-bezier(0.34,1.56,0.64,1)', minWidth: '16px', height: '16px', padding: '0 3px' }}
                  >
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div
            data-mobile-menu
            className="mobile-menu md:hidden bg-white border-b border-stone-200 shadow-lg"
            dir="rtl"
          >
            <ul className="flex flex-col py-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>
              {navLinks.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-5 py-3 text-sm font-medium text-[#2c2c2c] hover:bg-stone-50 hover:text-black border-b border-stone-100 last:border-0 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {!isLoggedIn && (
                <li>
                  <button
                    onClick={() => { setAuthModal("login"); setMobileMenuOpen(false); }}
                    className="block w-full text-right px-5 py-3 text-sm font-medium text-[#2c2c2c] hover:bg-stone-50 transition-colors"
                  >
                    تسجيل الدخول
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}
      </header>
    </>
  );
}