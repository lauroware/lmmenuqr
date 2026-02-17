import React, { useEffect, useState } from 'react';
import { getAdmins, toggleAdminStatus } from '../api';

const SuperAdmin = () => {
  const [admins, setAdmins] = useState([]);

  const fetchAdmins = async () => {
    const data = await getAdmins();
    setAdmins(data);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleToggle = async (id, currentStatus) => {
    await toggleAdminStatus(id, !currentStatus);
    fetchAdmins();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Clientes</h1>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Restaurante</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2">Estado</th>
            <th className="p-2">Acción</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => (
            <tr key={admin._id} className="border-t">
              <td className="p-2">{admin.restaurantName}</td>
              <td className="p-2">{admin.email}</td>
              <td className="p-2 text-center">
                {admin.isActive ? 'Activo' : 'Inactivo'}
              </td>
              <td className="p-2 text-center">
                <button
                  onClick={() =>
                    handleToggle(admin._id, admin.isActive)
                  }
                  className={`px-3 py-1 rounded text-white ${
                    admin.isActive ? 'bg-red-500' : 'bg-green-500'
                  }`}
                >
                  {admin.isActive ? 'Bloquear' : 'Activar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SuperAdmin;
