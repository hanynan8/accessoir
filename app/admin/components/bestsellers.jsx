'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus, Trash2, Save, RefreshCw, ChevronDown, ChevronUp,
  Loader, AlertCircle, CheckCircle, TrendingUp, Tag,
  ToggleLeft, ToggleRight, Layers, ShoppingBag
} from 'lucide-react';

const API_BASE_URL = '/api/data';
const COLLECTION_NAME = 'BestSellers';

const EMPTY_PRODUCT = {
  id: '',
  name: '',
  brand: '',
  description: '',
  image: '',
  price: 0,
  currency: 'جنية',
  discount: { active: false },
  inStock: true,
  rating: 0,
  soldCount: 0,
  details: { targets: [], features: [], howToUse: '', size: '', weight: '' }
};

const EMPTY_COLLECTION = {
  collection: '',
  title: '',
  description: '',
  products: []
};

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl border-2 border-red-100 w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <Trash2 size={20} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">{title}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition"
          >
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── useConfirm — ref-based to avoid stale closure issues ────────────────────
function useConfirm() {
  const [dialogState, setDialogState] = useState({ open: false, title: '', message: '' });
  const resolveRef = useRef(null);

  const confirm = useCallback((title, message) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setDialogState({ open: true, title, message });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setDialogState(s => ({ ...s, open: false }));
    resolveRef.current?.(true);
  }, []);

  const handleCancel = useCallback(() => {
    setDialogState(s => ({ ...s, open: false }));
    resolveRef.current?.(false);
  }, []);

  const DialogNode = (
    <ConfirmDialog
      open={dialogState.open}
      title={dialogState.title}
      message={dialogState.message}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, DialogNode };
}

// ─── Product Editor ───────────────────────────────────────────────────────────
function ProductEditor({ prod, onChange, onRemove }) {
  const [open, setOpen] = useState(false);
  const { confirm, DialogNode } = useConfirm();

  const set = (field, value) => onChange({ ...prod, [field]: value });

  const setDetail = (field, value) =>
    onChange({ ...prod, details: { ...prod.details, [field]: value } });

  const setArrayItem = (field, idx, value) => {
    const arr = [...(prod.details[field] || [])];
    arr[idx] = value;
    setDetail(field, arr);
  };

  const addArrayItem = (field) =>
    setDetail(field, [...(prod.details[field] || []), '']);

  const removeArrayItem = (field, idx) =>
    setDetail(field, (prod.details[field] || []).filter((_, i) => i !== idx));

  const toggleDiscount = () => {
    const active = !prod.discount?.active;
    onChange({
      ...prod,
      discount: active
        ? { active: true, originalPrice: prod.price || 0, percentage: 0 }
        : { active: false }
    });
  };

  const handleRemove = async (e) => {
    e.stopPropagation();
    const ok = await confirm('حذف المنتج', `هل أنت متأكد من حذف "${prod.name || 'هذا المنتج'}"؟`);
    if (ok) onRemove();
  };

  return (
    <>
      {DialogNode}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        {/* Row */}
        <div
          className="flex items-center gap-3 p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
          onClick={() => setOpen(o => !o)}
        >
          {prod.image && (
            <img src={prod.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
          )}
          <div className="flex-1 text-right min-w-0">
            <div className="font-medium text-gray-800 truncate">{prod.name || 'منتج جديد'}</div>
            {prod.brand && <div className="text-xs text-amber-600 truncate">{prod.brand}</div>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-bold text-emerald-600">
              {prod.price} {prod.currency}
            </span>
            {prod.soldCount > 0 && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full flex items-center gap-1">
                <ShoppingBag size={11} /> {prod.soldCount}
              </span>
            )}
            {prod.discount?.active && (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                {prod.discount.percentage}%
              </span>
            )}
          </div>
          <button onClick={handleRemove} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition shrink-0">
            <Trash2 size={15} />
          </button>
          {open ? <ChevronUp size={18} className="shrink-0" /> : <ChevronDown size={18} className="shrink-0" />}
        </div>

        {/* Expanded */}
        {open && (
          <div className="p-4 space-y-4 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-500">ID المنتج</label>
                <input value={prod.id || ''} readOnly
                  className="w-full px-3 py-2.5 border-2 border-gray-100 rounded-xl bg-gray-50 text-gray-400 cursor-not-allowed select-none outline-none" dir="ltr" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-500">اسم المنتج</label>
                <input value={prod.name || ''} onChange={e => set('name', e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-amber-400 outline-none text-right" dir="rtl" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-500">الماركة (Brand)</label>
                <input value={prod.brand || ''} onChange={e => set('brand', e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-amber-400 outline-none text-right" dir="rtl" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-500">عدد المبيعات</label>
                <input type="number" value={prod.soldCount || 0}
                  onChange={e => set('soldCount', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-amber-400 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold mb-1 text-gray-500">الوصف</label>
                <textarea value={prod.description || ''} onChange={e => set('description', e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-amber-400 outline-none text-right resize-none" dir="rtl" rows={2} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold mb-1 text-gray-500">رابط الصورة</label>
                <input value={prod.image || ''} onChange={e => set('image', e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-amber-400 outline-none" dir="ltr" placeholder="https://..." />
                {prod.image && <img src={prod.image} alt="" className="mt-2 h-20 rounded-xl object-cover" />}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-500">السعر</label>
                <input type="number" value={prod.price || 0}
                  onChange={e => set('price', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-amber-400 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-500">التقييم</label>
                <input type="number" step="0.1" min="0" max="5" value={prod.rating || 0}
                  onChange={e => set('rating', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-amber-400 outline-none" />
              </div>
              <div className="flex items-end">
                <button onClick={() => set('inStock', !prod.inStock)}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition ${prod.inStock ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {prod.inStock ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  {prod.inStock ? 'متوفر' : 'نفذ'}
                </button>
              </div>
              <div className="flex items-end">
                <button onClick={toggleDiscount}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition ${prod.discount?.active ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                  <Tag size={18} /> {prod.discount?.active ? 'إلغاء خصم' : 'إضافة خصم'}
                </button>
              </div>
            </div>

            {prod.discount?.active && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-orange-50 rounded-xl border border-orange-200">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-orange-600">السعر الأصلي</label>
                  <input type="number" value={prod.discount.originalPrice || 0}
                    onChange={e => onChange({ ...prod, discount: { ...prod.discount, originalPrice: parseFloat(e.target.value) || 0 } })}
                    className="w-full px-3 py-2.5 border-2 border-orange-200 rounded-xl focus:border-orange-400 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-orange-600">نسبة الخصم %</label>
                  <input type="number" min="0" max="100" value={prod.discount.percentage || 0}
                    onChange={e => onChange({ ...prod, discount: { ...prod.discount, percentage: parseInt(e.target.value) || 0 } })}
                    className="w-full px-3 py-2.5 border-2 border-orange-200 rounded-xl focus:border-orange-400 outline-none" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-500">الحجم / المقاس</label>
                <input value={prod.details?.size || ''} onChange={e => setDetail('size', e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-amber-400 outline-none text-right" dir="rtl" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-500">الوزن</label>
                <input value={prod.details?.weight || ''} onChange={e => setDetail('weight', e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-amber-400 outline-none text-right" dir="rtl" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold mb-1 text-gray-500">طريقة الاستخدام</label>
                <textarea value={prod.details?.howToUse || ''} onChange={e => setDetail('howToUse', e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-amber-400 outline-none text-right resize-none" dir="rtl" rows={2} />
              </div>
            </div>

            {['targets', 'features'].map(field => (
              <div key={field}>
                <label className="block text-xs font-semibold mb-2 text-gray-500">
                  {field === 'targets' ? 'المستهدفون' : 'المميزات'}
                </label>
                <div className="space-y-2">
                  {(prod.details?.[field] || []).map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input value={item} onChange={e => setArrayItem(field, idx, e.target.value)}
                        className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-amber-400 outline-none text-right" dir="rtl" />
                      <button onClick={() => removeArrayItem(field, idx)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addArrayItem(field)}
                    className="flex items-center gap-1 text-amber-600 hover:bg-amber-50 px-3 py-1.5 rounded-lg text-sm transition">
                    <Plus size={15} /> إضافة
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BestSellersAdmin() {
  const [config, setConfig] = useState(null);
  const [docId, setDocId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [expandedCollections, setExpandedCollections] = useState({});
  const { confirm, DialogNode } = useConfirm();

  useEffect(() => { fetchConfig(); }, []);

  const showMessage = (msg, type = 'success') => {
    type === 'success' ? setSuccess(msg) : setError(msg);
    setTimeout(() => { setSuccess(''); setError(''); }, 4000);
  };

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}?collection=${COLLECTION_NAME}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      const data = Array.isArray(result) && result.length > 0 ? result[0] : null;
      if (data) {
        const { _id, __v, ...rest } = data;
        setDocId(String(_id));
        setConfig(rest);
      } else {
        setDocId(null);
        setConfig({ collections: [] });
      }
    } catch (err) {
      showMessage('خطأ في التحميل: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!config) return;
    setLoading(true);
    try {
      let res;
      if (docId) {
        res = await fetch(`${API_BASE_URL}?collection=${COLLECTION_NAME}&id=${docId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config)
        });
        if (res.status === 404) {
          setDocId(null);
          res = await fetch(`${API_BASE_URL}?collection=${COLLECTION_NAME}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
          });
        }
      } else {
        res = await fetch(`${API_BASE_URL}?collection=${COLLECTION_NAME}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config)
        });
      }
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || `HTTP ${res.status}`);
      }
      showMessage('✅ تم الحفظ بنجاح');
      fetchConfig();
    } catch (err) {
      showMessage('❌ خطأ في الحفظ: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Collections ──
  const addCollection = () => {
    setConfig(prev => ({
      ...prev,
      collections: [
        ...(prev.collections || []),
        { ...EMPTY_COLLECTION, collection: `col_${Date.now()}` }
      ]
    }));
  };

  const updateCollection = (ci, field, value) => {
    setConfig(prev => {
      const cols = [...prev.collections];
      cols[ci] = { ...cols[ci], [field]: value };
      return { ...prev, collections: cols };
    });
  };

  const removeCollection = (ci) => {
    setConfig(prev => ({ ...prev, collections: prev.collections.filter((_, i) => i !== ci) }));
  };

  const handleRemoveCollection = async (e, ci, title) => {
    e.stopPropagation();
    const ok = await confirm(
      'حذف التصنيف',
      `هل أنت متأكد من حذف "${title || 'هذا التصنيف'}" وجميع محتوياته؟`
    );
    if (ok) removeCollection(ci);
  };

  // ── Products ──
  const updateDirectProduct = (ci, pi, updatedProd) => {
    setConfig(prev => {
      const cols = [...prev.collections];
      const prods = [...(cols[ci].products || [])];
      prods[pi] = updatedProd;
      cols[ci] = { ...cols[ci], products: prods };
      return { ...prev, collections: cols };
    });
  };

  const addDirectProduct = (ci) => {
    setConfig(prev => {
      const cols = [...prev.collections];
      cols[ci] = {
        ...cols[ci],
        products: [...(cols[ci].products || []), { ...EMPTY_PRODUCT, id: `prod_${Date.now()}` }]
      };
      return { ...prev, collections: cols };
    });
  };

  const removeDirectProduct = (ci, pi) => {
    setConfig(prev => {
      const cols = [...prev.collections];
      cols[ci] = { ...cols[ci], products: cols[ci].products.filter((_, i) => i !== pi) };
      return { ...prev, collections: cols };
    });
  };

  if (!config) return (
    <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
      <Loader className="animate-spin mx-auto text-amber-500" size={48} />
    </div>
  );

  return (
    <>
      {DialogNode}
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-amber-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b-2 border-gray-200 bg-gradient-to-r from-amber-50 to-yellow-50">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-amber-900">
              <TrendingUp size={28} /> إدارة الأكثر مبيعاً
            </h2>
            <div className="flex gap-3">
              <button onClick={fetchConfig} disabled={loading}
                className="flex items-center gap-2 bg-amber-500 text-white px-5 py-2.5 rounded-xl hover:bg-amber-600 transition disabled:opacity-50">
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> تحديث
              </button>
              <button onClick={saveConfig} disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium disabled:opacity-50">
                {loading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />} حفظ الكل
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {(success || error) && (
          <div className={`mx-6 mt-4 px-6 py-4 rounded-2xl flex items-center gap-3 text-white ${success ? 'bg-emerald-500' : 'bg-red-500'}`}>
            {success ? <CheckCircle size={22} /> : <AlertCircle size={22} />}
            <span className="font-medium">{success || error}</span>
          </div>
        )}

        <div className="p-6 space-y-5">
          {(config.collections || []).map((col, ci) => (
            <div key={ci} className="border-2 border-gray-200 rounded-2xl overflow-hidden">
              {/* Collection Header */}
              <div
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 cursor-pointer"
                onClick={() => setExpandedCollections(prev => ({ ...prev, [ci]: !prev[ci] }))}
              >
                <Layers size={20} className="text-amber-600 shrink-0" />
                <div className="flex-1 grid grid-cols-2 gap-3" onClick={e => e.stopPropagation()}>
                  <input value={col.title || ''} onChange={e => updateCollection(ci, 'title', e.target.value)}
                    className="px-3 py-2 border-2 border-gray-200 rounded-xl text-right font-bold focus:border-amber-400 outline-none bg-white"
                    placeholder="اسم التصنيف" dir="rtl" />
                  <input value={col.collection || ''} onChange={e => updateCollection(ci, 'collection', e.target.value)}
                    className="px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-amber-400 outline-none bg-white"
                    placeholder="collection key" dir="ltr" />
                </div>
                <span className="text-sm text-gray-500 shrink-0">
                  {(col.products || []).length} منتج
                </span>
                <button
                  onClick={e => handleRemoveCollection(e, ci, col.title)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition shrink-0"
                >
                  <Trash2 size={16} />
                </button>
                {expandedCollections[ci]
                  ? <ChevronUp size={20} className="shrink-0" />
                  : <ChevronDown size={20} className="shrink-0" />}
              </div>

              {expandedCollections[ci] && (
                <div className="p-4 space-y-4">
                  <input value={col.description || ''} onChange={e => updateCollection(ci, 'description', e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-right focus:border-amber-400 outline-none"
                    placeholder="وصف التصنيف" dir="rtl" />

                  {/* Products */}
                  <div className="space-y-3">
                    {(col.products || []).map((prod, pi) => (
                      <ProductEditor
                        key={pi}
                        prod={prod}
                        onChange={updated => updateDirectProduct(ci, pi, updated)}
                        onRemove={() => removeDirectProduct(ci, pi)}
                      />
                    ))}
                    <button onClick={() => addDirectProduct(ci)}
                      className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-amber-300 text-amber-600 hover:bg-amber-50 py-3 rounded-xl transition">
                      <Plus size={18} /> إضافة منتج
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button onClick={addCollection}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-amber-300 text-amber-600 hover:bg-amber-50 py-4 rounded-2xl text-lg font-medium transition">
            <Plus size={22} /> إضافة تصنيف جديد
          </button>
        </div>
      </div>
    </>
  );
}