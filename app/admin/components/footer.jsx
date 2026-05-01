'use client';

import { useState, useEffect } from 'react';
import {
  Plus, Trash2, Save, RefreshCw, FileText,
  ChevronDown, ChevronUp, Loader, AlertCircle, CheckCircle,
  Link2, Phone, Mail, Share2
} from 'lucide-react';

const API_BASE_URL = '/api/data';

const EMPTY_FOOTER = {
  brand:     { name: '', tagline: '' },
  links:     [],
  contact:   { email: '', phone: '' },
  social:    [],
  trust:     [],
  copyright: ''
};

// ─── مكونات مساعدة خارج FooterAdmin تمامًا عشان ما يتعمل re-mount ───

function Section({ id, isOpen, onToggle, icon: Icon, title, count, children }) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => onToggle(id)}>
        <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800">
          <Icon size={22} className="text-blue-500" />
          {title}
          {count !== undefined && (
            <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-normal">{count}</span>
          )}
        </h3>
        {isOpen ? <ChevronUp size={22} className="text-gray-400" /> : <ChevronDown size={22} className="text-gray-400" />}
      </div>
      {isOpen && <div className="mt-6">{children}</div>}
    </div>
  );
}

function FieldInput({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div>
      {label && <label className="block text-sm font-semibold text-gray-600 mb-2">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none transition-colors bg-white"
      />
    </div>
  );
}

// ─── الكومبوننت الرئيسي ───────────────────────────────────────────────

export default function FooterAdmin() {
  const [docId,   setDocId]   = useState(null);
  const [footer,  setFooter]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error,   setError]   = useState('');
  const [open, setOpen] = useState({
    brand: true, links: false, contact: false,
    social: false, trust: false, copyright: false
  });

  useEffect(() => { fetchConfig(); }, []);

  const flash = (msg, type = 'success') => {
    type === 'success' ? setSuccess(msg) : setError(msg);
    setTimeout(() => { setSuccess(''); setError(''); }, 4000);
  };

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE_URL}?collection=footer`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        const doc = data[0];
        setDocId(doc._id || null);
        const f = doc.footer || {};
        setFooter({
          brand:     { name: f.brand?.name || '', tagline: f.brand?.tagline || '' },
          links:     Array.isArray(f.links)  ? f.links  : [],
          contact:   { email: f.contact?.email || '', phone: f.contact?.phone || '' },
          social:    Array.isArray(f.social) ? f.social : [],
          trust:     Array.isArray(f.trust)  ? f.trust  : [],
          copyright: f.copyright || ''
        });
      } else {
        setDocId(null);
        setFooter({ ...EMPTY_FOOTER });
      }
    } catch (err) {
      flash('خطأ في تحميل البيانات: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!footer) return;
    setLoading(true);
    try {
      if (docId) {
        await fetch(`${API_BASE_URL}?collection=footer&id=${docId}`, { method: 'DELETE' });
      }
      const res = await fetch(`${API_BASE_URL}?collection=footer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ footer })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      flash('✅ تم الحفظ بنجاح');
      fetchConfig();
    } catch (err) {
      flash('❌ خطأ في الحفظ: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ─── helpers ──────────────────────────────────────────────────────

  const setField = (path, value) => {
    setFooter(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!cur[keys[i]]) cur[keys[i]] = {};
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const toggle = (id) => setOpen(prev => ({ ...prev, [id]: !prev[id] }));

  const addLink    = () => setFooter(p => ({ ...p, links: [...p.links, { label: '', href: '/' }] }));
  const updateLink = (i, field, val) => setFooter(p => { const l = [...p.links]; l[i] = { ...l[i], [field]: val }; return { ...p, links: l }; });
  const removeLink = (i) => setFooter(p => ({ ...p, links: p.links.filter((_, idx) => idx !== i) }));

  const addSocial    = () => setFooter(p => ({ ...p, social: [...p.social, { platform: '', href: '' }] }));
  const updateSocial = (i, field, val) => setFooter(p => { const s = [...p.social]; s[i] = { ...s[i], [field]: val }; return { ...p, social: s }; });
  const removeSocial = (i) => setFooter(p => ({ ...p, social: p.social.filter((_, idx) => idx !== i) }));

  const addTrust    = () => setFooter(p => ({ ...p, trust: [...p.trust, ''] }));
  const updateTrust = (i, val) => setFooter(p => { const t = [...p.trust]; t[i] = val; return { ...p, trust: t }; });
  const removeTrust = (i) => setFooter(p => ({ ...p, trust: p.trust.filter((_, idx) => idx !== i) }));

  // ─── render ───────────────────────────────────────────────────────

  if (!footer) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
        {loading
          ? <Loader className="animate-spin mx-auto text-blue-500" size={48} />
          : <p className="text-gray-400">لا توجد بيانات</p>}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-100 overflow-hidden">

      {/* Header */}
      <div className="p-6 border-b-2 border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-blue-900">
            <FileText size={28} />
            Footer Configuration
          </h2>
          <div className="flex gap-3">
            <button
              onClick={fetchConfig}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-60"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              تحديث
            </button>
            <button
              onClick={saveConfig}
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
              حفظ الكل
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

      <div className="p-6 space-y-6">

        {/* Brand */}
        <Section id="brand" isOpen={open.brand} onToggle={toggle} icon={FileText} title="البراند / العلامة التجارية">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FieldInput
              label="اسم الموقع"
              value={footer.brand.name}
              onChange={v => setField('brand.name', v)}
              placeholder="بازار دوحة"
            />
            <FieldInput
              label="الشعار (Tagline)"
              value={footer.brand.tagline}
              onChange={v => setField('brand.tagline', v)}
              placeholder="وجهتك الأولى للتسوق..."
            />
          </div>
        </Section>

        {/* Links */}
        <Section id="links" isOpen={open.links} onToggle={toggle} icon={Link2} title="روابط التنقل" count={footer.links.length}>
          <div className="space-y-3">
            {footer.links.map((link, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-blue-100">
                <input
                  value={link.label}
                  onChange={e => updateLink(i, 'label', e.target.value)}
                  placeholder="اسم الرابط"
                  className="w-40 px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-400 outline-none"
                />
                <input
                  value={link.href}
                  onChange={e => updateLink(i, 'href', e.target.value)}
                  placeholder="/path"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-400 outline-none"
                />
                <button onClick={() => removeLink(i)} className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button onClick={addLink} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mt-2">
              <Plus size={20} /> إضافة رابط
            </button>
          </div>
        </Section>

        {/* Contact */}
        <Section id="contact" isOpen={open.contact} onToggle={toggle} icon={Phone} title="بيانات التواصل">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Mail size={20} className="text-gray-400 shrink-0" />
              <FieldInput
                label="البريد الإلكتروني"
                value={footer.contact.email}
                onChange={v => setField('contact.email', v)}
                type="email"
                placeholder="support@example.com"
              />
            </div>
            <div className="flex items-center gap-3">
              <Phone size={20} className="text-gray-400 shrink-0" />
              <FieldInput
                label="رقم الهاتف"
                value={footer.contact.phone}
                onChange={v => setField('contact.phone', v)}
                placeholder="+974 5000 0000"
              />
            </div>
          </div>
        </Section>

        {/* Social */}
        <Section id="social" isOpen={open.social} onToggle={toggle} icon={Share2} title="السوشيال ميديا" count={footer.social.length}>
          <div className="space-y-3">
            {footer.social.map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-blue-100">
                <input
                  value={s.platform}
                  onChange={e => updateSocial(i, 'platform', e.target.value)}
                  placeholder="instagram"
                  className="w-36 px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-400 outline-none"
                />
                <input
                  value={s.href}
                  onChange={e => updateSocial(i, 'href', e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-400 outline-none"
                />
                <button onClick={() => removeSocial(i)} className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button onClick={addSocial} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mt-2">
              <Plus size={20} /> إضافة منصة
            </button>
          </div>
        </Section>

        {/* Trust */}
        <Section id="trust" isOpen={open.trust} onToggle={toggle} icon={CheckCircle} title="نقاط الثقة" count={footer.trust.length}>
          <div className="space-y-3">
            {footer.trust.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-green-100">
                <input
                  value={item}
                  onChange={e => updateTrust(i, e.target.value)}
                  placeholder="شحن سريع لجميع أنحاء قطر"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:border-green-400 outline-none"
                />
                <button onClick={() => removeTrust(i)} className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button onClick={addTrust} className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium mt-2">
              <Plus size={20} /> إضافة نقطة ثقة
            </button>
          </div>
        </Section>

        {/* Copyright */}
        <Section id="copyright" isOpen={open.copyright} onToggle={toggle} icon={FileText} title="نص حقوق النشر">
          <FieldInput
            label="Copyright"
            value={footer.copyright}
            onChange={v => setField('copyright', v)}
            placeholder="© 2025 بازار دوحة · جميع الحقوق محفوظة"
          />
        </Section>

      </div>
    </div>
  );
}