import React, { useState } from 'react';

const MenuList = ({ items, onEdit, onDelete, onMove }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!Array.isArray(items)) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay items para mostrar</h3>
        <p className="text-gray-600">Empezá agregando tu primer item.</p>
      </div>
    );
  }

  const categories = ['all', ...new Set(items.map((item) => item.category).filter(Boolean))];

  const filteredItems = items.filter((item) => {
    const name = (item.name || '').toLowerCase();
    const desc = (item.description || '').toLowerCase();
    const q = searchTerm.toLowerCase();

    const matchesSearch = name.includes(q) || desc.includes(q);
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const MenuItemCard = ({ item }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="p-5 flex flex-col sm:flex-row gap-4">
        {/* Image */}
        <div className="flex-shrink-0">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full sm:w-24 h-40 sm:h-24 rounded-lg object-cover border border-gray-200"
            />
          ) : (
            <div className="w-full sm:w-24 h-40 sm:h-24 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
              <span className="text-gray-400 text-sm">Sin imagen</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {item.name}
              </h3>

              <p className="text-sm text-gray-600 mt-1 line-clamp-2 break-words">
                {item.description}
              </p>

              <div className="flex flex-wrap items-center mt-3 gap-2">
                <span className="text-lg font-bold text-green-600 whitespace-nowrap">
                  ${item.price}
                </span>

                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                  {item.category}
                </span>

                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                    item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {item.available ? 'Disponible' : 'No disponible'}
                </span>
              </div>

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.map((tag, idx) => (
                    <span
                      key={`${tag}-${idx}`}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 max-w-full break-words"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                className="px-3 py-2 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium"
                title="Editar"
              >
                Editar
              </button>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDelete(item._id); }}
                className="px-3 py-2 text-red-700 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium"
                title="Eliminar"
              >
                Borrar
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onMove?.(item._id, -1); }}
                  className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  title="Subir"
                >
                  ▲
                </button>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onMove?.(item._id, +1); }}
                  className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
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
          <h2 className="text-2xl font-bold text-gray-900">Items del menú</h2>
          <p className="text-gray-600">Ordená tipo playlist y editá lo que quieras.</p>
        </div>
        <div className="text-sm text-gray-500">
          {filteredItems.length} de {items.length}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white border-gray-300"
          />
        </div>

        <div className="sm:w-52">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white border-gray-300"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'all' ? 'Todas las categorías' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      {filteredItems.length > 0 ? (
        <div className="grid gap-4">
          {filteredItems.map((item) => (
            <MenuItemCard key={item._id} item={item} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron items</h3>
          <p className="text-gray-600">
            {searchTerm || selectedCategory !== 'all'
              ? 'Probá cambiando la búsqueda o categoría.'
              : 'Agregá items para comenzar.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default MenuList;
