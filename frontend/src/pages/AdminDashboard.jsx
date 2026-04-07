import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { getMenuItems, getAdminMenu, getProfile } from '../api';
import MembershipBanner from '../components/MembershipBanner';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    categories: 0,
    lastUpdated: null
  });
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [membership, setMembership]   = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [menuItems, adminMenu, profile] = await Promise.all([
        getMenuItems().catch(() => []),
        getAdminMenu().catch(() => null),
        getProfile().catch(() => null),
      ]);

      const categories = new Set(menuItems.map(item => item.category)).size;

      setStats({
        totalItems:  menuItems.length,
        categories,
        lastUpdated: adminMenu?.updatedAt
          ? new Date(adminMenu.updatedAt).toLocaleDateString('es-AR', {
              day: '2-digit', month: '2-digit', year: 'numeric',
            })
          : 'Nunca'
      });

      setRecentItems(menuItems.slice(0, 5));

      if (profile) {
        setMembership({
          membershipStatus:   profile.membershipStatus,
          trialDaysLeft:      profile.trialDaysLeft,
          membershipPaidUntil: profile.membershipPaidUntil,
        });
      }
    } catch (error) {
      console.error('Error al obtener datos del panel:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando panel...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">

        {/* Banner de membresía — aparece según el estado */}
        {membership && (
          <MembershipBanner
            membershipStatus={membership.membershipStatus}
            trialDaysLeft={membership.trialDaysLeft}
            membershipPaidUntil={membership.membershipPaidUntil}
          />
        )}

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel</h1>
          <p className="mt-2 text-gray-600">
            ¡Bienvenido de nuevo! Acá tenés un resumen de tu menú digital.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Stat title="Total de ítems"  value={stats.totalItems} />
          <Stat title="Categorías"      value={stats.categories} />
          <Stat title="Última actualización" value={stats.lastUpdated} />
        </div>

        {/* Accesos rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/admin/menu"
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Gestionar menú</h3>
                <p className="text-sm text-gray-500">Agregar, editar y eliminar ítems</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/appearance"
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Apariencia</h3>
                <p className="text-sm text-gray-500">Personalizar colores y template</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Ítems recientes */}
        {recentItems.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Ítems recientes</h2>
              <Link to="/admin/menu" className="text-sm text-blue-600 hover:underline">Ver todos</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ítem</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentItems.map((item) => (
                    <tr key={item._id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img className="w-8 h-8 rounded-lg object-cover" src={item.image} alt={item.name} />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{item.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">{item.category}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">${item.price}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.available ? 'Disponible' : 'No disponible'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {recentItems.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-500">No hay ítems todavía.</p>
            <Link to="/admin/menu" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
              Agregar mi primer ítem →
            </Link>
          </div>
        )}

        {/* Tips */}
        <div className="rounded-xl border border-blue-200 p-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-start">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Consejos pro</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Agregá imágenes de buena calidad para que los ítems se vean más atractivos</li>
                <li>• Usá nombres descriptivos y descripciones detalladas</li>
                <li>• Organizá los ítems en categorías para una navegación más simple</li>
                <li>• Mantené tu menú actualizado con precios y disponibilidad</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

const Stat = ({ title, value }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

export default AdminDashboard;
