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

  /* categorías únicas */
  const categories = useMemo(
    () => [...new Set(menuItems.map(i => i.category).filter(Boolean))],
    [menuItems]
  );

  /* items agrupados */
  const itemsByCategory = useMemo(() => {
    const map = {};
    for (const item of menuItems) {
      if (!item?.category) continue;
      if (!map[item.category]) map[item.category] = [];
      map[item.category].push(item);
    }
    return map;
  }, [menuItems]);

  return (
    <div className="min-h-screen" style={bgStyle}>
      {/* HEADER */}
      <header className="bg-white/90 backdrop-blur sticky top-0 z-10 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-center gap-3">
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
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            {restaurantName}
          </h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* PORTADA */}
        {theme.coverUrl && (
          <img
            src={theme.coverUrl}
            alt="Portada"
            className="w-full h-44 sm:h-56 object-cover rounded-2xl shadow-sm border border-white/60"
          />
        )}

        {/* ACCORDION */}
        <div className="space-y-3">
          {categories.map(category => {
            const isOpen = openCategory === category;
            const items = itemsByCategory[category] || [];

            return (
              <div
                key={category}
                className="bg-white/95 backdrop-blur rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* HEADER CATEGORIA */}
                <button
                  onClick={() => setOpenCategory(isOpen ? null : category)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left"
                >
                  <div>
                    <h2 className="font-bold text-gray-900">{category}</h2>
                    <p className="text-xs text-gray-500">
                      {items.length} item{items.length !== 1 && 's'}
                    </p>
                  </div>

                  <i
                    className={`fas fa-chevron-down transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    style={{ color: primaryColor }}
                  />
                </button>

                {/* ITEMS */}
                {isOpen && (
                  <div className="px-5 pb-4 space-y-3">
                    {items.map(item => (
                      <div
                        key={item._id}
                        className={`flex items-start justify-between gap-3 border-t pt-3 ${
                          !item.available ? 'opacity-45' : ''
                        }`}
                      >
                        {/* IZQUIERDA */}
                        <div className="flex items-start gap-3 min-w-0">
                          {/* THUMB */}
                          <div className="relative flex-shrink-0">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-gray-200">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <i className="fas fa-image text-gray-400" />
                                </div>
                              )}
                            </div>

                            {!item.available && (
                              <div className="absolute inset-0 rounded-xl bg-black/55 flex items-center justify-center">
                                <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                                  No disp.
                                </span>
                              </div>
                            )}
                          </div>

                          {/* TEXTO */}
                          <div className="min-w-0">
                       <p className="font-medium text-gray-900 whitespace-normal break-words">
  {item.name}
</p>


                            {item.description && (
                              <p className="text-sm text-gray-500 whitespace-normal break-words">
  {item.description}
</p>

                            )}

                            {item.tags && item.tags.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {item.tags.slice(0, 3).map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* PRECIO */}
                        <span
                          className="font-bold whitespace-nowrap"
                          style={{ color: primaryColor }}
                        >
                          $
                          {typeof item.price === 'number'
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
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            No hay items cargados en este menú.
          </div>
        )}
      </main>
    </div>
  );
};

export default PublicMenuAccordion;
