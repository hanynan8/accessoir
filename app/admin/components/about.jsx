'use client';

import { useState, useEffect } from 'react';
import {
  Plus, Trash2, Save, RefreshCw, ChevronDown, ChevronUp,
  Loader, AlertCircle, CheckCircle, Info, BarChart2,
  Heart, BookOpen, Megaphone
} from 'lucide-react';

const API_BASE_URL = '/api/data';
const COLLECTION_NAME = 'about';

const DEFAULT_CONFIG = {
  page: 'about',
  hero: { title: '', subtitle: '', description: '' },
  story: { title: '', paragraphs: [] },
  stats: [],
  values: [],
  cta: { title: '', subtitle: '', buttonLabel: '', buttonHref: '/' }
};

const ICON_OPTIONS = ['shield', 'heart', 'truck', 'refresh', 'star', 'check', 'globe', 'award'];

export default function AboutAdmin() {
  const [config, setConfig] = useState(null);
  const [docId, setDocId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({
    hero: true, story: false, stats: false, values: false, cta: false
  });

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
        setConfig(DEFAULT_CONFIG);
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

  const update = (path, value) => {
    setConfig(prev => {
      const clone = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let cur = clone;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!cur[keys[i]]) cur[keys[i]] = {};
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
      return clone;
    });
  };

  const toggle = (section) => setExpanded(prev => ({ ...prev, [section]: !prev[section] }));

  if (!config) return (
    <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
      <Loader className="animate-spin mx-auto text-teal-500" size={48} />
    </div>
  );

  const SectionHeader = ({ section, icon: Icon, title, color = 'teal' }) => (
    <div onClick={() => toggle(section)}
      className={`flex justify-between items-center cursor-pointer p-5 rounded-2xl bg-gradient-to-r from-${color}-50 to-white border border-${color}-100 hover:shadow-sm transition`}>
      <h3 className={`text-xl font-bold flex items-center gap-2 text-${color}-900`}>
        <Icon size={22} /> {title}
      </h3>
      {expanded[section] ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-2xl border-2 border-teal-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b-2 border-gray-200 bg-gradient-to-r from-teal-50 to-cyan-50">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-teal-900">
            <Info size={28} /> إدارة صفحة من نحن
          </h2>
          <div className="flex gap-3">
            <button onClick={fetchConfig} disabled={loading}
              className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-xl hover:bg-teal-700 transition disabled:opacity-50">
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> تحديث
            </button>
            <button onClick={saveConfig} disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium disabled:opacity-50">
              {loading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />} حفظ الكل
            </button>
          </div>
        </div>
      </div>

      {(success || error) && (
        <div className={`mx-6 mt-4 px-6 py-4 rounded-2xl flex items-center gap-3 text-white ${success ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {success ? <CheckCircle size={22} /> : <AlertCircle size={22} />}
          <span className="font-medium">{success || error}</span>
        </div>
      )}

      <div className="p-6 space-y-5">

        {/* ====== Hero ====== */}
        <div className="space-y-3">
          <SectionHeader section="hero" icon={Megaphone} title="Hero Section" color="teal" />
          {expanded.hero && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-500">العنوان الرئيسي</label>
                  <input value={config.hero?.title || ''} onChange={e => update('hero.title', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 outline-none text-right" dir="rtl" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-500">العنوان الفرعي</label>
                  <input value={config.hero?.subtitle || ''} onChange={e => update('hero.subtitle', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 outline-none text-right" dir="rtl" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-500">الوصف</label>
                <textarea value={config.hero?.description || ''} onChange={e => update('hero.description', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 outline-none text-right resize-none" dir="rtl" rows={3} />
              </div>
            </div>
          )}
        </div>

        {/* ====== Story ====== */}
        <div className="space-y-3">
          <SectionHeader section="story" icon={BookOpen} title="قصتنا" color="teal" />
          {expanded.story && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-500">عنوان القسم</label>
                <input value={config.story?.title || ''} onChange={e => update('story.title', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 outline-none text-right" dir="rtl" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2 text-gray-500">الفقرات</label>
                <div className="space-y-2">
                  {(config.story?.paragraphs || []).map((p, i) => (
                    <div key={i} className="flex gap-2">
                      <textarea value={p} onChange={e => {
                        const arr = [...config.story.paragraphs];
                        arr[i] = e.target.value;
                        update('story.paragraphs', arr);
                      }} className="flex-1 px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-teal-400 outline-none text-right resize-none" dir="rtl" rows={2} />
                      <button onClick={() => update('story.paragraphs', config.story.paragraphs.filter((_, idx) => idx !== i))}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition self-start"><Trash2 size={16} /></button>
                    </div>
                  ))}
                  <button onClick={() => update('story.paragraphs', [...(config.story?.paragraphs || []), ''])}
                    className="flex items-center gap-1 text-teal-600 hover:bg-teal-50 px-3 py-1.5 rounded-lg text-sm transition">
                    <Plus size={15} /> إضافة فقرة
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ====== Stats ====== */}
        <div className="space-y-3">
          <SectionHeader section="stats" icon={BarChart2} title="الإحصائيات" color="teal" />
          {expanded.stats && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-3">
              {(config.stats || []).map((stat, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold shrink-0">{i + 1}</span>
                  <input value={stat.value || ''} onChange={e => {
                    const arr = [...config.stats];
                    arr[i] = { ...arr[i], value: e.target.value };
                    update('stats', arr);
                  }} className="flex-1 px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-teal-400 outline-none text-right font-bold" dir="rtl" placeholder="القيمة (مثال: +10,000)" />
                  <input value={stat.label || ''} onChange={e => {
                    const arr = [...config.stats];
                    arr[i] = { ...arr[i], label: e.target.value };
                    update('stats', arr);
                  }} className="flex-1 px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-teal-400 outline-none text-right" dir="rtl" placeholder="التسمية" />
                  <button onClick={() => update('stats', config.stats.filter((_, idx) => idx !== i))}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition"><Trash2 size={16} /></button>
                </div>
              ))}
              <button onClick={() => update('stats', [...(config.stats || []), { value: '', label: '' }])}
                className="flex items-center gap-2 text-teal-700 bg-teal-50 hover:bg-teal-100 px-4 py-2.5 rounded-xl font-medium transition">
                <Plus size={18} /> إضافة إحصائية
              </button>
            </div>
          )}
        </div>

        {/* ====== Values ====== */}
        <div className="space-y-3">
          <SectionHeader section="values" icon={Heart} title="قيمنا" color="teal" />
          {expanded.values && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-4">
              {(config.values || []).map((val, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-gray-600">قيمة #{i + 1}</span>
                    <button onClick={() => update('values', config.values.filter((_, idx) => idx !== i))}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={15} /></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-gray-500">الأيقونة</label>
                      <select value={val.icon || ''} onChange={e => {
                        const arr = [...config.values];
                        arr[i] = { ...arr[i], icon: e.target.value };
                        update('values', arr);
                      }} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-teal-400 outline-none bg-white">
                        {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-gray-500">العنوان</label>
                      <input value={val.title || ''} onChange={e => {
                        const arr = [...config.values];
                        arr[i] = { ...arr[i], title: e.target.value };
                        update('values', arr);
                      }} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-teal-400 outline-none text-right" dir="rtl" />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-xs font-semibold mb-1 text-gray-500">الوصف</label>
                      <input value={val.description || ''} onChange={e => {
                        const arr = [...config.values];
                        arr[i] = { ...arr[i], description: e.target.value };
                        update('values', arr);
                      }} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-teal-400 outline-none text-right" dir="rtl" />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => update('values', [...(config.values || []), { icon: 'heart', title: '', description: '' }])}
                className="flex items-center gap-2 text-teal-700 bg-teal-50 hover:bg-teal-100 px-4 py-2.5 rounded-xl font-medium transition">
                <Plus size={18} /> إضافة قيمة
              </button>
            </div>
          )}
        </div>

        {/* ====== CTA ====== */}
        <div className="space-y-3">
          <SectionHeader section="cta" icon={Megaphone} title="Call to Action" color="teal" />
          {expanded.cta && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-500">العنوان</label>
                <input value={config.cta?.title || ''} onChange={e => update('cta.title', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 outline-none text-right" dir="rtl" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-500">العنوان الفرعي</label>
                <input value={config.cta?.subtitle || ''} onChange={e => update('cta.subtitle', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 outline-none text-right" dir="rtl" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-500">نص الزر</label>
                <input value={config.cta?.buttonLabel || ''} onChange={e => update('cta.buttonLabel', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 outline-none text-right" dir="rtl" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-500">رابط الزر</label>
                <input value={config.cta?.buttonHref || ''} onChange={e => update('cta.buttonHref', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 outline-none" dir="ltr" placeholder="/" />
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}