import React, { useState } from 'react';

const MenuList = ({ items, onEdit, onDelete, onMove, moving = false }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!Array.isArray(items)) {
    return null;
  }

  const categories = ['all', ...new Set(items.map((item) => item.category).filter(Boolean))];

  const filteredItems = items.filter((item) => {
    const name = (item.name || '').toLowerCase();
    const desc = (item.description || '').toLowerCase();
    const term = searchTerm.toLowerCase();

    const matchesSearch = name.includes(term) || desc.includes(term);
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const MenuItemCard = ({ item }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 p-5 sm:p-6">
      <div className="flex items-start gap-4">
        {/* Image */}
        <div className="flex-shrink-0">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-20 h-20 rounded-lg object-cover border border-gray-200"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-xs">Sin foto</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{item.name}</h3>

              {item.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {item.description}
                </p>
              )}

              {/* Price + badges */}
              <div className="flex flex-wrap items-center mt-3 gap-2">
                <span className="text-lg font-bold text-green-600 whitespace-nowrap">
                  ${item.price}
                </span>

                {item.category && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                    {item.category}
                  </span>
                )}

                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                    item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {item.available ? 'Disponible' : 'No disponible'}
                </span>
              </div>

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 max-w-full break-words"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(item)}
                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  ✏️
                </button>

                <button
                  onClick={() => onDelete(item._id)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  🗑️
                </button>
              </div>

              {/* Move up/down */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onMove?.(item._id, -1)}
                  disabled={moving}
                  className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                  title="Subir"
                >
                  ▲
                </button>

                <button
                  onClick={() => onMove?.(item._id, +1)}
                  disabled={moving}
                  className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                  title="Bajar"
                >
                  ▼
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Menu Items</h2>
          <p className="text-gray-600">Administrá los items de tu menú</p>
        </div>
        <div className="text-sm text-gray-500">
          {filteredItems.length} de {items.length}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 min-w-0">
          <input
            type="text"
            placeholder="Buscar item en el menú"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white border-gray-300"
          />
        </div>

        {/* Category */}
        <div className="sm:w-56">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white border-gray-300"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'all' ? 'Categorías' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Items */}
      {filteredItems.length > 0 ? (
        <div className="grid gap-6">
          {filteredItems.map((item) => (
            <MenuItemCard key={item._id} item={item} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron items</h3>
          <p className="text-gray-600">
            {searchTerm || selectedCategory !== 'all'
              ? 'Intenta ajustar el criterio de búsqueda.'
              : 'Agrega items para comenzar.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default MenuList;
