import React, { useEffect, useState } from 'react';
import { getAdmins, toggleAdminStatus, activateMembership } from '../api';

const STATUS_CONFIG = {
  active:  { label: 'Activo',      bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500'  },
  trial:   { label: 'En prueba',   bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500'   },
  expired: { label: 'Vencido',     bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500'    },
  blocked: { label: 'Bloqueado',   bg: 'bg-gray-100',   text: 'text-gray-600',   dot: 'bg-gray-400'   },
};
   
const Badge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.blocked;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}/>
      {cfg.label}
    </span>
  );
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

const SuperAdmin = () => {
  const [admins, setAdmins]   = useState([]);
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(null);
  const [buscar, setBuscar]   = useState('');

  const fetchAdmins = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await getAdmins();
      setAdmins(data);
    } catch (e) {
      console.error(e);
      setError('No se pudo cargar la lista de clientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleToggle = async (id, currentStatus) => {
    await toggleAdminStatus(id, !currentStatus);
    fetchAdmins();
  };

  const handleActivate = async (id) => {
  setActivating(id);
  try {
    await activateMembership(id);
    fetchAdmins();
  } catch {
    alert('Error al activar membresía');
  } finally {
    setActivating(null);
  }
};

  const filtrados = admins.filter((a) => {
    const q = buscar.toLowerCase();
    return (
      a.restaurantName?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.name?.toLowerCase().includes(q)
    );
  });

  const totales = {
    total:   admins.length,
    active:  admins.filter(a => a.membershipStatus === 'active').length,
    trial:   admins.filter(a => a.membershipStatus === 'trial').length,
    expired: admins.filter(a => a.membershipStatus === 'expired').length,
    blocked: admins.filter(a => a.membershipStatus === 'blocked').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de clientes</h1>
          <p className="text-gray-500 mt-1">Gestión de cuentas y membresías</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total',     value: totales.total,   color: 'text-gray-900' },
            { label: 'Activos',   value: totales.active,  color: 'text-green-600' },
            { label: 'En prueba', value: totales.trial,   color: 'text-blue-600' },
            { label: 'Vencidos',  value: totales.expired, color: 'text-red-600' },
            { label: 'Bloqueados',value: totales.blocked, color: 'text-gray-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Buscador */}
        <div className="mb-4">
          <input
            type="text"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            placeholder="Buscar por nombre, email o restaurante..."
            className="w-full sm:max-w-sm border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Error */}
        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

        {/* Tabla */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mr-2"/>
              Cargando...
            </div>
          ) : filtrados.length === 0 ? (
            <div className="py-16 text-center text-gray-400">Sin resultados</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Comercio', 'Email', 'Teléfono', 'Estado', 'Trial / Membresía', 'Acciones'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtrados.map((admin) => (
                    <tr key={admin._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{admin.restaurantName}</p>
                        <p className="text-xs text-gray-400">{admin.name}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{admin.email}</td>
                      <td className="px-4 py-3 text-gray-600">{admin.phone}</td>
                      <td className="px-4 py-3">
                        <Badge status={admin.membershipStatus} />
                        {admin.membershipStatus === 'trial' && admin.trialDaysLeft <= 7 && (
                          <p className="text-xs text-orange-500 mt-1">{admin.trialDaysLeft}d restantes</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {admin.membershipStatus === 'trial' && (
                          <span>Trial hasta {formatDate(admin.trialEndsAt)}</span>
                        )}
                        {admin.membershipStatus === 'active' && (
                          <span className="text-green-600">Pago hasta {formatDate(admin.membershipPaidUntil)}</span>
                        )}
                        {admin.membershipStatus === 'expired' && (
                          <span className="text-red-500">Venció el {formatDate(admin.trialEndsAt || admin.membershipPaidUntil)}</span>
                        )}
                        {admin.membershipStatus === 'blocked' && (
                          <span>Bloqueado manualmente</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Activar membresía — siempre disponible */}
                          <button
                            onClick={() => handleActivate(admin._id)}
                            disabled={activating === admin._id}
                            className="text-xs px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium transition-colors"
                          >
                            {activating === admin._id ? '...' : '✅ Activar membresía'}
                          </button>

                          {/* Toggle activo/bloqueado */}
                          <button
                            onClick={() => handleToggle(admin._id, admin.isActive)}
                            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                              admin.isActive
                                ? 'bg-red-100 hover:bg-red-200 text-red-700'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                          >
                            {admin.isActive ? 'Bloquear' : 'Desbloquear'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
//lauro 


export default SuperAdmin;
