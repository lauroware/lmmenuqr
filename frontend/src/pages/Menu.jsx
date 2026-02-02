import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../components/AdminLayout';
import MenuForm from '../components/MenuForm';
import MenuList from '../components/MenuList';
import CreateMenuForm from '../components/CreateMenuForm';

import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  uploadImage,
  createMenu,
  getAdminMenu,
  reorderMenuItems,
} from '../api';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [hasMenu, setHasMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [moving, setMoving] = useState(false);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const items = await getMenuItems();
      setMenuItems(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error('Error al obtener ítems del menú:', error);
      if (error.response && error.response.status === 404) {
        setHasMenu(false);
      } else {
        setMenuItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const checkAdminMenu = async () => {
    try {
      await getAdminMenu();
      setHasMenu(true);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setHasMenu(false);
      } else {
        console.error('Error al verificar el menú del administrador:', error);
      }
    }
  };

  useEffect(() => {
    (async () => {
      await checkAdminMenu();
      await fetchMenuItems();
    })();
  }, []);

  const sortedMenuItems = useMemo(() => {
    // orden estable: primero order asc, luego createdAt asc
    return [...menuItems].sort((a, b) => {
      const ao = a.order ?? 0;
      const bo = b.order ?? 0;
      if (ao !== bo) return ao - bo;

      const ad = new Date(a.createdAt || 0).getTime();
      const bd = new Date(b.createdAt || 0).getTime();
      return ad - bd;
    });
  }, [menuItems]);

  const handleCreateMenu = async (menuData) => {
    try {
      await createMenu(menuData);
      setHasMenu(true);
      await fetchMenuItems();
    } catch (error) {
      console.error('Error al crear el menú:', error);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      let imageUrl = formData.image;

      if (formData.imageFile && typeof formData.imageFile !== 'string') {
        const uploadResponse = await uploadImage(formData.imageFile);
        imageUrl = uploadResponse?.url || uploadResponse?.imageUrl || uploadResponse?.path || '';
      }

      const itemData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        image: imageUrl,
        tags: formData.tags || [],
        available: formData.available !== undefined ? formData.available : true,
      };

      if (editingItem) {
        await updateMenuItem(editingItem._id, itemData);
      } else {
        await createMenuItem(itemData);
      }

      await fetchMenuItems();
      setEditingItem(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error al guardar el ítem del menú:', error);
      console.error('Detalles del error:', error.response?.data);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que querés eliminar este ítem del menú?')) return;
    try {
      await deleteMenuItem(id);
      await fetchMenuItems();
    } catch (error) {
      console.error('Error al eliminar el ítem del menú:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setShowForm(false);
  };

  // ✅ mover arriba/abajo (swap + persist)
  const handleMove = async (id, direction) => {
    if (moving) return;
    setMoving(true);

    try {
      const arr = [...sortedMenuItems];
      const idx = arr.findIndex((x) => x._id === id);
      if (idx === -1) return;

      const swapWith = idx + direction;
      if (swapWith < 0 || swapWith >= arr.length) return;

      const a = arr[idx];
      const b = arr[swapWith];

      // definimos orders “seguros”
      const aOrder = a.order ?? idx;
      const bOrder = b.order ?? swapWith;

      const payload = [
        { _id: a._id, order: bOrder },
        { _id: b._id, order: aOrder },
      ];

      // ✅ optimista local (instantáneo)
      setMenuItems((prev) =>
        prev.map((it) => {
          const found = payload.find((p) => p._id === it._id);
          return found ? { ...it, order: found.order } : it;
        })
      );

      // ✅ backend
      await reorderMenuItems(payload);

      // ✅ recargo por si el backend normaliza algo
      await fetchMenuItems();
    } catch (e) {
      console.error('Error reordenando:', e);
      await fetchMenuItems(); // rollback “simple”
    } finally {
      setMoving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando menú...</span>
        </div>
      </AdminLayout>
    );
  }

  if (!hasMenu) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Creá tu menú</h1>
            <p className="mt-2 text-gray-600">Configurá el menú digital de tu restaurante para empezar.</p>
          </div>
          <CreateMenuForm onSubmit={handleCreateMenu} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Administración del menú</h1>
            <p className="mt-2 text-gray-600">Creá y administrá los ítems del menú de tu restaurante.</p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Agregar ítem
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingItem ? 'Editar ítem del menú' : 'Agregar nuevo ítem al menú'}
              </h2>
            </div>
            <div className="px-6 py-4">
              <MenuForm onSubmit={handleFormSubmit} initialData={editingItem || {}} onCancel={handleCancelEdit} />
            </div>
          </div>
        )}

        {/* ✅ IMPORTANTE: pasamos onMove */}
        <MenuList
          items={sortedMenuItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onMove={handleMove}
          moving={moving}
        />

        {!showForm && sortedMenuItems.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Todavía no hay ítems en el menú</h3>
            <p className="text-gray-600 mb-4">Empezá a armar tu menú agregando tu primer ítem.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 px-4 rounded-lg"
            >
              Agregar mi primer ítem
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Menu;
