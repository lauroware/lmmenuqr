import React, { useMemo, useState } from 'react';

const PublicMenuList = ({ data }) => {
  const theme = data?.theme || {};
  const primaryColor = theme.primaryColor || '#2563eb';

  const [activeCategory, setActiveCategory] = useState('All');

  const bgStyle =
    theme.backgroundType === 'image' && theme.backgroundValue
      ? {
          backgroundImage: `url(${theme.backgroundValue})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }
      : { backgroundColor: theme.backgroundValue || '#f3f4f6' };

  const restaurantName = data?.restaurantName || 'Menú';
  const menuItems = Array.isArray(data?.menuItems) ? data.menuItems : [];

  const categories = useMemo(() => {
    const unique = [...new Set(menuItems.map(i => i.category).filter(Boolean))];
    return [...unique, 'All'];
  }, [menuItems]);

  const filteredItems =
    activeCategory === 'All'
      ? menuItems
      : menuItems.filter(i => i.category === activeCategory);

  return (
    <div className="min-h-screen" style={bgStyle}>
      {/* Header */}
      <header className="bg-white/90 backdrop-blur shadow-sm sticky top-0 z-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-center gap-3 items-center">
          {theme.logoUrl ? (
            <img src={theme.logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
          ) : (
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}22` }}
            >
              <i className="fas fa-utensils text-xl" style={{ color: primaryColor }} />
            </div>
          )}
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">{restaurantName}</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {theme.coverUrl && (
          <img
            src={theme.coverUrl}
            alt="Portada"
            className="w-full h-44 sm:h-56 object-cover rounded-2xl mb-6"
          />
        )}

        {/* Categorías */}
        <div className="flex overflow-x-auto pb-4 mb-6 gap-2">
          {categories.map(cat => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium border ${
                  active ? 'text-white' : 'bg-white text-gray-600'
                }`}
                style={active ? { backgroundColor: primaryColor } : {}}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Lista */}
        <div className="space-y-3">
          {filteredItems.map(item => (
            <div
              key={item._id}
              className={`bg-white/95 rounded-2xl border p-4 flex gap-4 ${
                !item.available ? 'opacity-45' : ''
              }`}
            >
              <div className="w-20 h-20 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <i className="fas fa-image" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                  <span className="font-bold" style={{ color: primaryColor }}>
                    ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                  </span>
                </div>

                {item.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default PublicMenuList;
