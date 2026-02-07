import React, { useMemo } from 'react';

const PublicMenuClassic = ({ data }) => {
  const theme = data?.theme || {};
  const primaryColor = theme.primaryColor || '#d6b15e'; // doradito default
  const restaurantName = data?.restaurantName || 'Menú';
  const menuItems = Array.isArray(data?.menuItems) ? data.menuItems : [];

  const bgStyle =
    theme.backgroundType === 'image' && theme.backgroundValue
      ? {
          backgroundImage: `url(${theme.backgroundValue})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }
      : { backgroundColor: theme.backgroundValue || '#0b0b0b' };

  const { categories, itemsByCategory } = useMemo(() => {
    const map = {};
    const order = [];

    for (const item of menuItems) {
      const cat = (item?.category || 'Otros').trim();
      if (!map[cat]) {
        map[cat] = [];
        order.push(cat);
      }
      map[cat].push(item);
    }

    return { categories: order, itemsByCategory: map };
  }, [menuItems]);

  const formatPrice = (price) => {
    if (price === null || price === undefined || price === '') return '—';
    if (typeof price === 'number') return price.toFixed(2);
    const n = Number(price);
    if (!Number.isNaN(n)) return n.toFixed(2);
    return String(price);
  };

  return (
    <div className="min-h-screen" style={bgStyle}>
      {/* overlay para que se lea si hay imagen */}
      <div className="min-h-screen bg-black/55">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-white/10 bg-black/60 backdrop-blur">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-center gap-3">
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
            <h1 className="text-xl md:text-2xl font-extrabold tracking-wide text-white">
              {restaurantName}
            </h1>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-8">
          {/* Cover */}
          {theme.coverUrl && (
            <div className="mb-6">
              <img
                src={theme.coverUrl}
                alt="Portada"
                className="w-full h-44 sm:h-56 object-cover rounded-2xl border border-white/10 shadow-sm"
              />
            </div>
          )}

          {/* CONTENIDO: por categorías, todo listado */}
          <div className="rounded-2xl border border-white/10 bg-black/35 backdrop-blur p-4 sm:p-6">
            {categories.length === 0 ? (
              <p className="text-center text-white/70 py-10">No hay items cargados en este menú.</p>
            ) : (
              <div className="space-y-10">
                {categories.map((category) => {
                  const items = itemsByCategory[category] || [];

                  return (
                    <section key={category}>
                      {/* Título categoría */}
                      <div className="flex items-center gap-3 mb-4">
                        <h2
                          className="text-lg sm:text-xl font-extrabold tracking-wide"
                          style={{ color: primaryColor }}
                        >
                          {category}
                        </h2>
                        <div className="flex-1 h-px bg-gradient-to-r from-white/5 via-white/20 to-transparent" />
                      </div>

                      {/* Items categoría */}
                      <div className="space-y-5">
                        {items.map((item) => (
                          <div key={item._id} className={`${!item.available ? 'opacity-45' : ''}`}>
                            {/* row: nombre .... precio */}
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <h3 className="text-base sm:text-lg font-extrabold text-white tracking-wide truncate">
                                  {item.name}
                                </h3>

                                {/* tags opcionales */}
                                {item.tags?.length > 0 && (
                                  <div className="mt-1 flex flex-wrap gap-1.5">
                                    {item.tags.slice(0, 3).map((t, idx) => (
                                      <span
                                        key={idx}
                                        className="text-[11px] px-2 py-0.5 rounded-full border border-white/15 bg-white/5 text-white/80"
                                      >
                                        {t}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="flex-shrink-0 text-right">
                                <span className="text-base sm:text-lg font-extrabold" style={{ color: primaryColor }}>
                                  ${formatPrice(item.price)}
                                </span>
                              </div>
                            </div>

                            {item.description && (
                              <p className="mt-1 text-sm text-white/70 leading-snug">
                                {item.description}
                              </p>
                            )}

                            {!item.available && (
                              <p className="mt-1 text-xs font-bold text-red-300">
                                No disponible
                              </p>
                            )}

                            {/* separador elegante */}
                            <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </div>

          <footer className="mt-10 text-center text-white/40 text-xs">
            Powered by <span className="font-semibold text-white/55">LatinNexo 2026</span>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default PublicMenuClassic;
