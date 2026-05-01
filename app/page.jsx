"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "./components/cart";

const STAR_PATH = "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z";
const FALLBACK_IMG = "https://images.unsplash.com/photo-1556228841-a3c527ebefe5?w=400&q=80";

const SECTIONS = [
  { id: "mens", headline: "تشكيلة الرجال", subheadline: "أفضل المنتجات الرجالية", apiCollection: "Mens", variant: "nec", detailBase: "/Mens" },
  { id: "womens", headline: "تشكيلة الحريم", subheadline: "أفضل المنتجات النسائية", apiCollection: "Womens", variant: "split", detailBase: "/Womens" },
  { id: "best-sellers", headline: "الأكثر مبيعاً", subheadline: "المنتجات الأكثر مبيعاً", apiCollection: "BestSellers", variant: "split", reversed: true, detailBase: "/bestseller" },
];

function extractAllProducts(json) {
  if (!Array.isArray(json) || json.length === 0) return [];
  const result = [];
  for (const root of json) {
    for (const col of root?.collections ?? []) {
      if (col.subCollections) {
        for (const sub of col.subCollections) {
          for (const p of sub.products ?? []) result.push(p);
        }
      } else {
        for (const p of col.products ?? []) result.push(p);
      }
    }
    for (const p of root?.products ?? []) result.push(p);
  }
  return result;
}
// NecSection - Mobile: 2 products visible, arrows to navigate to 3rd
function NecSection({ section, products }) {
  const { addToCart } = useCart();
  const [activeIndex, setActiveIndex] = useState(0);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const total = products.length;
  // نعكس الإشارة عشان في RTL التحرك لليسار = إظهار المنتج التالي
  const translateX = -(activeIndex * 50);

  const canPrev = activeIndex > 0;
  const canNext = activeIndex < total - 2;

  return (
    <section id={section.id} className="py-8 sm:py-10">
      <div className="flex items-center justify-between px-4 sm:px-8 lg:px-16 mb-4 sm:mb-5">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-stone-800">{section.headline}</h2>
        <Link href={`/${section.apiCollection}`} className="text-[10px] sm:text-[11px] tracking-widest uppercase text-stone-800 underline underline-offset-4 hover:text-stone-500 transition-colors">
          تسوق الآن
        </Link>
      </div>

      {/* ── MOBILE ── */}
      <div className="sm:hidden">
        <div className="overflow-hidden px-3">
          <div
            className="flex"
            style={{
              transform: `translateX(${translateX}%)`,
              transition: "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              direction: "ltr",
            }}
          >
            {(products.length === 0 ? Array(3).fill(null) : products).map((p, i) =>
              !p ? (
                <div
                  key={i}
                  className="bg-stone-100 animate-pulse aspect-[3/4]"
                  style={{ minWidth: "50%", paddingRight: i < 2 ? 6 : 0 }}
                />
              ) : (
                <div
                  key={p.id}
                  style={{ minWidth: "50%", paddingRight: i < products.length - 1 ? 6 : 0 }}
                >
                  <Link href={`${section.detailBase}/${p.id}`} className="block">
                    <div className="bg-[#f0efeb] relative overflow-hidden">
                      {p.discount?.active && (
                        <span className="absolute top-2 right-2 z-10 bg-white text-stone-700 text-[10px] font-semibold px-1.5 py-0.5">
                          وفّر {p.discount.percentage}%
                        </span>
                      )}
                      <div className="aspect-[3/4] overflow-hidden">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = FALLBACK_IMG; }}
                        />
                      </div>
                      <div className="bg-white px-2 py-2" dir="rtl">
                        <div className="flex items-center gap-0.5 mb-0.5">
                          {[1,2,3,4,5].map((s) => (
                            <svg key={s} fill={s <= Math.round(p.rating) ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} className={`w-3 h-3 ${s <= Math.round(p.rating) ? "text-stone-800" : "text-stone-300"}`} viewBox="0 0 24 24">
                              <path d={STAR_PATH} />
                            </svg>
                          ))}
                        </div>
                        <p className="text-stone-800 text-xs font-medium line-clamp-1">{p.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-stone-800 text-xs font-semibold">{p.price} {p.currency}</span>
                          {p.discount?.active && p.discount?.originalPrice && (
                            <span className="text-stone-400 text-[10px] line-through">{p.discount.originalPrice}</span>
                          )}
                        </div>
                        <button
                          disabled={!p.inStock}
                          onClick={(e) => handleAddToCart(e, p)}
                          className={`mt-1.5 w-full text-[10px] tracking-wide font-semibold py-1.5 rounded-full transition-all duration-200 border ${
                            p.inStock
                              ? "bg-black text-white border-black"
                              : "bg-stone-200 text-stone-400 border-transparent cursor-not-allowed"
                          }`}
                        >
                          {p.inStock ? "أضف للسلة" : "نفذ"}
                        </button>
                      </div>
                    </div>
                  </Link>
                </div>
              )
            )}
          </div>
        </div>

        {total > 2 && (
          <div className="flex items-center justify-center gap-3 mt-4" dir="rtl">
            {/* زر يمين = رجوع للأحدث (activeIndex--) */}
<button
  onClick={() => setActiveIndex((i) => Math.min(total - 2, i + 1))}
  disabled={!canNext}
  className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-200 ${
    canNext ? "border-stone-800 text-stone-800 hover:bg-stone-800 hover:text-white" : "border-stone-200 text-stone-300 cursor-not-allowed"
  }`}
>
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
</button>
<div className="flex gap-1.5">
  {Array.from({ length: total - 1 }).map((_, i) => (
    <span
      key={i}
      onClick={() => setActiveIndex(i)}
      className="cursor-pointer h-1.5 w-1.5 rounded-full transition-all duration-200"
      style={{
        background: activeIndex === i ? "#1c1917" : "#d6d3d1",
      }}
    />
  ))}
</div>

            {/* زر يسار = الذهاب للتالي (activeIndex++) */}
<button
  onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
  disabled={!canPrev}
  className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-200 ${
    canPrev ? "border-stone-800 text-stone-800 hover:bg-stone-800 hover:text-white" : "border-stone-200 text-stone-300 cursor-not-allowed"
  }`}
>
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
</button>
          </div>
        )}
      </div>

      {/* ── TABLET+ ── */}
      <div className="hidden sm:grid sm:grid-cols-3 px-4" style={{ gap: 15 }}>
        {(products.length === 0 ? Array(3).fill(null) : products).map((p, i) =>
          !p ? (
            <div key={i} className="bg-stone-100 aspect-[5/6] animate-pulse" />
          ) : (
            <Link href={`${section.detailBase}/${p.id}`} key={p.id} className="block">
              <div style={{ animationDelay: `${i * 100}ms` }} className="animate-fade-in bg-[#f0efeb] relative group overflow-hidden">
                {p.discount?.active && (
                  <span className="absolute top-3 right-3 z-10 bg-white text-stone-700 text-xs font-semibold px-2.5 py-1 tracking-wide">
                    وفّر {p.discount.percentage}%
                  </span>
                )}
                <div className="aspect-[5/6] overflow-hidden">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" onError={(e) => { e.target.src = FALLBACK_IMG; }} />
                </div>
                <div className="bg-white px-4 py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <svg key={s} fill={s <= Math.round(p.rating) ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} className={`w-4 h-4 ${s <= Math.round(p.rating) ? "text-stone-800" : "text-stone-300"}`} viewBox="0 0 24 24">
                          <path d={STAR_PATH} />
                        </svg>
                      ))}
                    </div>
                    <p className="text-stone-800 text-xl font-medium leading-snug line-clamp-2 mt-1">{p.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-stone-800 text-base font-semibold">{p.price} {p.currency}</span>
                      {p.discount?.active && p.discount?.originalPrice && (
                        <span className="text-stone-400 text-sm line-through">{p.discount.originalPrice} {p.currency}</span>
                      )}
                    </div>
                  </div>
                  <button
                    disabled={!p.inStock}
                    onClick={(e) => handleAddToCart(e, p)}
                    className={`shrink-0 text-sm tracking-wide font-semibold px-5 py-3 rounded-full whitespace-nowrap transition-all duration-200 mt-1 border ${
                      p.inStock ? "bg-black text-white border-black hover:bg-white hover:text-black" : "bg-stone-200 text-stone-400 border-transparent cursor-not-allowed"
                    }`}
                  >
                    {p.inStock ? "أضف للسلة" : "نفذ"}
                  </button>
                </div>
              </div>
            </Link>
          )
        )}
      </div>
    </section>
  );
}
// WomensSection - Mobile: full-width image only with light padding
function WomensSection({ section, products }) {
  const product = products[0];
  return (
    <section id={section.id} className="py-8 sm:py-10">
      <div className="flex items-center justify-between px-4 sm:px-8 lg:px-16 mb-4 sm:mb-5">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-stone-800">{section.headline}</h2>
        <Link href="/Womens" className="text-[10px] sm:text-[11px] tracking-widest uppercase text-stone-800 underline underline-offset-4 hover:text-stone-500 transition-colors">
          تسوق الآن
        </Link>
      </div>

      {/* Mobile: image only, light horizontal padding */}
      <div className="sm:hidden px-3">
        <Link href={product ? `${section.detailBase}/${product.id}` : "/Womens"} className="block relative overflow-hidden bg-stone-100 aspect-[3/4]">
          {product && (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80"; }}
            />
          )}
          {/* subtle overlay label */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent px-4 py-5">
            <p className="text-white text-lg font-semibold">{section.headline}</p>
            <p className="text-white/70 text-xs tracking-widest">{section.subheadline}</p>
          </div>
        </Link>
      </div>

      {/* Tablet+: side by side */}
      <div className="hidden sm:flex h-[80vh]" style={{ paddingLeft: 15, paddingRight: 15 }}>
        <Link href={product ? `${section.detailBase}/${product.id}` : "/Womens"} className="w-1/2 relative overflow-hidden bg-stone-100 block">
          {product && (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-700" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80"; }} />
          )}
        </Link>
        <div className="w-1/2 bg-black flex flex-col items-center justify-center gap-6 px-12">
          <h2 className="text-white text-3xl sm:text-4xl font-semibold text-center leading-snug">{section.headline}</h2>
          <p className="text-stone-400 text-base tracking-widest text-center">{section.subheadline}</p>
          <Link href="/Womens" className="border border-white bg-white text-black px-7 py-2 text-sm w-40 tracking-widest hover:bg-black hover:text-white transition-all duration-300 text-center">
            تسوق الآن
          </Link>
        </div>
      </div>
    </section>
  );
}

// BestSellersSection - Mobile: full-width image only with light padding
function BestSellersSection({ section, products }) {
  const product = products[0];
  return (
    <section id={section.id} className="py-8 sm:py-10">
      <div className="flex items-center justify-between px-4 sm:px-8 lg:px-16 mb-4 sm:mb-5">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-stone-800">{section.headline}</h2>
        <Link href="/bestseller" className="text-[10px] sm:text-[11px] tracking-widest uppercase text-stone-800 underline underline-offset-4 hover:text-stone-500 transition-colors">
          تسوق الآن
        </Link>
      </div>

      {/* Mobile: image only, light horizontal padding */}
      <div className="sm:hidden px-3">
        <Link href={product ? `${section.detailBase}/${product.id}` : "/bestseller"} className="block relative overflow-hidden bg-stone-100 aspect-[3/4]">
          {product && (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = FALLBACK_IMG; }}
            />
          )}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent px-4 py-5">
            <p className="text-white text-lg font-semibold">{section.headline}</p>
            <p className="text-white/70 text-xs tracking-widest">{section.subheadline}</p>
          </div>
        </Link>
      </div>

      {/* Tablet+: side by side */}
      <div className="hidden sm:flex h-[80vh]" style={{ paddingLeft: 15, paddingRight: 15 }}>
        <div className="w-1/2 bg-black flex flex-col items-center justify-center gap-6 px-12">
          <h2 className="text-white text-3xl sm:text-4xl font-semibold text-center leading-snug">{section.headline}</h2>
          <p className="text-stone-400 text-base tracking-widest text-center">{section.subheadline}</p>
          <Link href="/bestseller" className="border border-white bg-white text-black px-7 py-2 text-sm w-40 tracking-widest hover:bg-black hover:text-white transition-all duration-300 text-center">
            تسوق الآن
          </Link>
        </div>
        <Link href={product ? `${section.detailBase}/${product.id}` : "/bestseller"} className="w-1/2 relative overflow-hidden bg-stone-100 block">
          {product && (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-700" onError={(e) => { e.target.src = FALLBACK_IMG; }} />
          )}
        </Link>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [data, setData] = useState({ mens: [], womens: [], "best-sellers": [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadAll() {
      try {
        const responses = await Promise.all(SECTIONS.map((s) => fetch(`/api/data?collection=${s.apiCollection}`)));
        for (const [i, res] of responses.entries()) {
          if (!res.ok) throw new Error(`فشل تحميل ${SECTIONS[i].headline}`);
        }
        const jsons = await Promise.all(responses.map((r) => r.json()));
        setData({
          mens: extractAllProducts(jsons[0]).slice(0, 3),
          womens: extractAllProducts(jsons[1]).slice(0, 1),
          "best-sellers": extractAllProducts(jsons[2])
            .sort((a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0))
            .slice(1, 2),
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border border-stone-300 border-t-stone-800 rounded-full animate-spin" />
          <span className="text-stone-400 text-xs tracking-widest">جاري التحميل...</span>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-stone-800 text-sm tracking-widest">{error}</p>
          <button onClick={() => window.location.reload()} className="border border-black text-black px-6 py-2 text-xs tracking-widest hover:bg-black hover:text-white transition-all duration-200">
            إعادة المحاولة
          </button>
        </div>
      </div>
    );

  return (
    <div dir="rtl" className="min-h-screen bg-white text-stone-800" style={{ fontFamily: "'Cairo', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap');
        @keyframes fade-in { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        .animate-fade-in { animation: fade-in 0.5s ease-out both; }
      `}</style>

      {/* Hero Section */}
      <section className="relative flex items-start justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1704305861425-8683b791e638?w=1600&q=85"
          alt="hero"
          className="w-full object-cover"
          style={{ maxHeight: "100svh", objectPosition: "center 37%" }}
        />
        <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 z-10 text-center px-4 w-full">
          <p className="text-white text-lg sm:text-[22px] lg:text-[36px] font-normal tracking-wide mb-3 whitespace-nowrap">أفضل المنتجات لك</p>
          <a
            href="/all"
            className="inline-block bg-black text-white text-sm sm:text-[18px] font-medium tracking-widest px-6 py-2 rounded-full border border-black hover:border-white hover:bg-white hover:text-black transition-all duration-300 w-40 sm:w-52 text-center"
          >
            تسوق الآن
          </a>
        </div>
      </section>

      <div id="collections" className="bg-white">
        <NecSection section={SECTIONS[0]} products={data.mens} />
        <WomensSection section={SECTIONS[1]} products={data.womens} />
        <BestSellersSection section={SECTIONS[2]} products={data["best-sellers"]} />
      </div>

      <section style={{ position: "relative", overflow: "hidden", boxSizing: "border-box" }}>
        <img
          src="https://necessaire.com/cdn/shop/files/Homepage_Secondary_HairCollection_Mobile.jpg?v=1774468515&width=860"
          alt=""
          className="w-full object-cover"
          style={{ maxHeight: "100vh", objectPosition: "top", display: "block", boxSizing: "border-box" }}
        />
      </section>
    </div>
  );
}