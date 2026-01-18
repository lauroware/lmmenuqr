import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { getMenuItems, getAdminMenu } from '../api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    categories: 0,
    totalViews: 0,
    lastUpdated: null
  });
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [menuItems, adminMenu] = await Promise.all([
        getMenuItems().catch(() => []),
        getAdminMenu().catch(() => null)
      ]);

      const categories = new Set(menuItems.map(item => item.category)).size;

      setStats({
        totalItems: menuItems.length,
        categories,
        totalViews: adminMenu?.views || 0,
        lastUpdated: adminMenu?.updatedAt
          ? new Date(adminMenu.updatedAt).toLocaleDateString()
          : 'Nunca'
      });

      setRecentItems(menuItems.slice(0, 5));
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
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel</h1>
          <p className="mt-2 text-gray-600">
            ¡Bienvenido de nuevo! Acá tenés un resumen del rendimiento de tu menú digital.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Stat title="Total de ítems" value={stats.totalItems} />
          <Stat title="Categorías" value={stats.categories} />
          <Stat title="Vistas" value={stats.totalViews} />
          <Stat title="Última actualización" value={stats.lastUpdated} />
        </div>

        {/* Ítems recientes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Ítems recientes</h2>
            <Link to="/admin/menu" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Ver todos →
            </Link>
          </div>

          {recentItems.length > 0 ? (
            <>
              {/* ================= MOBILE CARDS ================= */}
              <div className="space-y-3 sm:hidden">
                {recentItems.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm"
                  >
                    <div className="flex items-start">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-12 w-12 rounded-lg object-cover mr-3 flex-shrink-0"
                        />
                      )}

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {item.name}
                          </h3>
                          <span className="text-sm font-semibold text-gray-900 ml-2">
                            ${item.price}
                          </span>
                        </div>

                        {item.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                            {item.category}
                          </span>

                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs ${
                              item.available
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.available ? 'Disponible' : 'No disponible'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ================= DESKTOP TABLE ================= */}
              <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Ítem
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Categoría
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Precio
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentItems.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              {item.image && (
                                <img
                                  className="h-10 w-10 rounded-lg object-cover mr-3"
                                  src={item.image}
                                  alt={item.name}
                                />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {item.name}
                                </div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {item.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                              {item.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            ${item.price}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs ${
                                item.available
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {item.available ? 'Disponible' : 'No disponible'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              No hay ítems todavía
            </div>
          )}
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
