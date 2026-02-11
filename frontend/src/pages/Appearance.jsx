import React, { useEffect, useMemo, useRef, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { getAdminProfile, updateAdminProfile, getAdminMenu, uploadImage, updateMenuTheme } from '../api';


const MAX_MB = 5;

const PAYMENT_OPTIONS = [
  { key: 'efectivo', label: 'Efectivo' },
  { key: 'transferencia', label: 'Transferencia' },
  { key: 'mercadopago', label: 'Mercado Pago' },
  { key: 'tarjeta', label: 'Tarjeta' },
];


const Appearance = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

   // ✅ medios de pago (DELIVERY CONFIG)
  const [paymentMethods, setPaymentMethods] = useState([]); // strings
  const [paymentOther, setPaymentOther] = useState('');

  // theme persistido en backend
  const [theme, setTheme] = useState({
    primaryColor: '#2563eb',
    backgroundType: 'color', // 'color' | 'image'
    backgroundValue: '#ffffff', // color o URL si es image
    logoUrl: '',
    coverUrl: '',
    layout: 'grid', // ✅ template
  });

  // previews locales (antes de guardar)
  const [previews, setPreviews] = useState({
    logoUrl: '',
    coverUrl: '',
    backgroundValue: '', // si backgroundType === 'image'
  });

  // archivos seleccionados (para subir al guardar)
  const [files, setFiles] = useState({
    logoUrl: null,
    coverUrl: null,
    backgroundValue: null,
  });

  const [errors, setErrors] = useState({});

  const logoInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const bgInputRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const menu = await getAdminMenu();
        const t = menu?.theme || {};

        const profile = await getAdminProfile();
setPaymentMethods(Array.isArray(profile?.paymentMethods) ? profile.paymentMethods : []);


        // robusto: si el backend no trae layout, mantenemos el default
        setTheme((prev) => ({
          ...prev,
          ...t,
          layout: t.layout || prev.layout,
        }));

        // previews iniciales = urls actuales
        setPreviews({
          logoUrl: t.logoUrl || '',
          coverUrl: t.coverUrl || '',
          backgroundValue: t.backgroundType === 'image' ? (t.backgroundValue || '') : '',
        });
      } catch (e) {
        console.error('Error loading theme', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const primaryColor = theme.primaryColor || '#2563eb';

  const bgPreviewStyle = useMemo(() => {
    if (theme.backgroundType === 'image') {
      const img = previews.backgroundValue || theme.backgroundValue;
      if (img) {
        return {
          backgroundImage: `url(${img})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        };
      }
      return { backgroundColor: '#f3f4f6' };
    }
    return { backgroundColor: theme.backgroundValue || '#ffffff' };
  }, [theme.backgroundType, theme.backgroundValue, previews.backgroundValue]);

  const validateFile = (file, field) => {
    const nextErrors = { ...errors };

    if (!file) {
      delete nextErrors[field];
      setErrors(nextErrors);
      return true;
    }

    if (!file.type.startsWith('image/')) {
      nextErrors[field] = 'Elegí un archivo de imagen válido (JPG/PNG/WebP).';
      setErrors(nextErrors);
      return false;
    }

    const maxBytes = MAX_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      nextErrors[field] = `La imagen debe pesar menos de ${MAX_MB}MB.`;
      setErrors(nextErrors);
      return false;
    }

    delete nextErrors[field];
    setErrors(nextErrors);
    return true;
  };

  const setLocalPreview = (file, field) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreviews((prev) => ({ ...prev, [field]: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handlePickFile = (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file, field)) return;

    setFiles((prev) => ({ ...prev, [field]: file }));
    setLocalPreview(file, field);
  };

  const removeFile = (field) => {
    setFiles((prev) => ({ ...prev, [field]: null }));
    setPreviews((prev) => ({ ...prev, [field]: '' }));

    setTheme((prev) => {
      const next = { ...prev };
      if (field === 'backgroundValue') {
        next.backgroundValue = '';
      } else {
        next[field] = '';
      }
      return next;
    });

    const refMap = {
      logoUrl: logoInputRef,
      coverUrl: coverInputRef,
      backgroundValue: bgInputRef,
    };
    if (refMap[field]?.current) refMap[field].current.value = '';
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const nextTheme = { ...theme };

      const uploadOne = async (field) => {
        const file = files[field];
        if (!file) return;

        const uploaded = await uploadImage(file);

        const url =
          uploaded?.url ||
          uploaded?.secure_url ||
          uploaded?.imageUrl ||
          uploaded?.path ||
          (typeof uploaded === 'string' ? uploaded : '');

        if (!url) throw new Error(`Upload no devolvió URL para ${field}`);

        if (field === 'backgroundValue') {
          nextTheme.backgroundType = 'image';
          nextTheme.backgroundValue = url;
        } else {
          nextTheme[field] = url;
        }
      };

      await Promise.all([uploadOne('logoUrl'), uploadOne('coverUrl'), uploadOne('backgroundValue')]);

      await updateMenuTheme(nextTheme);

      setTheme(nextTheme);
      setFiles({ logoUrl: null, coverUrl: null, backgroundValue: null });

      setPreviews({
        logoUrl: nextTheme.logoUrl || '',
        coverUrl: nextTheme.coverUrl || '',
        backgroundValue: nextTheme.backgroundType === 'image' ? (nextTheme.backgroundValue || '') : '',
      });

      const cleaned = [
  ...paymentMethods,
  paymentOther.trim(),
].filter(Boolean);

// opcional: evitar duplicados (por si “Otro” coincide)
const unique = Array.from(new Set(cleaned.map((x) => x.toLowerCase().trim())));

await updateAdminProfile({ paymentMethods: unique });

// refresco local
setPaymentMethods(unique);
setPaymentOther("");


      alert('Apariencia guardada ✅');
    } catch (e) {
      console.error('Save theme error', e);
      alert('No se pudo guardar la apariencia');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando apariencia...</span>
        </div>
      </AdminLayout>
    );
  }

  const logoShown = previews.logoUrl || theme.logoUrl;
  const coverShown = previews.coverUrl || theme.coverUrl;
  const bgShown = theme.backgroundType === 'image' ? (previews.backgroundValue || theme.backgroundValue) : '';

  const HasUnsaved = !!files.logoUrl || !!files.coverUrl || !!files.backgroundValue;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Apariencia</h1>
            <p className="mt-2 text-gray-600">Personalizá tu menú: colores, fondo, logo, portada y estructura.</p>
            {HasUnsaved && (
              <p className="mt-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 inline-flex px-3 py-1 rounded-full">
                Tenés cambios sin guardar
              </p>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="sm:w-auto w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2.5 px-5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Guardando...
              </div>
            ) : (
              'Guardar cambios'
            )}
          </button>
        </div>

        {/* Preview Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Vista previa</h2>
            <div className="text-xs text-gray-500">
              Color principal: <span className="font-mono">{primaryColor}</span>
            </div>
          </div>

          <div className="p-6">
            <div className="rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-6 min-h-[180px]" style={bgPreviewStyle}>
                <div className="flex items-center gap-3">
                  {logoShown ? (
                    <img
                      src={logoShown}
                      alt="Logo"
                      className="h-10 w-auto object-contain bg-white/80 backdrop-blur rounded-md p-1 border border-white/40"
                    />
                  ) : (
                    <div className="h-10 px-3 rounded-md bg-white/80 backdrop-blur flex items-center text-sm text-gray-700 border border-white/40">
                      Logo
                    </div>
                  )}

                  <div className="ml-auto flex items-center gap-2">
                    <span className="hidden sm:inline text-xs text-gray-700 bg-white/80 rounded-full px-3 py-1 border border-white/40">
                      Demo
                    </span>
                    <button
                      type="button"
                      className="text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Botón
                    </button>
                  </div>
                </div>

                {coverShown && (
                  <img
                    src={coverShown}
                    alt="Portada"
                    className="mt-4 w-full h-28 sm:h-36 object-cover rounded-xl border border-white/60 shadow-sm"
                  />
                )}
              </div>
            </div>

            {theme.backgroundType === 'image' && !bgShown && (
              <p className="mt-3 text-sm text-gray-600">
                Elegiste fondo con imagen, pero todavía no cargaste ninguna.
              </p>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Estilo</h3>

            {/* Primary color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color principal</label>
              <div className="grid grid-cols-[auto,1fr] sm:grid-cols-[auto,160px,1fr] gap-3 items-center">
                <input
                  type="color"
                  value={theme.primaryColor}
                  onChange={(e) => setTheme((prev) => ({ ...prev, primaryColor: e.target.value }))}
                  className="h-10 w-12 rounded border border-gray-300"
                />
                <input
                  type="text"
                  value={theme.primaryColor}
                  onChange={(e) => setTheme((prev) => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-full px-4 py-3 border rounded-lg border-gray-300"
                  placeholder="#00a7c4"
                />
                <p className="text-xs text-gray-500 sm:text-right">Tip: usá un color bien contrastado.</p>
              </div>
            </div>

            {/* ✅ Template selector (SIEMPRE visible) */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-3">Estructura del menú</h3>

              <label className="block text-sm text-gray-700 mb-2">Template</label>

              <select
                value={theme.layout || 'grid'}
                onChange={(e) => setTheme((prev) => ({ ...prev, layout: e.target.value }))}
                className="w-full px-4 py-3 border rounded-lg border-gray-300 bg-white"
              >
                <option value="grid">Tarjetas (grid)</option>
                <option value="list">Lista horizontal</option>
                <option value="accordion">Acordeón por categoría</option>
                <option value="classic">Carta Minimalista</option>
                <option value="ultra-elegant">Carta Elegante</option>
                <option value="cafe-typewriter">Carta tipo café Literario</option>
                <option value="cafe-relax">Lista con fotos y sin filtro</option>
                <option value="visual">Visual (fotos grandes)</option>
              </select>

              <p className="text-xs text-gray-500 mt-2">Las opciones carta no muestras fotos. Cuidado con el contraste de colores, puede ser que un elemento no se vea.</p>
            </div>

            {/* Background */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fondo</label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <select
                    value={theme.backgroundType}
                    onChange={(e) => {
                      const v = e.target.value;
                      setTheme((prev) => ({
                        ...prev,
                        backgroundType: v,
                        backgroundValue: v === 'color' ? (prev.backgroundValue || '#ffffff') : (prev.backgroundValue || ''),
                      }));

                      if (v === 'color') {
                        setFiles((prev) => ({ ...prev, backgroundValue: null }));
                        setPreviews((prev) => ({ ...prev, backgroundValue: '' }));
                        if (bgInputRef.current) bgInputRef.current.value = '';
                      }
                    }}
                    className="w-full px-4 py-3 border rounded-lg border-gray-300 bg-white"
                  >
                    <option value="color">Color</option>
                    <option value="image">Imagen</option>
                  </select>
                </div>

                <div className="min-w-0">
                  {theme.backgroundType === 'color' ? (
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="color"
                        value={theme.backgroundValue || '#ffffff'}
                        onChange={(e) => setTheme((prev) => ({ ...prev, backgroundValue: e.target.value }))}
                        className="h-10 w-12 shrink-0 rounded border border-gray-300"
                      />
                      <input
                        type="text"
                        value={theme.backgroundValue}
                        onChange={(e) => setTheme((prev) => ({ ...prev, backgroundValue: e.target.value }))}
                        className="min-w-0 flex-1 px-4 py-3 border rounded-lg border-gray-300"
                        placeholder="#ffffff"
                      />
                    </div>
                  ) : (
                    <div className="min-w-0">
                      <input
                        type="text"
                        value={theme.backgroundValue}
                        onChange={(e) => setTheme((prev) => ({ ...prev, backgroundValue: e.target.value }))}
                        className="w-full min-w-0 px-4 py-3 border rounded-lg border-gray-300"
                        placeholder="URL (opcional) o subí una imagen abajo"
                      />
                      {errors.backgroundValue && <p className="text-sm text-red-600 mt-2">{errors.backgroundValue}</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* Background upload only if image */}
              {theme.backgroundType === 'image' && (
                <div className="mt-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <div className="mt-3">
                      <label className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-500 font-medium">Subir imagen de fondo</span>
                        <span className="text-gray-500"> (se guarda al apretar Guardar)</span>
                        <input
                          ref={bgInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePickFile(e, 'backgroundValue')}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">JPG/PNG/WebP hasta {MAX_MB}MB</p>
                    </div>
                  </div>

                  {(previews.backgroundValue || theme.backgroundValue) && (
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-xs text-gray-600 truncate">
                        {files.backgroundValue ? 'Nueva imagen lista para guardar ✅' : 'Imagen actual'}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeFile('backgroundValue')}
                        className="text-xs px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                      >
                        Quitar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Marca</h3>

            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>

              <div className="grid grid-cols-1 sm:grid-cols-[140px,1fr] gap-4 items-start">
                <div className="rounded-lg border border-gray-200 bg-gray-50 h-[88px] flex items-center justify-center overflow-hidden">
                  {logoShown ? (
                    <img src={logoShown} alt="Logo" className="h-full w-full object-contain p-2" />
                  ) : (
                    <span className="text-xs text-gray-400">Sin logo</span>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-5 hover:border-blue-400 transition-colors">
                    <label className="cursor-pointer block text-center">
                      <span className="text-blue-600 hover:text-blue-500 font-medium">Subir logo</span>
                      <span className="text-gray-500"> (se guarda al apretar Guardar)</span>
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePickFile(e, 'logoUrl')}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2 text-center">Recomendado: PNG con fondo transparente</p>
                    {errors.logoUrl && <p className="text-sm text-red-600 mt-2 text-center">{errors.logoUrl}</p>}
                  </div>

                  {logoShown && (
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-gray-600 truncate">
                        {files.logoUrl ? 'Nuevo logo listo para guardar ✅' : 'Logo actual'}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeFile('logoUrl')}
                        className="text-xs px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                      >
                        Quitar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cover */}
            <div className="pt-4 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">Portada</label>

              <div className="space-y-3">
                <div className="rounded-lg border border-gray-200 bg-gray-50 h-[140px] overflow-hidden flex items-center justify-center">
                  {coverShown ? (
                    <img src={coverShown} alt="Portada" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs text-gray-400">Sin portada</span>
                  )}
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-5 hover:border-blue-400 transition-colors">
                  <label className="cursor-pointer block text-center">
                    <span className="text-blue-600 hover:text-blue-500 font-medium">Subir portada</span>
                    <span className="text-gray-500"> (se guarda al apretar Guardar)</span>
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePickFile(e, 'coverUrl')}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2 text-center">Recomendado: 1200x600 o similar</p>
                  {errors.coverUrl && <p className="text-sm text-red-600 mt-2 text-center">{errors.coverUrl}</p>}
                </div>

                {coverShown && (
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-gray-600 truncate">
                      {files.coverUrl ? 'Nueva portada lista para guardar ✅' : 'Portada actual'}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeFile('coverUrl')}
                      className="text-xs px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                    >
                      Quitar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ✅ Configuración delivery */}
<div className="bg-white rounded-2xl border border-gray-100 p-5">
  <h3 className="font-bold text-gray-900 mb-1">Configuración delivery</h3>
  <p className="text-xs text-gray-500 mb-4">
    Elegí los medios de pago que van a aparecer al cliente.
  </p>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {PAYMENT_OPTIONS.map((opt) => {
      const checked = paymentMethods.includes(opt.key);
      return (
        <label key={opt.key} className="flex items-center gap-3 border rounded-lg px-3 py-2">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => {
              const on = e.target.checked;
              setPaymentMethods((prev) =>
                on ? [...prev, opt.key] : prev.filter((x) => x !== opt.key)
              );
            }}
          />
          <span className="text-sm text-gray-800">{opt.label}</span>
        </label>
      );
    })}
  </div>

  <div className="mt-3">
    <label className="block text-sm font-medium text-gray-700 mb-2">Otro (opcional)</label>
    <input
      value={paymentOther}
      onChange={(e) => setPaymentOther(e.target.value)}
      className="w-full px-4 py-3 border rounded-lg border-gray-300"
      placeholder="Ej: Débito, MODO, QR, etc."
    />
    <p className="text-xs text-gray-500 mt-2">
      Tip: si lo completás, lo vamos a guardar como un método más.
    </p>
  </div>
</div>


            {/* Bottom save (mobile friendly) */}
            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2.5 px-5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <p className="mt-2 text-xs text-gray-500 text-center">
                Las imágenes se suben y se guardan cuando tocás “Guardar cambios”.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Appearance;
