// ══════════════════════════════════════════════════
// FILE: app/bestseller/[id]/page.jsx
// ══════════════════════════════════════════════════
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "../../components/cart";

const STAR_PATH = "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z";

function DetailRow({ label, children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 py-4 sm:py-5 border-b border-stone-200 gap-2 sm:gap-4">
      <span className="text-xs tracking-widest uppercase text-stone-400 font-medium">{label}</span>
      <div className="text-sm text-stone-700 leading-relaxed">{children}</div>
    </div>
  );
}

export default function BestSellerProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { addToCart, setIsCartOpen } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/data?collection=BestSellers");
        if (!res.ok) throw new Error("فشل تحميل البيانات");
        const arr = await res.json();
        const allProducts = (arr[0]?.collections ?? []).flatMap((c) => c.products ?? []);
        const found = allProducts.find((p) => p.id === id);
        if (!found) throw new Error("المنتج غير موجود");
        setProduct(found);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    }
    load();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product?.inStock) return;
    setAdding(true);
    for (let i = 0; i < qty; i++) await addToCart(product);
    setTimeout(() => { setAdding(false); setIsCartOpen(true); }, 300);
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="w-10 h-10 border border-stone-300 border-t-stone-700 rounded-full animate-spin" /></div>;
  if (error || !product) return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center space-y-3">
        <p className="text-stone-500 text-sm">{error ?? "المنتج غير موجود"}</p>
        <button onClick={() => router.back()} className="border border-stone-300 text-stone-500 px-6 py-2 text-xs tracking-widest hover:border-stone-500 transition-colors">العودة</button>
      </div>
    </div>
  );

  const { details } = product;
  const fallbackImg = product.id?.startsWith("bs-w")
    ? "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80"
    : "https://images.unsplash.com/photo-1556228841-a3c527ebefe5?w=400&q=80";

  return (
    <div dir="rtl" className="min-h-screen bg-white text-stone-800" style={{ fontFamily: "'Cairo', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap');
        @keyframes fade-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .animate-fade-in { animation: fade-in 0.4s ease-out both; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-3 sm:py-4 text-xs text-stone-400 tracking-widest flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-stone-700 transition-colors">الرئيسية</Link>
        <span>/</span>
        <Link href="/bestsellers" className="hover:text-stone-700 transition-colors">الأكثر مبيعاً</Link>
        <span>/</span>
        <span className="text-stone-600 line-clamp-1 max-w-[140px] sm:max-w-none">{product.name}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pb-10 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 lg:gap-20">
          <div className="animate-fade-in">
            <div className="bg-[#f0efeb] aspect-[3.5/4] overflow-hidden relative">
              {product.soldCount && (
                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10">
                  <span className="bg-black/60 text-white text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 tracking-wide backdrop-blur-sm">{product.soldCount.toLocaleString("ar")} مبيع</span>
                </div>
              )}
              {product.discount?.active && <span className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 bg-white text-stone-700 text-xs font-semibold px-2.5 py-1 sm:px-3 tracking-wide">وفّر {product.discount.percentage}%</span>}
              {!product.inStock && (
                <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                  <span className="bg-stone-800 text-white text-xs sm:text-sm px-4 sm:px-6 py-2 tracking-widest">نفذ من المخزون</span>
                </div>
              )}
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = fallbackImg; }} />
            </div>
          </div>

          <div className="animate-fade-in space-y-4 sm:space-y-6" style={{ animationDelay: "100ms" }}>
            <p className="text-xs tracking-[0.3em] uppercase text-stone-400">{product.brand}</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-800 leading-tight">{product.name}</h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} fill={s <= Math.round(product.rating) ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${s <= Math.round(product.rating) ? "text-stone-800" : "text-stone-300"}`} viewBox="0 0 24 24"><path d={STAR_PATH} /></svg>
                ))}
              </div>
              <span className="text-xs text-stone-400 tracking-widest">{product.rating} / 5</span>
              {product.soldCount && <span className="text-xs text-stone-400 tracking-widest border-r border-stone-200 pr-2 mr-2">{product.soldCount.toLocaleString("ar")} مبيع</span>}
            </div>
            <p className="text-stone-500 text-sm leading-relaxed">{product.description}</p>
            <div className="flex items-end gap-3 pt-1">
              <span className="text-2xl sm:text-3xl font-bold text-stone-800">{product.price} {product.currency}</span>
              {product.discount?.active && product.discount?.originalPrice && (
                <span className="text-stone-400 text-base sm:text-lg line-through mb-0.5">{product.discount.originalPrice} {product.currency}</span>
              )}
            </div>
            {details && (
              <div className="flex items-center gap-4 sm:gap-6 text-xs text-stone-500 tracking-wide border-t border-stone-100 pt-4">
                {details.size && <span><span className="text-stone-400 uppercase tracking-widest ml-1">الحجم</span>{details.size}</span>}
                {details.weight && <span><span className="text-stone-400 uppercase tracking-widest ml-1">الوزن</span>{details.weight}</span>}
              </div>
            )}
            <div className="space-y-3 pt-1">
              <div className="flex items-center border border-stone-200 w-fit">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-stone-500 hover:text-stone-800 hover:bg-stone-50 transition-colors text-lg">−</button>
                <span className="w-10 sm:w-12 text-center text-sm font-medium text-stone-800">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-stone-500 hover:text-stone-800 hover:bg-stone-50 transition-colors text-lg">+</button>
              </div>
              <button disabled={!product.inStock || adding} onClick={handleAddToCart} className={`w-full py-3.5 sm:py-4 text-xs sm:text-sm font-bold tracking-widest transition-all duration-200 border ${product.inStock ? adding ? "bg-stone-600 text-white border-stone-600 cursor-wait" : "bg-black text-white border-black hover:bg-white hover:text-black" : "bg-stone-200 text-stone-400 border-transparent cursor-not-allowed"}`}>
                {adding ? "جاري الإضافة..." : product.inStock ? "أضف إلى السلة" : "نفذ من المخزون"}
              </button>
              <p className="text-center text-xs text-stone-400 tracking-widest">شحن مجاني للطلبات فوق 200 ريال</p>
            </div>
          </div>
        </div>
      </div>

      {details && (
        <div className="border-t border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 sm:py-12">
            <div className="max-w-3xl">
              {details.targets?.length > 0 && <DetailRow label="مناسب لـ"><div className="flex flex-wrap gap-2">{details.targets.map((t, i) => <span key={i} className="border border-stone-200 text-stone-600 text-xs px-2.5 py-1 sm:px-3 tracking-wide">{t}</span>)}</div></DetailRow>}
              {details.features?.length > 0 && <DetailRow label="المميزات"><div className="space-y-2">{details.features.map((f, i) => <div key={i} className="flex items-center gap-2"><svg className="w-4 h-4 text-stone-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><span>{f}</span></div>)}</div></DetailRow>}
              {details.howToUse && <DetailRow label="طريقة الاستخدام"><p className="leading-loose">{details.howToUse}</p></DetailRow>}
              {details.size && <DetailRow label="الحجم">{details.size}</DetailRow>}
              {details.weight && <DetailRow label="الوزن">{details.weight}</DetailRow>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}