'use client'
import React, { useState, createContext, useContext, useEffect } from 'react';
import { ShoppingBag, Trash2, X, CheckCircle, AlertCircle, LogOut, ArrowLeft } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState('ar');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const { data: session } = useSession();

  useEffect(() => {
    const fetchWhatsAppNumber = async () => {
      try {
        const response = await fetch('/api/data?collection=whatsapp');
        const data = await response.json();
        let whatsappData = null;
        if (data.whatsapp && Array.isArray(data.whatsapp) && data.whatsapp.length > 0) whatsappData = data.whatsapp[0];
        else if (Array.isArray(data) && data.length > 0) whatsappData = data[0];
        if (whatsappData?.whatsApp) setWhatsappNumber(whatsappData.whatsApp.replace(/[+\s]/g, ''));
      } catch (error) { console.error('Error fetching WhatsApp number:', error); }
    };
    fetchWhatsAppNumber();
  }, []);

  const showNotification = (messageAr, messageEn, type = 'success') => {
    setNotification({ messageAr, messageEn, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const extractPrice = (price) => {
    if (typeof price === 'number') return price;
    if (typeof price === 'string') {
      const arabicNumbers = '٠١٢٣٤٥٦٧٨٩';
      const englishNumbers = '0123456789';
      let cleanPrice = '';
      for (let char of price) {
        const arabicIndex = arabicNumbers.indexOf(char);
        if (arabicIndex !== -1) cleanPrice += englishNumbers[arabicIndex];
        else if (englishNumbers.includes(char) || char === '.') cleanPrice += char;
      }
      return parseFloat(cleanPrice) || 0;
    }
    return 0;
  };

  useEffect(() => {
    const loadCart = async () => {
      if (session?.user?.name) {
        const localCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        if (localCart.length > 0) {
          try {
            for (const item of localCart) {
              await fetch('/api/data?collection=cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: session.user.name, item, quantity: item.quantity, createdAt: new Date().toISOString() }) });
            }
            localStorage.removeItem('guestCart');
          } catch (error) { console.error('Error transferring cart:', error); }
        }
        try {
          const response = await fetch('/api/data?collection=cart');
          const data = await response.json();
          let cartArray = data.cart && Array.isArray(data.cart) ? data.cart : Array.isArray(data) ? data : [];
          const userCartItems = cartArray.filter(item => item.name === session.user.name);
          const groupedItems = {};
          userCartItems.forEach(cartItem => {
            const itemId = cartItem.item.id;
            if (groupedItems[itemId]) { groupedItems[itemId].quantity += cartItem.quantity || 1; groupedItems[itemId]._ids = [...(groupedItems[itemId]._ids || []), cartItem._id]; }
            else groupedItems[itemId] = { ...cartItem.item, quantity: cartItem.quantity || 1, _ids: [cartItem._id] };
          });
          setCartItems(Object.values(groupedItems));
        } catch (error) { console.error('Error loading cart:', error); }
      } else {
        setCartItems(JSON.parse(localStorage.getItem('guestCart') || '[]'));
      }
    };
    loadCart();
  }, [session]);

  const addToCart = async (item) => {
    setCartItems(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      if (existingItem) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
    showNotification('تمت الإضافة للسلة', 'Added to cart', 'success');
    if (session?.user?.name) {
      try { await fetch('/api/data?collection=cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: session.user.name, item, quantity: 1, createdAt: new Date().toISOString() }) }); }
      catch (error) { console.warn('Error adding to cart API:', error); }
    } else {
      try {
        const localCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const existingItem = localCart.find(i => i.id === item.id);
        if (existingItem) existingItem.quantity += 1; else localCart.push({ ...item, quantity: 1 });
        localStorage.setItem('guestCart', JSON.stringify(localCart));
      } catch (error) { console.error('Error saving to localStorage:', error); }
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    showNotification('تم حذف المنتج', 'Item removed', 'warning');
    if (session?.user?.name) {
      try {
        const response = await fetch('/api/data?collection=cart');
        const data = await response.json();
        let cartArray = data.cart && Array.isArray(data.cart) ? data.cart : Array.isArray(data) ? data : [];
        const itemsToDelete = cartArray.filter(item => item.name === session.user.name && item.item.id === itemId);
        for (const item of itemsToDelete) await fetch(`/api/data?collection=cart&id=${item._id}`, { method: 'DELETE' });
      } catch (error) { console.error('Error removing from cart API:', error); }
    } else {
      const localCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      localStorage.setItem('guestCart', JSON.stringify(localCart.filter(item => item.id !== itemId)));
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity === 0) { removeFromCart(itemId); return; }
    setCartItems(prev => prev.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item));
    if (session?.user?.name) {
      try {
        const response = await fetch('/api/data?collection=cart');
        const data = await response.json();
        let cartArray = data.cart && Array.isArray(data.cart) ? data.cart : Array.isArray(data) ? data : [];
        const userItems = cartArray.filter(item => item.name === session.user.name && item.item.id === itemId);
        for (const item of userItems) await fetch(`/api/data?collection=cart&id=${item._id}`, { method: 'DELETE' });
        const cartItem = cartItems.find(item => item.id === itemId);
        if (cartItem) await fetch('/api/data?collection=cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: session.user.name, item: cartItem, quantity: newQuantity, updatedAt: new Date().toISOString() }) });
      } catch (error) { console.error('Error updating cart API:', error); }
    } else {
      const localCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      localStorage.setItem('guestCart', JSON.stringify(localCart.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item)));
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    if (session?.user?.name) {
      try {
        const response = await fetch('/api/data?collection=cart');
        const data = await response.json();
        let cartArray = data.cart && Array.isArray(data.cart) ? data.cart : Array.isArray(data) ? data : [];
        const userItems = cartArray.filter(item => item.name === session.user.name);
        for (const item of userItems) await fetch(`/api/data?collection=cart&id=${item._id}`, { method: 'DELETE' });
      } catch (error) { console.error('Error clearing cart API:', error); }
    } else localStorage.removeItem('guestCart');
  };

  const getTotalItems = () => cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const getTotalPrice = () => cartItems.reduce((sum, item) => sum + (extractPrice(item.price) * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cartItems, isCartOpen, setIsCartOpen, addToCart, removeFromCart, updateQuantity, clearCart, getTotalItems, getTotalPrice, notification, extractPrice, currentLanguage, setCurrentLanguage, whatsappNumber }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

export const CartNotification = () => {
  const { notification, currentLanguage } = useCart();
  if (!notification) return null;
  const isSuccess = notification.type === 'success';
  const message = currentLanguage === 'ar' ? notification.messageAr : notification.messageEn;
  return (
    <>
      <style>{`@keyframes notif-slide { from { opacity: 0; transform: translate(-50%, -12px); } to { opacity: 1; transform: translate(-50%, 0); } }`}</style>
      <div
        className="fixed top-20 sm:top-24 left-1/2 z-[200] flex items-center gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 shadow-xl"
        style={{ animation: 'notif-slide 0.35s cubic-bezier(0.34,1.56,0.64,1) both', transform: 'translateX(-50%)', background: isSuccess ? '#1a1a1a' : '#c8a97e', color: 'white', border: '1px solid', borderColor: isSuccess ? '#333' : '#b8956e', minWidth: 200, fontFamily: "'Cairo', sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: '0.03em' }}
      >
        {isSuccess ? <CheckCircle size={14} style={{ flexShrink: 0 }} /> : <AlertCircle size={14} style={{ flexShrink: 0 }} />}
        <span>{message}</span>
      </div>
    </>
  );
};

/* ═══════════════════════════════
   CART DRAWER — Mobile Responsive
═══════════════════════════════ */
const Cart = ({ language = 'ar' }) => {
  const { cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart, getTotalPrice, extractPrice, setCurrentLanguage, whatsappNumber } = useCart();
  const { data: session } = useSession();
  const [isClosing, setIsClosing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => { setCurrentLanguage(language); }, [language, setCurrentLanguage]);
  useEffect(() => {
    if (isCartOpen) { document.body.style.overflow = 'hidden'; setIsClosing(false); }
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isCartOpen]);

  const handleClose = () => { setIsClosing(true); setTimeout(() => { setIsCartOpen(false); setIsClosing(false); }, 320); };
  if (!isCartOpen && !isClosing) return null;

  const t = language === 'ar' ? {
    title: 'السلة', empty: 'سلتك فارغة', emptySub: 'أضف منتجات لتبدأ التسوق',
    total: 'الإجمالي', currency: 'AED', order: 'إتمام الطلب', clear: 'إفراغ السلة',
    logout: 'تسجيل الخروج', confirmTitle: 'تسجيل الخروج', confirmMsg: 'هل أنت متأكد من تسجيل الخروج؟', yes: 'نعم، خروج', cancel: 'إلغاء',
  } : {
    title: 'Cart', empty: 'Your cart is empty', emptySub: 'Add items to start shopping',
    total: 'Total', currency: 'AED', order: 'Place Order', clear: 'Clear Cart',
    logout: 'Logout', confirmTitle: 'Logout', confirmMsg: 'Are you sure you want to logout?', yes: 'Yes, Logout', cancel: 'Cancel',
  };

  const handleCheckout = async () => {
    if (!session?.user?.name) { window.location.href = '/login'; return; }
    if (!whatsappNumber) { alert(language === 'ar' ? 'رقم الواتساب غير متوفر' : 'WhatsApp number unavailable'); return; }
    try {
      const userResponse = await fetch('/api/data?collection=auth');
      const userData = await userResponse.json();
      let usersArray = userData.auth && Array.isArray(userData.auth) ? userData.auth : Array.isArray(userData) ? userData : [];
      const currentUser = usersArray.find(u => u.name === session.user.name);
      if (!currentUser) { alert('خطأ في تحميل بيانات المستخدم'); return; }
      let message = `*طلب جديد / New Order*\n\n👤 *${currentUser.name}*\n📞 ${currentUser.phone}\n📍 ${currentUser.address}\n`;
      if (currentUser.location) message += `🗺️ ${currentUser.location}\n`;
      message += `\n*المنتجات:*\n${'─'.repeat(20)}\n`;
      cartItems.forEach((item, index) => {
        const price = extractPrice(item.price);
        message += `${index + 1}. *${item.name}*\n   الكمية: ${item.quantity} × ${price.toFixed(2)} AED = ${(price * item.quantity).toFixed(2)} AED\n\n`;
      });
      message += `${'─'.repeat(20)}\n💰 *الإجمالي: ${getTotalPrice().toFixed(2)} AED*`;
      window.location.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      await clearCart();
    } catch (error) { console.error('Checkout error:', error); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap');
        @keyframes cart-overlay-in { from{opacity:0} to{opacity:1} }
        @keyframes cart-overlay-out { from{opacity:1} to{opacity:0} }
        @keyframes cart-slide-in { from{transform:translateX(100%)} to{transform:translateX(0)} }
        @keyframes cart-slide-out { from{transform:translateX(0)} to{transform:translateX(100%)} }
        @keyframes cart-item-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes modal-scale-in { from{opacity:0;transform:translate(-50%,-50%) scale(0.94)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
        .cart-scrollbar::-webkit-scrollbar { width: 3px; }
        .cart-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .cart-scrollbar::-webkit-scrollbar-thumb { background: #e0d9d0; border-radius: 2px; }
      `}</style>

      {/* Logout Modal */}
      {showLogoutModal && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" style={{ zIndex: 300 }} onClick={() => setShowLogoutModal(false)} />
          <div className="fixed z-[301] w-[90vw] sm:w-full sm:max-w-sm bg-white shadow-2xl p-6 sm:p-8" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontFamily: "'Cairo', sans-serif" }}>
            <div className="h-0.5 w-12 bg-stone-800 mb-5 sm:mb-6" />
            <h3 className="text-base sm:text-lg font-bold text-stone-800 mb-2" dir="rtl">{t.confirmTitle}</h3>
            <p className="text-sm text-stone-500 mb-6 sm:mb-8 leading-relaxed" dir="rtl">{t.confirmMsg}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-2.5 border border-stone-200 text-stone-600 text-sm font-medium hover:border-stone-400 transition-colors">{t.cancel}</button>
              <button onClick={async () => { setShowLogoutModal(false); await signOut({ callbackUrl: '/' }); }} className="flex-1 py-2.5 bg-stone-800 text-white text-sm font-medium hover:bg-stone-700 transition-colors">{t.yes}</button>
            </div>
          </div>
        </>
      )}

      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40" onClick={handleClose} style={{ zIndex: 98, animation: isClosing ? 'cart-overlay-out 0.32s ease forwards' : 'cart-overlay-in 0.32s ease' }} />

      {/* Drawer — full width on mobile, fixed width on desktop */}
      <div
        className="fixed top-0 right-0 h-full flex flex-col bg-white shadow-2xl"
        style={{
          zIndex: 99,
          width: 'min(100vw, 420px)',
          animation: isClosing ? 'cart-slide-out 0.32s ease forwards' : 'cart-slide-in 0.35s cubic-bezier(0.25,1,0.5,1)',
          fontFamily: "'Cairo', sans-serif",
        }}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-stone-100">
          <div className="flex items-center gap-2 sm:gap-3">
            <ShoppingBag size={17} className="text-stone-800" strokeWidth={1.6} />
            <h2 className="text-sm sm:text-base font-bold text-stone-800 tracking-wide">{t.title}</h2>
            {cartItems.length > 0 && <span className="text-xs text-stone-400 font-medium">({cartItems.reduce((s, i) => s + i.quantity, 0)})</span>}
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1">
            {session && (
              <button onClick={() => setShowLogoutModal(true)} className="p-2 text-stone-400 hover:text-stone-700 transition-colors" title={t.logout}>
                <LogOut size={14} />
              </button>
            )}
            <button onClick={handleClose} className="p-2 text-stone-400 hover:text-stone-700 transition-colors">
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto cart-scrollbar">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 pb-16 px-8 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 border border-stone-200 flex items-center justify-center">
                <ShoppingBag size={22} className="text-stone-300" strokeWidth={1.4} />
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-700 mb-1">{t.empty}</p>
                <p className="text-xs text-stone-400">{t.emptySub}</p>
              </div>
            </div>
          ) : (
            <div className="px-4 sm:px-6 py-3 sm:py-4 space-y-0">
              {cartItems.map((item, i) => (
                <div key={item.id} className="flex gap-3 sm:gap-4 py-4 sm:py-5 border-b border-stone-100 last:border-0" style={{ animation: `cart-item-in 0.3s ease ${i * 0.05}s both` }}>
                  {/* Image */}
                  <div className="w-16 h-20 sm:w-20 sm:h-24 flex-shrink-0 bg-[#f0efeb] overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1556228841-a3c527ebefe5?w=200&q=80'; }} />
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-stone-800 leading-snug line-clamp-2 mb-1">{item.name}</p>
                      <p className="text-xs text-stone-400">{extractPrice(item.price).toFixed(2)} {item.currency || 'AED'}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2 sm:mt-3">
                      <div className="flex items-center border border-stone-200">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-stone-500 hover:bg-stone-50 transition-colors text-sm">−</button>
                        <span className="w-6 sm:w-7 text-center text-xs font-semibold text-stone-800">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-stone-500 hover:bg-stone-50 transition-colors text-sm">+</button>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xs sm:text-sm font-bold text-stone-800">{(extractPrice(item.price) * item.quantity).toFixed(2)}</span>
                        <button onClick={() => removeFromCart(item.id)} className="text-stone-300 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-stone-100 px-4 sm:px-6 py-4 sm:py-5 space-y-3 sm:space-y-4 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-stone-500">{t.total}</span>
              <span className="text-lg sm:text-xl font-black text-stone-800 tracking-tight">
                {getTotalPrice().toFixed(2)} <span className="text-xs sm:text-sm font-semibold text-stone-400">{t.currency}</span>
              </span>
            </div>
            <button onClick={handleCheckout} className="w-full py-3 sm:py-3.5 bg-stone-800 text-white text-xs sm:text-sm font-bold tracking-widest hover:bg-stone-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              {t.order}
              <ArrowLeft size={13} />
            </button>
            <button onClick={clearCart} className="w-full py-2 sm:py-2.5 border border-stone-200 text-stone-400 text-xs font-medium tracking-widest hover:border-stone-400 hover:text-stone-600 transition-all">
              {t.clear}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;