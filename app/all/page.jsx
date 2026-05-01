"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useCart } from "../components/cart";

const FALLBACK_IMG_W = "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80";
const FALLBACK_IMG_M = "https://images.unsplash.com/photo-1556228841-a3c527ebefe5?w=400&q=80";
const STAR_PATH = "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z";

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const fallback = product.gender === "womens" ? FALLBACK_IMG_W : FALLBACK_IMG_M;
  const href = product.gender === "womens" ? `/Womens/${product.id}` : `/Mens/${product.id}`;
  const handleAddToCart = (e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); };


  
  return (
    <Link href={href} className="block">
      <div className="bg-[#f0efeb] relative group overflow-hidden cursor-pointer">
        {product.discount?.active && <span className="absolute top-3 right-3 z-10 bg-white text-stone-700 text-xs font-semibold px-2.5 py-1 tracking-wide">وفّر {product.discount.percentage}%</span>}
        <div className="aspect-[3.5/4] overflow-hidden">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" onError={(e) => { e.target.src = fallback; }} />
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
              {product.discount?.active && product.discount?.originalPrice && <span className="text-stone-400 text-xs sm:text-sm line-through">{product.discount.originalPrice} {product.currency}</span>}
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
const discountOpts = [
  { value: "all", label: "الكل" },
  { value: "discount", label: "عروض فقط" },
  { value: "instock", label: "متوفر فقط" },
];

const sortOpts = [
  { value: "default", label: "المميز" },
  { value: "price-asc", label: "السعر: الأقل أولاً" },
  { value: "price-desc", label: "السعر: الأعلى أولاً" },
  { value: "rating", label: "الأعلى تقييماً" },
  { value: "discount", label: "الأعلى خصماً" },
];
function FilterDropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);
  const isFiltered = value !== "all" && value !== "default";
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className={`flex items-center gap-4 sm:gap-8 border px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm transition-colors min-w-[120px] sm:min-w-[160px] justify-between ${isFiltered ? "border-stone-800 text-stone-800 bg-stone-50" : "border-stone-300 text-stone-600 bg-white hover:border-stone-400"}`}>
        <span className="truncate">{isFiltered ? selected?.label : label}</span>
        <svg className={`w-3 h-3 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
      {open && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-stone-200 shadow-lg z-50 min-w-[180px] sm:min-w-[200px]">
          <button onClick={() => { onChange("all"); setOpen(false); }} className={`w-full text-right px-4 py-2.5 text-sm hover:bg-stone-50 transition-colors ${value === "all" ? "text-stone-800 font-medium" : "text-stone-500"}`}>الكل</button>
          {options.map(opt => <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }} className={`w-full text-right px-4 py-2.5 text-sm hover:bg-stone-50 transition-colors border-t border-stone-100 ${value === opt.value ? "text-stone-800 font-medium bg-stone-50" : "text-stone-600"}`}>{opt.label}</button>)}
        </div>
      )}
    </div>
  );
}

function CollectionsDropdown({ womensCollections, mensCollections, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [expandedGender, setExpandedGender] = useState(null);
  const [wExpandedParents, setWExpandedParents] = useState({});
  const [mExpandedParents, setMExpandedParents] = useState({});
  const isFiltered = value.gender !== "all" || value.collection !== "all";
  const getLabel = () => {
    if (!isFiltered) return "الأقسام";
    const gLabel = value.gender === "womens" ? "حريمي" : value.gender === "mens" ? "رجالي" : "";
    if (value.collection === "all") return gLabel;
    const opts = value.gender === "womens" ? womensCollections : mensCollections;
    const col = opts.find(o => o.value === value.collection);
    return col ? `${gLabel} / ${col.label}` : gLabel;
  };
  const handleSelect = (gender, collection) => { onChange({ gender, collection }); setOpen(false); };

  function renderStructured(collections, gender, expandedParents, setExpandedParents) {
    const structured = [];
    for (const opt of collections) {
      if (!opt.isSubCollection) structured.push({ parent: opt, children: [] });
      else structured[structured.length - 1]?.children.push(opt);
    }
    return structured.map(({ parent, children }) => (
      <div key={parent.value} className="border-b border-stone-100 last:border-b-0">
        {children.length > 0 ? (
          <>
            <button onClick={() => setExpandedParents(prev => ({ ...prev, [parent.value]: !prev[parent.value] }))} className={`w-full text-right px-4 py-2.5 text-sm font-semibold flex items-center justify-between transition-colors ${expandedParents[parent.value] ? "bg-stone-50 text-stone-800" : "text-stone-700 hover:bg-stone-50"}`}>
              <span>{parent.label}</span>
              <svg className={`w-3 h-3 transition-transform flex-shrink-0 ${expandedParents[parent.value] ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {expandedParents[parent.value] && (
              <div className="bg-stone-50 border-t border-stone-100">
                {children.map(child => (
                  <button key={child.value} onClick={() => handleSelect(gender, child.value)} className={`w-full text-right px-4 py-2.5 pr-8 text-sm flex items-center gap-2 border-b border-stone-100 last:border-b-0 transition-colors ${value.gender === gender && value.collection === child.value ? "bg-stone-800 text-white" : "text-stone-600 hover:bg-stone-100"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${value.gender === gender && value.collection === child.value ? "bg-white" : "bg-stone-300"}`} />
                    {child.label}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <button onClick={() => handleSelect(gender, parent.value)} className={`w-full text-right px-4 py-2.5 text-sm font-semibold transition-colors ${value.gender === gender && value.collection === parent.value ? "bg-stone-800 text-white" : "text-stone-700 hover:bg-stone-50"}`}>{parent.label}</button>
        )}
      </div>
    ));
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className={`flex items-center gap-4 sm:gap-8 border px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm transition-colors min-w-[120px] sm:min-w-[160px] justify-between ${isFiltered ? "border-stone-800 text-stone-800 bg-stone-50" : "border-stone-300 text-stone-600 bg-white hover:border-stone-400"}`}>
        <span className="truncate max-w-[100px] sm:max-w-[140px]">{getLabel()}</span>
        <svg className={`w-3 h-3 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
      {open && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-stone-200 shadow-lg z-50 min-w-[240px] sm:min-w-[280px] max-h-[480px] overflow-y-auto">
          <button onClick={() => handleSelect("all", "all")} className="w-full text-right px-4 py-2.5 text-sm border-b border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors">الكل</button>
          <div className="border-b border-stone-200">
            <button onClick={() => setExpandedGender(prev => prev === "womens" ? null : "womens")} className={`w-full text-right px-4 py-3 flex items-center justify-between transition-colors ${expandedGender === "womens" ? "bg-stone-50" : "hover:bg-stone-50"}`}>
              <span className="text-base font-bold text-stone-800">حريمي</span>
              <svg className={`w-3 h-3 transition-transform text-stone-500 ${expandedGender === "womens" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {expandedGender === "womens" && (
              <div className="border-t border-stone-100">
                <button onClick={() => handleSelect("womens", "all")} className="w-full text-right px-4 py-2.5 text-sm text-stone-500 hover:bg-stone-50 border-b border-stone-100 transition-colors">كل الحريمي</button>
                {renderStructured(womensCollections, "womens", wExpandedParents, setWExpandedParents)}
              </div>
            )}
          </div>
          <div>
            <button onClick={() => setExpandedGender(prev => prev === "mens" ? null : "mens")} className={`w-full text-right px-4 py-3 flex items-center justify-between transition-colors ${expandedGender === "mens" ? "bg-stone-50" : "hover:bg-stone-50"}`}>
              <span className="text-base font-bold text-stone-800">رجالي</span>
              <svg className={`w-3 h-3 transition-transform text-stone-500 ${expandedGender === "mens" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {expandedGender === "mens" && (
              <div className="border-t border-stone-100">
                <button onClick={() => handleSelect("mens", "all")} className="w-full text-right px-4 py-2.5 text-sm text-stone-500 hover:bg-stone-50 border-b border-stone-100 transition-colors">كل الرجالي</button>
                {renderStructured(mensCollections, "mens", mExpandedParents, setMExpandedParents)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Mobile Filter Sheet ─── */
function MobileFilterSheet({ open, onClose, womensCollections, mensCollections, collectionFilter, setCollectionFilter, activeDiscount, setActiveDiscount, sortBy, setSortBy, filtered, resetAll }) {
  const [expandedParents, setExpandedParents] = useState({});

  const activeCollections = collectionFilter.gender === "womens" ? womensCollections : collectionFilter.gender === "mens" ? mensCollections : [];
  const structured = [];
  for (const opt of activeCollections) {
    if (!opt.isSubCollection) structured.push({ parent: opt, children: [] });
    else structured[structured.length - 1]?.children.push(opt);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl p-5 pb-8 space-y-5 animate-slide-up max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-stone-800">تصفية وترتيب</span>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 text-2xl leading-none">×</button>
        </div>

        {/* Gender */}
        <div>
          <p className="text-xs text-stone-400 font-medium mb-2 tracking-widest">الفئة</p>
          <div className="flex gap-2 flex-wrap">
            {[{ value: "all", label: "الكل" }, { value: "womens", label: "حريمي" }, { value: "mens", label: "رجالي" }].map(opt => (
              <button key={opt.value} onClick={() => setCollectionFilter({ gender: opt.value, collection: "all" })} className={`px-4 py-2 rounded-full text-sm border transition-all ${collectionFilter.gender === opt.value ? "bg-stone-800 text-white border-stone-800" : "border-stone-300 text-stone-600"}`}>{opt.label}</button>
            ))}
          </div>
        </div>

        {/* Collections — nested, shown only when a gender is selected */}
        {collectionFilter.gender !== "all" && structured.length > 0 && (
          <div>
            <p className="text-xs text-stone-400 font-medium mb-3 tracking-widest">الأقسام</p>
            <div className="space-y-1">
              <button onClick={() => setCollectionFilter(f => ({ ...f, collection: "all" }))} className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${collectionFilter.collection === "all" ? "bg-stone-800 text-white border-stone-800" : "border-stone-200 text-stone-600 bg-stone-50"}`}>الكل</button>
              {structured.map(({ parent, children }) => (
                <div key={parent.value}>
                  {children.length > 0 ? (
                    <>
                      <button onClick={() => setExpandedParents(p => ({ ...p, [parent.value]: !p[parent.value] }))} className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all flex items-center justify-between ${collectionFilter.collection === parent.value ? "bg-stone-800 text-white border-stone-800" : "border-stone-200 text-stone-700 bg-stone-50"}`}>
                        <span>{parent.label}</span>
                        <svg className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${expandedParents[parent.value] ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      {expandedParents[parent.value] && (
                        <div className="mr-4 mt-1 space-y-1">
                          {children.map(child => (
                            <button key={child.value} onClick={() => setCollectionFilter(f => ({ ...f, collection: child.value }))} className={`w-full text-right px-4 py-2 rounded-xl text-sm border transition-all flex items-center gap-2 ${collectionFilter.collection === child.value ? "bg-stone-700 text-white border-stone-700" : "border-stone-200 text-stone-600 bg-white"}`}>
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${collectionFilter.collection === child.value ? "bg-white" : "bg-stone-300"}`} />
                              {child.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <button onClick={() => setCollectionFilter(f => ({ ...f, collection: parent.value }))} className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${collectionFilter.collection === parent.value ? "bg-stone-800 text-white border-stone-800" : "border-stone-200 text-stone-700 bg-stone-50"}`}>{parent.label}</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discount */}
        <div>
          <p className="text-xs text-stone-400 font-medium mb-2 tracking-widest">العروض</p>
          <div className="flex gap-2 flex-wrap">
            {discountOpts.map(opt => (
              <button key={opt.value} onClick={() => setActiveDiscount(opt.value)} className={`px-4 py-2 rounded-full text-sm border transition-all ${activeDiscount === opt.value ? "bg-stone-800 text-white border-stone-800" : "border-stone-300 text-stone-600"}`}>{opt.label}</button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div>
          <p className="text-xs text-stone-400 font-medium mb-2 tracking-widest">الترتيب</p>
          <div className="flex gap-2 flex-wrap">
            {sortOpts.map(opt => (
              <button key={opt.value} onClick={() => setSortBy(opt.value)} className={`px-4 py-2 rounded-full text-sm border transition-all ${sortBy === opt.value ? "bg-stone-800 text-white border-stone-800" : "border-stone-300 text-stone-600"}`}>{opt.label}</button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={() => { resetAll(); onClose(); }} className="flex-1 border border-stone-300 text-stone-600 py-3 rounded-full text-sm font-medium">مسح الكل</button>
          <button onClick={onClose} className="flex-1 bg-stone-800 text-white py-3 rounded-full text-sm font-semibold">عرض {filtered.length} منتج</button>
        </div>
      </div>
    </div>
  );
}

function flattenProducts(data, gender) {
  if (!data?.collections) return [];
  const result = [];
  for (const col of data.collections) {
    if (col.subCollections) {
      for (const sub of col.subCollections) {
        for (const p of sub.products ?? []) result.push({ ...p, gender, collectionKey: col.collection, subCollectionKey: sub.subCollection });
      }
    } else {
      for (const p of col.products ?? []) result.push({ ...p, gender, collectionKey: col.collection, subCollectionKey: null });
    }
  }
  return result;
}

function buildCollectionOptions(data) {
  if (!data?.collections) return [];
  const options = [];
  for (const col of data.collections) {
    options.push({ value: col.collection, label: col.title, isSubCollection: false });
    if (col.subCollections) {
      for (const sub of col.subCollections) options.push({ value: `${col.collection}__${sub.subCollection}`, label: sub.title, isSubCollection: true });
    }
  }
  return options;
}

function applyFilters(list, { gender, collection, discount, sort, search }) {
  let r = [...list];
  if (gender !== "all") r = r.filter(p => p.gender === gender);
  if (collection !== "all") {
    if (collection.includes("__")) { const [col, sub] = collection.split("__"); r = r.filter(p => p.collectionKey === col && p.subCollectionKey === sub); }
    else r = r.filter(p => p.collectionKey === collection);
  }
  if (discount === "discount") r = r.filter(p => p.discount?.active);
  if (discount === "instock") r = r.filter(p => p.inStock);
  if (search.trim()) r = r.filter(p => p.name.toLowerCase().includes(search.trim().toLowerCase()));
  if (sort === "price-asc") r.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") r.sort((a, b) => b.price - a.price);
  else if (sort === "rating") r.sort((a, b) => b.rating - a.rating);
  else if (sort === "discount") r.sort((a, b) => (b.discount?.percentage ?? 0) - (a.discount?.percentage ?? 0));
  return r;
}

export default function AllProductsPage() {
  const [womensData, setWomensData] = useState(null);
  const [mensData, setMensData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collectionFilter, setCollectionFilter] = useState({ gender: "all", collection: "all" });
  const [activeDiscount, setActiveDiscount] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [search, setSearch] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { getTotalItems, setIsCartOpen } = useCart();

  useEffect(() => {
    async function load() {
      try {
        const [wRes, mRes] = await Promise.all([fetch("/api/data?collection=Womens"), fetch("/api/data?collection=Mens")]);
        if (!wRes.ok || !mRes.ok) throw new Error("فشل تحميل البيانات");
        const [wArr, mArr] = await Promise.all([wRes.json(), mRes.json()]);
        setWomensData(wArr[0]); setMensData(mArr[0]);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const allProducts = useMemo(() => [...flattenProducts(womensData, "womens"), ...flattenProducts(mensData, "mens")], [womensData, mensData]);
  const womensCollections = useMemo(() => buildCollectionOptions(womensData), [womensData]);
  const mensCollections = useMemo(() => buildCollectionOptions(mensData), [mensData]);
  const filtered = useMemo(() => applyFilters(allProducts, { gender: collectionFilter.gender, collection: collectionFilter.collection, discount: activeDiscount, sort: sortBy, search }), [allProducts, collectionFilter, activeDiscount, sortBy, search]);

  const resetAll = () => { setCollectionFilter({ gender: "all", collection: "all" }); setActiveDiscount("all"); setSortBy("default"); setSearch(""); };
  const hasActiveFilters = collectionFilter.gender !== "all" || collectionFilter.collection !== "all" || activeDiscount !== "all" || sortBy !== "default" || search.trim() !== "";

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="w-10 h-10 border border-stone-300 border-t-stone-700 rounded-full animate-spin" /></div>;
  if (error) return <div className="min-h-screen bg-white flex items-center justify-center"><p className="text-stone-600 text-sm">{error}</p></div>;

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
        <h1 className="text-2xl sm:text-4xl font-bold text-stone-800 mb-1 sm:mb-2">جميع المنتجات</h1>
        <p className="text-stone-500 text-sm sm:text-base">اكتشف أفضل منتجات العناية للرجال والحريم</p>
      </div>

      {/* Sticky Toolbar */}
      <div className="border-t border-b border-stone-200 bg-white sticky top-0 z-30">
        {/* Search */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-2.5 sm:py-3 border-b border-stone-100">
          <div className="relative w-full">
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث باسم المنتج..." className="w-full border border-stone-200 py-2 sm:py-2.5 pr-9 pl-4 text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-stone-500 transition-colors" />
            {search && <button onClick={() => setSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-lg leading-none">×</button>}
          </div>
        </div>

        {/* Desktop Filters */}
        <div className="hidden sm:flex max-w-7xl mx-auto px-6 lg:px-10 py-3 items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-stone-400 tracking-widest uppercase font-medium">تصفية حسب:</span>
            <CollectionsDropdown womensCollections={womensCollections} mensCollections={mensCollections} value={collectionFilter} onChange={setCollectionFilter} />
            <FilterDropdown label="العروض" value={activeDiscount} onChange={setActiveDiscount} options={[{ value: "discount", label: "عروض فقط" }, { value: "instock", label: "متوفر فقط" }]} />
            {hasActiveFilters && <button onClick={resetAll} className="text-xs text-stone-400 hover:text-stone-600 underline underline-offset-2 transition-colors">مسح الكل</button>}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-stone-400 tracking-widest">{filtered.length} منتج</span>
            <button onClick={() => setIsCartOpen(true)} className="relative p-1.5 rounded-full text-stone-600 hover:bg-stone-100 transition-all duration-200" title="السلة">
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>
              {getTotalItems() > 0 && <span className="absolute -top-0.5 -left-0.5 min-w-[16px] h-[16px] rounded-full bg-stone-800 text-white flex items-center justify-center text-[9px] font-bold px-1" style={{ animation: "cart-badge 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}>{getTotalItems() > 99 ? "99+" : getTotalItems()}</span>}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400 tracking-widest uppercase">ترتيب حسب:</span>
              <FilterDropdown label="المميز" value={sortBy} onChange={setSortBy} options={[{ value: "default", label: "المميز" }, { value: "price-asc", label: "السعر: الأقل أولاً" }, { value: "price-desc", label: "السعر: الأعلى أولاً" }, { value: "rating", label: "الأعلى تقييماً" }, { value: "discount", label: "الأعلى خصماً" }]} />
            </div>
          </div>
        </div>

        {/* Mobile Filter Bar */}
        <div className="flex sm:hidden max-w-7xl mx-auto px-4 py-2.5 items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400">{filtered.length} منتج</span>
            {hasActiveFilters && <button onClick={resetAll} className="text-xs text-red-400 hover:text-red-600 underline underline-offset-2">مسح</button>}
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
      <MobileFilterSheet
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        womensCollections={womensCollections}
        mensCollections={mensCollections}
        collectionFilter={collectionFilter}
        setCollectionFilter={setCollectionFilter}
        activeDiscount={activeDiscount}
        setActiveDiscount={setActiveDiscount}
        sortBy={sortBy}
        setSortBy={setSortBy}
        filtered={filtered}
        resetAll={resetAll}
      />

      {/* Products */}
      <div className="px-3 sm:px-4 lg:px-[15px] pt-6 sm:pt-10 pb-10">
        {filtered.length === 0 ? (
          <div className="text-center py-24 space-y-3">
            <p className="text-stone-400 text-sm tracking-widest">لا توجد منتجات تطابق البحث</p>
            <button onClick={resetAll} className="text-stone-500 text-xs hover:underline">مسح الفلاتر</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3" style={{ columnGap: 10, rowGap: 10 }}>
            {filtered.map((product, i) => (
              <div key={`${product.gender}-${product.id}`} style={{ animationDelay: `${Math.min(i, 9) * 50}ms` }} className="animate-fade-in">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}