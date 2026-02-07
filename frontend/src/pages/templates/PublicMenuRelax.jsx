import React, { useMemo } from 'react';

const money = (v) => {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') return v.toFixed(0); // sin decimales (café style)
  return String(v);
};

const PublicMenuCafeRelax = ({ data }) => {
  const theme = data?.theme || {};
  const primaryColor = theme.primaryColor || '#2f6f61'; // verde cafecito default
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
      : { backgroundColor: theme.backgroundValue || '#f6f2ea' }; // papel cálido

  // Agrupar por categoría (y mantener orden “natural”)
  const grouped = useMemo(() => {
    const map = new Map();
    for (const item of menuItems) {
      const cat = item?.category?.trim() || 'Sin categoría';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(item);
    }
    return [...map.entries()]; // [ [cat, items], ... ]
  }, [menuItems]);

  const logoShown = theme.logoUrl || '';
  const coverShown = theme.coverUrl || '';

  return (
    <div className="min-h-screen" style={bgStyle}>
      {/* overlay suave si hay imagen */}
      <div className={`min-h-screen ${theme.backgroundType === 'image' ? 'bg-black/20' : ''}`}>
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-black/10 bg-white/80 backdrop-blur">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-center gap-3">
            {logoShown ? (
              <img src={logoShown} alt="Logo" className="h-10 w-auto object-contain" />
            ) : (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}22` }}
              >
                <i className="fas fa-mug-hot text-xl" style={{ color: primaryColor }} />
              </div>
            )}

            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-gray-900">
              {restaurantName}
            </h1>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-8">
          {/* Cover */}
          {coverShown && (
            <div className="mb-6">
              <img
                src={coverShown}
                alt="Portada"
                className="w-full h-44 sm:h-56 object-cover rounded-2xl border border-black/10 shadow-sm"
              />
            </div>
          )}

          {/* Card contenedor */}
          <div className="rounded-2xl border border-black/10 bg-white/80 backdrop-blur p-4 sm:p-6 shadow-sm">
            {grouped.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 mx-auto rounded-full bg-black/5 flex items-center justify-center mb-3">
                  <i className="fas fa-search text-gray-400 text-lg" />
                </div>
                <p className="text-gray-600">No hay items cargados en este menú.</p>
              </div>
            ) : (
              <div className="space-y-10">
                {grouped.map(([category, items]) => (
                  <section key={category}>
                    {/* Título categoría */}
                    <div className="flex items-end justify-between gap-3">
                      <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                        {category}
                      </h2>
                      <span className="text-xs text-gray-500">
                        {items.length} item{items.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div
                      className="mt-3 h-px w-full"
                      style={{
                        background: `linear-gradient(to right, transparent, ${primaryColor}55, transparent)`,
                      }}
                    />

                    {/* Lista de items */}
                    <div className="mt-4 space-y-4">
                      {items.map((item) => (
                        <div
                          key={item._id}
                          className={`rounded-xl p-3 sm:p-4 border border-black/10 bg-white/70 ${
                            !item.available ? 'opacity-45' : ''
                          }`}
                        >
                          <div className="flex gap-3">
                            {/* Foto pequeña izquierda */}
                            <div className="flex-shrink-0">
                              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-black/5 border border-black/10">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <i className="fas fa-image text-gray-300" />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Nombre + desc */}
                            <div className="min-w-0 flex-1">
                              {/* fila nombre .... precio */}
                              <div className="flex items-start justify-between gap-3">
                                <h3 className="font-extrabold text-gray-900 leading-snug truncate">
                                  {item.name}
                                </h3>

                                {/* PRECIO (acá está, bien visible) */}
                                <span
                                  className="font-extrabold whitespace-nowrap"
                                  style={{ color: primaryColor }}
                                >
                                  ${money(item.price)}
                                </span>
                              </div>

                              {item.description && (
                                <p className="mt-1 text-sm text-gray-600 leading-snug line-clamp-2">
                                  {item.description}
                                </p>
                              )}

                              {/* tags suaves */}
                              {item.tags?.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {item.tags.slice(0, 4).map((t, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[11px] px-2 py-0.5 rounded-full border border-black/10 bg-black/5 text-gray-700"
                                    >
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {!item.available && (
                                <p className="mt-2 text-xs font-bold text-red-600">
                                  No disponible
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>

          <footer className="mt-10 text-center text-gray-500 text-xs">
            Powered by <span className="font-semibold" style={{ color: primaryColor }}>LatinNexo 2026</span>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default PublicMenuCafeRelax;
