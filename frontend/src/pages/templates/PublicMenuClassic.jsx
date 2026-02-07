import React, { useMemo } from 'react';

const formatPrice = (price) => {
  if (price === null || price === undefined) return '';
  if (typeof price === 'number') return price.toFixed(2);
  return String(price);
};

const PublicMenuClassic = ({ data }) => {
  const theme = data?.theme || {};
  const primaryColor = theme.primaryColor || '#d6b15e'; // dorado default
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
      : { backgroundColor: theme.backgroundValue || '#070707' };

  // agrupado por categoría
  const grouped = useMemo(() => {
    const map = new Map();
    for (const item of menuItems) {
      const cat = item?.category || 'Otros';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(item);
    }
    return Array.from(map.entries()); // [ [category, items], ... ]
  }, [menuItems]);

  return (
    <div className="min-h-screen" style={bgStyle}>
      {/* overlay elegante */}
      <div className="min-h-screen bg-black/60">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-white/10 bg-black/55 backdrop-blur">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-center gap-3">
            {theme.logoUrl ? (
              <img
                src={theme.logoUrl}
                alt="Logo"
                className="h-10 w-auto object-contain"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}22` }}
              >
                <i className="fas fa-utensils text-xl" style={{ color: primaryColor }} />
              </div>
            )}

            <div className="text-center">
              <h1
                className="text-xl md:text-2xl font-extrabold tracking-[0.12em] text-white uppercase"
                style={{ fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' }}
              >
                {restaurantName}
              </h1>
              <div
                className="mx-auto mt-2 h-px w-28"
                style={{ background: `linear-gradient(to right, transparent, ${primaryColor}, transparent)` }}
              />
            </div>
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

          {/* Card */}
          <div className="rounded-2xl border border-white/10 bg-black/35 backdrop-blur p-5 sm:p-7">
            {grouped.map(([category, items], idx) => (
              <section key={category} className={idx === 0 ? '' : 'mt-10'}>
                {/* Título categoría */}
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <h2
                    className="text-lg sm:text-xl font-extrabold tracking-[0.08em] text-white uppercase"
                    style={{ fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' }}
                  >
                    {category}
                  </h2>
                  <div
                    className="flex-1 h-px"
                    style={{
                      background: `linear-gradient(to right, ${primaryColor}55, transparent)`,
                    }}
                  />
                </div>

                {/* Items */}
                <div className="space-y-5">
                  {items.map((item) => {
                    const price = formatPrice(item.price);
                    return (
                      <div
                        key={item._id}
                        className={`${!item.available ? 'opacity-50' : ''}`}
                      >
                        {/* fila nombre .... precio */}
                        <div className="flex items-baseline gap-3">
                          <div className="min-w-0">
                            <h3
                              className="text-[15px] sm:text-[17px] font-semibold text-white truncate"
                              style={{ fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' }}
                            >
                              {item.name}
                            </h3>
                          </div>

                          {/* dots */}
                          <div className="flex-1 border-b border-dotted border-white/20 translate-y-[-2px]" />

                          <div className="flex-shrink-0">
                            <span
                              className="text-[15px] sm:text-[17px] font-extrabold text-white"
                              style={{ textShadow: '0 1px 2px rgba(0,0,0,.6)' }}
                            >
                              {price ? `$${price}` : ''}
                            </span>
                          </div>
                        </div>

                        {/* descripción */}
                        {item.description && (
                          <p className="mt-1 text-sm text-white/70 leading-snug">
                            {item.description}
                          </p>
                        )}

                        {/* tags */}
                        {item.tags?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {item.tags.slice(0, 4).map((t, i) => (
                              <span
                                key={i}
                                className="text-[11px] px-2 py-0.5 rounded-full border border-white/15 bg-white/5 text-white/75"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}

                        {!item.available && (
                          <p className="mt-2 text-xs font-bold text-red-300">
                            No disponible
                          </p>
                        )}

                        {/* separador suave */}
                        <div
                          className="mt-4 h-px w-full"
                          style={{
                            background: `linear-gradient(to right, transparent, ${primaryColor}33, transparent)`,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}

            {menuItems.length === 0 && (
              <p className="text-center text-white/70 py-10">
                No hay items cargados en este menú.
              </p>
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
