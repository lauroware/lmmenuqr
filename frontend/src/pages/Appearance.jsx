import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { getAdminMenu, uploadImage, updateMenuTheme } from '../api';

const Appearance = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [theme, setTheme] = useState({
    primaryColor: '#2563eb',
    backgroundType: 'color', // color | image
    backgroundValue: '#ffffff',
    logoUrl: '',
    coverUrl: '',
  });

  useEffect(() => {
    (async () => {
      try {
        const menu = await getAdminMenu();
        const t = menu?.theme || {};
        setTheme(prev => ({
          ...prev,
          ...t,
        }));
      } catch (e) {
        console.error('Error loading theme', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleUpload = async (file, field) => {
    if (!file) return;
    try {
      setSaving(true);
      const uploaded = await uploadImage(file); // devuelve { url } o algo similar
      const url = uploaded?.url || uploaded?.imageUrl || uploaded?.path || uploaded; // por si tu backend devuelve distinto
      if (!url) throw new Error('Upload no devolvió URL');

      const next = { ...theme, [field]: url };
      setTheme(next);

      await updateMenuTheme({ [field]: url });
      alert('Guardado ✅');
    } catch (e) {
      console.error('Upload error', e);
      alert('No se pudo subir la imagen');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateMenuTheme(theme);
      alert('Apariencia guardada ✅');
    } catch (e) {
      console.error('Save theme error', e);
      alert('No se pudo guardar la apariencia');
    } finally {
      setSaving(false);
    }
  };

  const bgPreviewStyle =
    theme.backgroundType === 'image' && theme.backgroundValue
      ? {
          backgroundImage: `url(${theme.backgroundValue})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      : {
          backgroundColor: theme.backgroundValue || '#ffffff',
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Apariencia</h1>
          <p className="mt-2 text-gray-600">Personalizá tu menú: colores, fondo, logo y portada.</p>
        </div>

        {/* Preview */}
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div
            className="p-6 min-h-[180px]"
            style={{ ...bgPreviewStyle, '--primary': theme.primaryColor }}
          >
            <div className="flex items-center gap-3">
              {theme.logoUrl ? (
                <img src={theme.logoUrl} alt="Logo" className="h-10 w-auto bg-white/70 rounded-md p-1" />
              ) : (
                <div className="h-10 px-3 rounded-md bg-white/70 flex items-center text-sm text-gray-700">
                  Logo
                </div>
              )}

              <div className="ml-auto">
                <button
                  type="button"
                  className="text-white text-sm font-medium px-4 py-2 rounded-lg"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  Botón demo
                </button>
              </div>
            </div>

            {theme.coverUrl && (
              <img
                src={theme.coverUrl}
                alt="Portada"
                className="mt-4 w-full h-28 object-cover rounded-xl"
              />
            )}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          {/* Primary color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color principal</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={theme.primaryColor}
                onChange={(e) => setTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="h-10 w-12 rounded border border-gray-300"
              />
              <input
                type="text"
                value={theme.primaryColor}
                onChange={(e) => setTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="w-40 px-3 py-2 border rounded-lg border-gray-300"
                placeholder="#00a7c4"
              />
              <span className="text-xs text-gray-500">Ej: #00a7c4</span>
            </div>
          </div>

          {/* Background type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fondo</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <select
                  value={theme.backgroundType}
                  onChange={(e) => setTheme(prev => ({ ...prev, backgroundType: e.target.value }))}
                  className="w-full px-4 py-3 border rounded-lg border-gray-300 bg-white"
                >
                  <option value="color">Color</option>
                  <option value="image">Imagen</option>
                </select>
              </div>

              {theme.backgroundType === 'color' ? (
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={theme.backgroundValue || '#ffffff'}
                    onChange={(e) => setTheme(prev => ({ ...prev, backgroundValue: e.target.value }))}
                    className="h-10 w-12 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={theme.backgroundValue}
                    onChange={(e) => setTheme(prev => ({ ...prev, backgroundValue: e.target.value }))}
                    className="flex-1 px-3 py-2 border rounded-lg border-gray-300"
                    placeholder="#ffffff"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={theme.backgroundValue}
                    onChange={(e) => setTheme(prev => ({ ...prev, backgroundValue: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg border-gray-300"
                    placeholder="URL de imagen de fondo (opcional)"
                  />
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUpload(e.target.files?.[0], 'backgroundValue')}
                    />
                    <span className="text-xs text-gray-500">Subir imagen de fondo</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
            <div className="flex items-center gap-4">
              {theme.logoUrl ? (
                <img src={theme.logoUrl} alt="Logo" className="h-12 w-auto rounded-md border border-gray-200" />
              ) : (
                <div className="h-12 w-24 rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center text-xs text-gray-400">
                  Sin logo
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleUpload(e.target.files?.[0], 'logoUrl')}
              />
            </div>
          </div>

          {/* Cover */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Imagen de portada</label>
            <div className="flex items-center gap-4">
              {theme.coverUrl ? (
                <img src={theme.coverUrl} alt="Portada" className="h-12 w-28 object-cover rounded-md border border-gray-200" />
              ) : (
                <div className="h-12 w-28 rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center text-xs text-gray-400">
                  Sin portada
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleUpload(e.target.files?.[0], 'coverUrl')}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Appearance;
