import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { getAdminProfile, getAdminMenu, regenerateMenuLink, getQRCode } from '../api';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    restaurantName: '',
    phone: '',
    uniqueId: '',
    menuUrl: '',
    views: 0,
    createdAt: null
  });
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      const [userProfile, adminMenu] = await Promise.all([
        getAdminProfile().catch(err => {
          console.error('Error al obtener el perfil del admin:', err);
          return null;
        }),
        getAdminMenu().catch(err => {
           console.error('Error al obtener el menú del admin:', err);
           return null;
        })
      ]);

      if (userProfile) {
        let uniqueId = '';
        let menuUrl = '';
        
        if (adminMenu) {
            uniqueId = adminMenu.uniqueId;
            menuUrl = `${window.location.origin}/menu/${uniqueId}`;
            generateQRCode(uniqueId);
        }

        setProfile({
          name: userProfile.name,
          email: userProfile.email,
          restaurantName: userProfile.restaurantName,
          phone: userProfile.phone,
          createdAt: userProfile.createdAt,
          uniqueId: uniqueId,
          menuUrl: menuUrl,
          views: 0 // Todavía no implementado en el backend
        });
      }

    } catch (error) {
      console.error('Error al obtener los datos del perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (uniqueId) => {
    if (!uniqueId) return;
    try {
      const response = await getQRCode(uniqueId);
      // El backend ahora devuelve { qrCode: "data:image/png..." }
      setQrCode(response.qrCode);
    } catch (error) {
      // Alternativa si falla el backend, aunque se prefiere el backend
      console.error('Error al obtener el código QR desde el backend:', error);
      const url = `${window.location.origin}/menu/${uniqueId}`;
      setQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`);
    }
  };

  const handleRegenerateLink = async () => {
    try {
      setRegenerating(true);
      
      const updatedMenu = await regenerateMenuLink();
      
      const newUniqueId = updatedMenu.uniqueId;
      const newMenuUrl = `${window.location.origin}/menu/${newUniqueId}`;
      
      setProfile(prev => ({
        ...prev,
        uniqueId: newUniqueId,
        menuUrl: newMenuUrl
      }));
      
      // Generar nuevo código QR
      generateQRCode(newUniqueId);
      
      setShowRegenerateConfirm(false);
    } catch (error) {
      console.error('Error al regenerar el link:', error);
      alert('No se pudo regenerar el link. Por favor, intentá de nuevo.');
    } finally {
      setRegenerating(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('¡Copiado al portapapeles!');
    } catch (error) {
      console.error('No se pudo copiar:', error);
    }
  };

  const downloadQRCode = () => {
    if (!qrCode) return;
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `menu-qr-${profile.uniqueId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando perfil...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Perfil y Código QR</h1>
          <p className="mt-2 text-gray-600">
            Administrá el perfil de tu restaurante y accedé al código QR de tu menú digital.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">Información del restaurante</h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre del restaurante</label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{profile.restaurantName || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre del administrador</label>
                  <p className="mt-1 text-lg text-gray-900">{profile.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
                  <p className="mt-1 text-lg text-gray-900">{profile.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Número de teléfono</label>
                  <p className="mt-1 text-lg text-gray-900">{profile.phone}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Miembro desde</label>
                <p className="mt-1 text-lg text-gray-900">
  {profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'N/A'}
</p>
 </div>
              </div>
            </div>

            {/* Menu Statistics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">Estadísticas del menú</h2>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{profile.views}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{profile.uniqueId ? profile.uniqueId.length : 0}</p>
                    <p className="text-sm text-gray-600">Longitud del link</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code and Menu Link */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">Acceso al menú digital</h2>
              </div>
              <div className="px-6 py-4 space-y-6">
                {/* Unique Menu URL */}
                {profile.uniqueId ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL de tu menú</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={profile.menuUrl}
                      readOnly
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 flex-1 border-gray-300"
                    />
                    <button
                      onClick={() => copyToClipboard(profile.menuUrl)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg transition-all duration-200 border border-gray-300"
                      title="Copiar URL"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                ) : (
                    <div className="text-center p-4 bg-yellow-50 rounded-lg text-yellow-800">
                        <p>Todavía no se creó ningún menú. Andá a Administrar menú para crear uno.</p>
                    </div>
                )}

                {/* QR Code */}
                {profile.uniqueId && (
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-700 mb-4">Código QR</label>
                  {qrCode ? (
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <img
                          src={qrCode}
                          alt="Código QR del menú"
                          className="border border-gray-200 rounded-lg max-w-[200px]"
                        />
                      </div>
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={downloadQRCode}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Descargar código QR
                        </button>
                        <button
                          onClick={() => copyToClipboard(profile.menuUrl)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-all duration-200 border border-gray-300"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copiar URL
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
                )}

                {/* Regenerate Link */}
                {profile.uniqueId && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Necesitas que te imprimamos el QR</h3>
                      <p className="text-sm text-gray-600">
                        Podemos brindarte el QR impreso en un porta QR. No dudes en contactarnos.
                      </p>
                    </div>
              
                  </div>
                </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="rounded-xl border border-blue-200 bg-blue-50">
              <div className="px-6 py-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Cómo usar tu código QR</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>• Imprimí el código QR y ponelo en tus mesas</li>
                  <li>• Tus clientes pueden escanearlo con la cámara del celular</li>
                  <li>• Van a ir directo a tu menú digital</li>
                  <li>• No hace falta bajar ninguna app: funciona con cualquier smartphone</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Regenerate Confirmation Modal */}
        {showRegenerateConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 max-w-md w-full mx-4">
              <div className="px-6 py-4 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Regenerar el link del menú?</h3>
                <p className="text-gray-600 mb-6">
                  Esto va a crear una nueva URL única para tu menú. Los códigos QR y links actuales van a dejar de funcionar.
                  ¿Seguro que querés continuar?
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowRegenerateConfirm(false)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-all duration-200 border border-gray-300 flex-1"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleRegenerateLink}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex-1"
                    disabled={regenerating}
                  >
                    {regenerating ? 'Regenerando...' : 'Sí, regenerar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Profile;
