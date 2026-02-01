import React, { useState, useEffect } from 'react';
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

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const items = await getMenuItems();
      setMenuItems(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error('Error al obtener ítems del menú:', error);
      if (error.response?.status === 404) setHasMenu(false;
      );
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const checkAdminMenu = async () => {
    try {
      await getAdminMenu();
      setHasMenu(true);
    } catch (error) {
      if (error.response?.status === 404) setHasMenu(false);
      else console.error('Error al verificar el menú del administrador:', error);
    }
  };

  useEffect(() => {
    (async () => {
      await checkAdminMenu();
      await fetchMenuItems();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      let imageUrl = formData.image || '';

      // Subir solo si hay un archivo nuevo
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
    if (window.confirm('¿Estás seguro de que querés eliminar este ítem del menú?')) {
      try {
        await deleteMenuItem(id);
        await fetchMenuItems();
      } catch (error) {
        console.error('Error al eliminar el ítem del menú:', error);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setShowForm(false);
  };

  // ✅ ORDER PLAYLIST: sube/baja con swap de "order"
  const moveItem = async (id, direction) => {
    const arr = [...menuItems].sort(
      (a, b) =>
        (a.order ?? 0) - (b.order ?? 0) ||
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const idx = arr.findIndex((x) => x._id === id);
    if (idx === -1) return;

    const swapWith = idx + direction;
    if (swapWith < 0 || swapWith >= arr.length) return;

    const a = arr[idx];
    const b = arr[swapWith];

    const payload = [
      { _id: a._id, order: b.order ?? swapWith },
      { _id: b._id, order: a.order ?? idx },
    ];

    // Optimista
    setMenuItems((prev) =>
      prev.map((it) => {
        const p = payload.find((x) => x._id === it._id);
        return p ? { ...it, order: p.order } : it;
      })
    );

    try {
      await reorderMenuItems(payload);
      await fetchMenuItems();
    } catch (e) {
      console.error('Error reordenando:', e);
      await fetchMenuItems();
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
            <p className="mt-2 text-gray-600">
              Configurá el menú digital de tu restaurante para empezar.
            </p>
          </div>
          <CreateMenuForm onSubmit={handleCreateMenu} />
        </div>
      </AdminLayout>
    );
  }

  const sortedItems = [...menuItems].sort(
    (a, b) =>
      (a.order ?? 0) - (b.order ?? 0) ||
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Administración del menú</h1>
            <p className="mt-2 text-gray-600">
              Creá y administrá los ítems del menú de tu restaurante.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setShowForm(true);
            }}
            className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Agregar ítem
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingItem ? 'Editar ítem del menú' : 'Agregar nuevo ítem al menú'}
              </h2>
            </div>
            <div className="px-6 py-4">
              <MenuForm
                onSubmit={handleFormSubmit}
                initialData={editingItem || {}}
                onCancel={handleCancelEdit}
              />
            </div>
          </div>
        )}

        <MenuList
          items={sortedItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onMove={moveItem}
        />
      </div>
    </AdminLayout>
  );
};

export default Menu;
