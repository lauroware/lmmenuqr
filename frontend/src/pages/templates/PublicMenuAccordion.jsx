import React, { useMemo, useState } from 'react';

const PublicMenuAccordion = ({ data }) => {
  const theme = data?.theme || {};
  const primaryColor = theme.primaryColor || '#2563eb';

  const [openCategory, setOpenCategory] = useState(null);

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

  const categories = useMemo(
    () => [...new Set(menuItems.map(i => i.category).filter(Boolean))],
    [menuItems]
  );

  const itemsByCategory = useMemo(() => {
    const map = {};
    for (const item of menuItems) {
      if (!map[item.category]) map[item.category] = [];
      map[item.category].push(item);
    }
    return map;
  }, [menuItems]);

  return (
    <div className="min-h-screen" style={bgStyle}>
      <header className="bg-white/90 backdrop-blur shadow-sm sticky top-0 z-10 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-center gap-3 items-center">
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

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-3">
        {categories.map(category => {
          const isOpen = openCategory === category;
          return (
            <div key={category} className="bg-white/95 rounded-2xl border overflow-hidden">
              <button
                onClick={() => setOpenCategory(isOpen ? null : category)}
                className="w-full px-5 py-4 flex justify-between items-center text-left"
              >
                <h2 className="font-bold text-gray-900">{category}</h2>
                <i
                  className={`fas fa-chevron-down transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  style={{ color: primaryColor }}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-4 space-y-2">
                  {itemsByCategory[category].map(item => (
                    <div
                      key={item._id}
                      className={`flex justify-between gap-3 border-t pt-3 ${
                        !item.available ? 'opacity-45' : ''
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{item.name}</p>
                        {item.description && (
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <span
                        className="font-bold whitespace-nowrap"
                        style={{ color: primaryColor }}
                      >
                        ${typeof item.price === 'number'
                          ? item.price.toFixed(2)
                          : item.price}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default PublicMenuAccordion;
