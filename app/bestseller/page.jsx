"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useCart } from "../components/cart";

const STAR_PATH = "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z";

function ProductCard({ product, rank }) {
  const { addToCart, setIsCartOpen } = useCart();
  const fallback = product.gender === "womens"
    ? "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80"
    : "https://images.unsplash.com/photo-1556228841-a3c527ebefe5?w=400&q=80";

  const handleAddToCart = (e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); };

  return (
    <Link href={`/bestseller/${product.id}`} className="block">
      <div className="bg-[#f0efeb] relative group overflow-hidden cursor-pointer">
        <div className={`absolute top-3 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow ${rank === 1 ? "bg-amber-400" : rank === 2 ? "bg-stone-400" : rank === 3 ? "bg-amber-700" : "bg-stone-300"}`}>{rank}</div>
        {product.discount?.active && (
          <span className="absolute top-3 left-3 z-10 bg-white text-stone-700 text-xs font-semibold px-2.5 py-1 tracking-wide">وفّر {product.discount.percentage}%</span>
        )}
        <div className="aspect-[3.5/4] overflow-hidden">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" onError={(e) => { e.target.src = fallback; }} />
          {product.soldCount && (
            <div className="absolute bottom-3 left-3">
              <span className="bg-black/60 text-white text-[10px] px-2 py-1 tracking-wide backdrop-blur-sm">{product.soldCount.toLocaleString("ar")} مبيع</span>
            </div>
          )}
        </div>
        <div className="bg-white px-3 sm:px-4 py-4 sm:py-5 flex items-start justify-between gap-2 sm:gap-3" style={{ borderBottom: "1px solid #c4c4c4" }}>
          <div className="min-w-0">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <svg key={s} fill={s <= Math.round(product.rating) ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${s <= Math.round(product.rating) ? "text-stone-800" : "text-stone-300"}`} viewBox="0 0 24 24"><path d={STAR_PATH} /></svg>
              ))}
            </div>
            <p className="text-stone-800 text-base sm:text-lg font-medium leading-snug line-clamp-2 mt-1">{product.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-stone-800 text-sm sm:text-base font-semibold">{product.price} {product.currency}</span>
              {product.discount?.active && product.discount?.originalPrice && (
                <span className="text-stone-400 text-xs sm:text-sm line-through">{product.discount.originalPrice} {product.currency}</span>
              )}
            </div>
          </div>
          <button
            disabled={!product.inStock}
            onClick={handleAddToCart}
            className={`shrink-0 text-xs sm:text-sm tracking-wide font-semibold px-3 sm:px-5 py-2.5 sm:py-3 rounded-full whitespace-nowrap transition-all duration-200 mt-1 border ${
              product.inStock ? "bg-black text-white border-black hover:bg-white hover:text-black" : "bg-stone-200 text-stone-400 border-transparent cursor-not-allowed"
            }`}
          >
            {product.inStock ? "أضف للسلة" : "نفذ"}
          </button>
        </div>
      </div>
    </Link>
  );
}

function FilterDropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-4 sm:gap-8 border px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm transition-colors min-w-[120px] sm:min-w-[160px] justify-between ${value !== "all" && value !== "default" ? "border-stone-800 text-stone-800 bg-stone-50" : "border-stone-300 text-stone-600 bg-white hover:border-stone-400"}`}
      >
        <span className="truncate">{value !== "all" && value !== "default" ? selected?.label : label}</span>
        <svg className={`w-3 h-3 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
      {open && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-stone-200 shadow-lg z-50 min-w-[180px] sm:min-w-[200px]">
          <button onClick={() => { onChange("all"); setOpen(false); }} className={`w-full text-right px-4 py-2.5 text-sm hover:bg-stone-50 transition-colors ${value === "all" ? "text-stone-800 font-medium" : "text-stone-500"}`}>الكل</button>
          {options.map(opt => (
            <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }} className={`w-full text-right px-4 py-2.5 text-sm hover:bg-stone-50 transition-colors border-t border-stone-100 ${value === opt.value ? "text-stone-800 font-medium bg-stone-50" : "text-stone-600"}`}>{opt.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Mobile Filter Sheet ─── */
function MobileFilterSheet({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl p-5 pb-8 space-y-4 animate-slide-up">
        <div className="flex items-center justify-between mb-2">
          <span className="text-base font-bold text-stone-800">تصفية وترتيب</span>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 text-2xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function BestSellersPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeGender, setActiveGender] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [search, setSearch] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { getTotalItems, setIsCartOpen } = useCart();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/data?collection=BestSellers");
        if (!res.ok) throw new Error("فشل تحميل بيانات الأكثر مبيعاً");
        const arr = await res.json();
        setData(arr[0]);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const allProducts = useMemo(() => {
    if (!data?.collections) return [];
    return data.collections.flatMap((c) => c.products.map((p) => ({ ...p, gender: c.collection.includes("womens") ? "womens" : "mens", collectionLabel: c.title })));
  }, [data]);

  const filtered = useMemo(() => {
    let list = [...allProducts];
    if (activeGender !== "all") list = list.filter((p) => p.gender === activeGender);
    if (search.trim()) list = list.filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase()) || p.brand?.toLowerCase().includes(search.trim().toLowerCase()));
    if (sortBy === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") list.sort((a, b) => b.rating - a.rating);
    else list.sort((a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0));
    return list;
  }, [allProducts, activeGender, search, sortBy]);

  const womensList = useMemo(() => allProducts.filter((p) => p.gender === "womens").sort((a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0)), [allProducts]);
  const mensList = useMemo(() => allProducts.filter((p) => p.gender === "mens").sort((a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0)), [allProducts]);

  const resetFilters = () => { setActiveGender("all"); setSortBy("default"); setSearch(""); };
  const hasActiveFilters = activeGender !== "all" || sortBy !== "default" || search.trim() !== "";

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="w-10 h-10 border border-stone-300 border-t-stone-700 rounded-full animate-spin" /></div>;
  if (error) return <div className="min-h-screen bg-white flex items-center justify-center"><p className="text-stone-600 text-sm">{error}</p></div>;

  const ProductGrid = ({ list, rankOffset = 0 }) => (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3" style={{ columnGap: 10, rowGap: 10 }}>
      {list.map((product, i) => (
        <div key={product.id} style={{ animationDelay: `${Math.min(i, 9) * 50}ms` }} className="animate-fade-in">
          <ProductCard product={product} rank={rankOffset + i + 1} />
        </div>
      ))}
    </div>
  );

  return (
    <div dir="rtl" className="min-h-screen bg-white text-stone-800" style={{ fontFamily: "'Cairo', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap');
        @keyframes fade-in { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .animate-fade-in { animation: fade-in 0.4s ease-out both; }
        @keyframes cart-badge { from{transform:scale(0)} to{transform:scale(1)} }
        @keyframes slide-up { from{transform:translateY(100%)} to{transform:translateY(0)} }
        .animate-slide-up { animation: slide-up 0.28s cubic-bezier(0.32,0.72,0,1) both; }
      `}</style>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-7 sm:pt-10 pb-4 sm:pb-6">
        <h1 className="text-2xl sm:text-4xl font-bold text-stone-800 mb-1 sm:mb-2">الأكثر مبيعاً</h1>
        <p className="text-stone-500 text-sm sm:text-base">أبرز المنتجات الأعلى مبيعاً لدينا</p>
      </div>

      {/* Sticky Toolbar */}
      <div className="border-t border-b border-stone-200 bg-white sticky top-0 z-30">
        {/* Search */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-2.5 sm:py-3 border-b border-stone-100">
          <div className="relative w-full">
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث بالاسم أو الماركة..." className="w-full border border-stone-200 py-2 sm:py-2.5 pr-9 pl-4 text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-stone-500 transition-colors" />
            {search && <button onClick={() => setSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-lg leading-none">×</button>}
          </div>
        </div>

        {/* Desktop Filters */}
        <div className="hidden sm:flex max-w-7xl mx-auto px-6 lg:px-10 py-3 items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-stone-400 tracking-widest uppercase font-medium">تصفية حسب:</span>
            <FilterDropdown label="الفئة" value={activeGender} onChange={setActiveGender} options={[{ value: "womens", label: `حريمي (${womensList.length})` }, { value: "mens", label: `رجالي (${mensList.length})` }]} />
            {hasActiveFilters && <button onClick={resetFilters} className="text-xs text-stone-400 hover:text-stone-600 underline underline-offset-2 transition-colors">مسح الكل</button>}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-stone-400 tracking-widest">{filtered.length} منتج</span>
            <button onClick={() => setIsCartOpen(true)} className="relative p-1.5 rounded-full text-stone-600 hover:bg-stone-100 transition-all duration-200" title="السلة">
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>
              {getTotalItems() > 0 && <span className="absolute -top-0.5 -left-0.5 min-w-[16px] h-[16px] rounded-full bg-stone-800 text-white flex items-center justify-center text-[9px] font-bold px-1" style={{ animation: "cart-badge 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}>{getTotalItems() > 99 ? "99+" : getTotalItems()}</span>}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400 tracking-widest uppercase">ترتيب حسب:</span>
              <FilterDropdown label="الأكثر مبيعاً" value={sortBy} onChange={setSortBy} options={[{ value: "default", label: "الأكثر مبيعاً" }, { value: "price-asc", label: "السعر: الأقل أولاً" }, { value: "price-desc", label: "السعر: الأعلى أولاً" }, { value: "rating", label: "الأعلى تقييماً" }]} />
            </div>
          </div>
        </div>

        {/* Mobile Filter Bar */}
        <div className="flex sm:hidden max-w-7xl mx-auto px-4 py-2.5 items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400">{filtered.length} منتج</span>
            {hasActiveFilters && <button onClick={resetFilters} className="text-xs text-red-400 hover:text-red-600 underline underline-offset-2">مسح</button>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsCartOpen(true)} className="relative p-1.5 rounded-full text-stone-600 hover:bg-stone-100 transition-all duration-200">
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>
              {getTotalItems() > 0 && <span className="absolute -top-0.5 -left-0.5 min-w-[15px] h-[15px] rounded-full bg-stone-800 text-white flex items-center justify-center text-[8px] font-bold px-0.5">{getTotalItems() > 99 ? "99+" : getTotalItems()}</span>}
            </button>
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className={`flex items-center gap-1.5 border px-3 py-1.5 text-xs font-medium transition-colors rounded-full ${hasActiveFilters ? "border-stone-800 text-stone-800 bg-stone-50" : "border-stone-300 text-stone-600"}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M11 12h2" /></svg>
              تصفية
              {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-stone-800 inline-block" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      <MobileFilterSheet open={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)}>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-stone-400 font-medium mb-2 tracking-widest">الفئة</p>
            <div className="flex gap-2 flex-wrap">
              {[{ value: "all", label: "الكل" }, { value: "womens", label: `حريمي (${womensList.length})` }, { value: "mens", label: `رجالي (${mensList.length})` }].map(opt => (
                <button key={opt.value} onClick={() => setActiveGender(opt.value)} className={`px-4 py-2 rounded-full text-sm border transition-all ${activeGender === opt.value ? "bg-stone-800 text-white border-stone-800" : "border-stone-300 text-stone-600"}`}>{opt.label}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-stone-400 font-medium mb-2 tracking-widest">الترتيب</p>
            <div className="flex gap-2 flex-wrap">
              {[{ value: "default", label: "الأكثر مبيعاً" }, { value: "price-asc", label: "الأقل سعراً" }, { value: "price-desc", label: "الأعلى سعراً" }, { value: "rating", label: "الأعلى تقييماً" }].map(opt => (
                <button key={opt.value} onClick={() => setSortBy(opt.value)} className={`px-4 py-2 rounded-full text-sm border transition-all ${sortBy === opt.value ? "bg-stone-800 text-white border-stone-800" : "border-stone-300 text-stone-600"}`}>{opt.label}</button>
              ))}
            </div>
          </div>
          <button onClick={() => { setMobileFiltersOpen(false); }} className="w-full bg-stone-800 text-white py-3 rounded-full text-sm font-semibold mt-2">عرض {filtered.length} منتج</button>
        </div>
      </MobileFilterSheet>

      {/* Products */}
      <div className="px-3 sm:px-4 lg:px-[15px] pt-6 sm:pt-10 pb-10 sm:pb-10">
        {search.trim() ? (
          filtered.length === 0 ? (
            <div className="text-center py-24 space-y-3">
              <p className="text-stone-400 text-sm tracking-widest">لا توجد نتائج للبحث</p>
              <button onClick={() => setSearch("")} className="text-stone-500 text-xs hover:underline">مسح البحث</button>
            </div>
          ) : <ProductGrid list={filtered} />
        ) : (
          <>
            {(activeGender === "all" || activeGender === "womens") && womensList.length > 0 && (
              <section className="mb-10 sm:mb-14">
                <div className="flex items-center gap-3 mb-5 sm:mb-8 px-1">
                  <div className="h-5 w-1 bg-stone-800 rounded-full" />
                  <h2 className="text-base sm:text-lg font-bold text-stone-800">الأكثر مبيعاً — حريمي</h2>
                  <span className="text-xs text-stone-400 tracking-widest">({womensList.length} منتج)</span>
                </div>
                <ProductGrid list={womensList} />
              </section>
            )}
            {(activeGender === "all" || activeGender === "mens") && mensList.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-5 sm:mb-8 px-1">
                  <div className="h-5 w-1 bg-stone-800 rounded-full" />
                  <h2 className="text-base sm:text-lg font-bold text-stone-800">الأكثر مبيعاً — رجالي</h2>
                  <span className="text-xs text-stone-400 tracking-widest">({mensList.length} منتج)</span>
                </div>
                <ProductGrid list={mensList} />
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}