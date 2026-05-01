'use client';

import { useState, useEffect } from 'react';
import {
  Plus, Trash2, Save, RefreshCw, Navigation,
  ChevronDown, ChevronUp, Loader, AlertCircle, CheckCircle,
  ShoppingCart, User, Megaphone, Link2, Settings
} from 'lucide-react';

const API_BASE_URL = '/api/data';

const DEFAULT_CONFIG = {
  store: { name: '', nameEn: '' },
  announcements: [],
  navLinks: [],
  icons: {
    login: { title: '', href: '/login' },
    cart: { title: '', href: '/cart', itemCount: 0 }
  }
};

export default function NavbarAdmin() {
  const [config, setConfig] = useState(null);
  const [docId, setDocId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    store: true,
    announcements: false,
    navLinks: false,
    icons: false
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const showMessage = (message, type = 'success') => {
    if (type === 'success') setSuccess(message);
    else setError(message);
    setTimeout(() => {
      setSuccess('');
      setError('');
    }, 4000);
  };

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}?collection=navbar`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const result = await res.json();
      const data = Array.isArray(result) && result.length > 0 ? result[0] : null;

      if (data) {
        const { _id, __v, ...rest } = data;
        setDocId(String(_id));
        setConfig(rest);
      } else {
        setDocId(null);
        setConfig(DEFAULT_CONFIG);
      }
    } catch (err) {
      showMessage('خطأ في تحميل بيانات الـ Navbar: ' + err.message, 'error');
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
        // حاول PUT الأول
        res = await fetch(`${API_BASE_URL}?collection=navbar&id=${docId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config)
        });

        // لو الـ document اتمسح أو مش موجود، ارجع لـ POST
        if (res.status === 404) {
          setDocId(null);
          res = await fetch(`${API_BASE_URL}?collection=navbar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
          });
        }
      } else {
        res = await fetch(`${API_BASE_URL}?collection=navbar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config)
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      showMessage('✅ تم حفظ الإعدادات بنجاح');
      fetchConfig();
    } catch (err) {
      showMessage('❌ خطأ في الحفظ: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateNested = (obj, pathArr, value) => {
    if (pathArr.length === 1) return { ...obj, [pathArr[0]]: value };
    return {
      ...obj,
      [pathArr[0]]: updateNested(obj[pathArr[0]] || {}, pathArr.slice(1), value)
    };
  };

  const updateConfig = (path, value) => {
    setConfig(prev => updateNested(prev, path.split('.'), value));
  };

  // ====================== Announcements ======================
  const addAnnouncement = () => {
    setConfig(prev => ({
      ...prev,
      announcements: [
        ...(prev.announcements || []),
        { id: Date.now(), text: '' }
      ]
    }));
  };

  const updateAnnouncement = (index, value) => {
    setConfig(prev => {
      const updated = [...prev.announcements];
      updated[index] = { ...updated[index], text: value };
      return { ...prev, announcements: updated };
    });
  };

  const removeAnnouncement = (index) => {
    setConfig(prev => ({
      ...prev,
      announcements: prev.announcements.filter((_, i) => i !== index)
    }));
  };

  // ====================== Nav Links ======================
  const addNavLink = () => {
    setConfig(prev => ({
      ...prev,
      navLinks: [
        ...(prev.navLinks || []),
        { id: Date.now(), label: '', href: '/', active: false }
      ]
    }));
  };

  const updateNavLink = (index, field, value) => {
    setConfig(prev => {
      const updated = [...prev.navLinks];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, navLinks: updated };
    });
  };

  const removeNavLink = (index) => {
    setConfig(prev => ({
      ...prev,
      navLinks: prev.navLinks.filter((_, i) => i !== index)
    }));
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (!config) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
        {loading
          ? <Loader className="animate-spin mx-auto text-blue-600" size={48} />
          : <p className="text-gray-500">لا توجد بيانات</p>
        }
      </div>
    );
  }

  const SectionHeader = ({ section, icon: Icon, title, color = 'blue' }) => (
    <div
      className={`flex justify-between items-center cursor-pointer p-5 rounded-2xl bg-gradient-to-r from-${color}-50 to-white border border-${color}-100 hover:shadow-sm transition`}
      onClick={() => toggleSection(section)}
    >
      <h3 className={`text-xl font-bold flex items-center gap-2 text-${color}-900`}>
        <Icon size={22} /> {title}
      </h3>
      {expandedSections[section] ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b-2 border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-blue-900">
            <Navigation size={28} />
            Navbar Configuration
          </h2>
          <div className="flex gap-3">
            <button
              onClick={fetchConfig}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={saveConfig}
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
              Save All
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {(success || error) && (
        <div className={`mx-6 mt-4 px-6 py-4 rounded-2xl flex items-center gap-3 text-white ${success ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {success ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
          <span className="font-medium">{success || error}</span>
        </div>
      )}

      <div className="p-6 space-y-5">

        {/* ==================== Store Info ==================== */}
        <div className="space-y-3">
          <SectionHeader section="store" icon={Settings} title="Store Info" color="blue" />
          {expandedSections.store && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">اسم المتجر (عربي)</label>
                <input
                  value={config.store?.name || ''}
                  onChange={e => updateConfig('store.name', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none text-right"
                  placeholder="بازار دوحه"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Store Name (English)</label>
                <input
                  value={config.store?.nameEn || ''}
                  onChange={e => updateConfig('store.nameEn', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                  placeholder="BAZAR DOHA"
                />
              </div>
            </div>
          )}
        </div>

        {/* ==================== Announcements ==================== */}
        <div className="space-y-3">
          <SectionHeader section="announcements" icon={Megaphone} title="Announcements" color="amber" />
          {expandedSections.announcements && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-3">
              {(config.announcements || []).map((ann, index) => (
                <div key={ann.id} className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold shrink-0">
                    {index + 1}
                  </span>
                  <input
                    value={ann.text || ''}
                    onChange={e => updateAnnouncement(index, e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 outline-none text-right"
                    placeholder="نص الإعلان..."
                    dir="rtl"
                  />
                  <button
                    onClick={() => removeAnnouncement(index)}
                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <button
                onClick={addAnnouncement}
                className="flex items-center gap-2 text-amber-700 bg-amber-50 hover:bg-amber-100 px-4 py-2.5 rounded-xl font-medium transition mt-2"
              >
                <Plus size={18} /> إضافة إعلان
              </button>
            </div>
          )}
        </div>

        {/* ==================== Nav Links ==================== */}
        <div className="space-y-3">
          <SectionHeader section="navLinks" icon={Link2} title="Navigation Links" color="purple" />
          {expandedSections.navLinks && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-3">
              {(config.navLinks || []).map((link, index) => (
                <div key={link.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold shrink-0">
                    {index + 1}
                  </span>
                  <input
                    value={link.label || ''}
                    onChange={e => updateNavLink(index, 'label', e.target.value)}
                    className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-purple-400 outline-none text-right"
                    placeholder="الرابط"
                    dir="rtl"
                  />
                  <input
                    value={link.href || ''}
                    onChange={e => updateNavLink(index, 'href', e.target.value)}
                    className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-purple-400 outline-none"
                    placeholder="/path"
                    dir="ltr"
                  />
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={link.active || false}
                      onChange={e => updateNavLink(index, 'active', e.target.checked)}
                      className="w-4 h-4 accent-purple-600"
                    />
                    Active
                  </label>
                  <button
                    onClick={() => removeNavLink(index)}
                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition shrink-0"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <button
                onClick={addNavLink}
                className="flex items-center gap-2 text-purple-700 bg-purple-50 hover:bg-purple-100 px-4 py-2.5 rounded-xl font-medium transition mt-2"
              >
                <Plus size={18} /> إضافة رابط
              </button>
            </div>
          )}
        </div>

        {/* ==================== Icons (Login & Cart) ==================== */}
        <div className="space-y-3">
          <SectionHeader section="icons" icon={ShoppingCart} title="Icons (Login & Cart)" color="green" />
          {expandedSections.icons && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Login */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h4 className="font-bold mb-4 flex items-center gap-2 text-gray-700">
                  <User size={18} /> Login Icon
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-600">العنوان (title)</label>
                    <input
                      value={config.icons?.login?.title || ''}
                      onChange={e => updateConfig('icons.login.title', e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-green-400 outline-none text-right"
                      placeholder="تسجيل الدخول"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-600">الرابط (href)</label>
                    <input
                      value={config.icons?.login?.href || ''}
                      onChange={e => updateConfig('icons.login.href', e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-green-400 outline-none"
                      placeholder="/login"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* Cart */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h4 className="font-bold mb-4 flex items-center gap-2 text-gray-700">
                  <ShoppingCart size={18} /> Cart Icon
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-600">العنوان (title)</label>
                    <input
                      value={config.icons?.cart?.title || ''}
                      onChange={e => updateConfig('icons.cart.title', e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-green-400 outline-none text-right"
                      placeholder="السلة"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-600">الرابط (href)</label>
                    <input
                      value={config.icons?.cart?.href || ''}
                      onChange={e => updateConfig('icons.cart.href', e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-green-400 outline-none"
                      placeholder="/cart"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-600">عدد العناصر (itemCount)</label>
                    <input
                      type="number"
                      min="0"
                      value={config.icons?.cart?.itemCount ?? 0}
                      onChange={e => updateConfig('icons.cart.itemCount', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-green-400 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}