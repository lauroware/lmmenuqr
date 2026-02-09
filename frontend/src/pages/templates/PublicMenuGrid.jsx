import React, { useMemo, useState } from 'react';

const formatPrice = (price) => {
  if (price === null || price === undefined || price === '') return '';
  if (typeof price === 'number') return price.toFixed(2);
  const n = Number(price);
  return Number.isNaN(n) ? String(price) : n.toFixed(2);
};

const PublicMenuGrid = ({ data }) => {
  const theme = data?.theme || {};
  const primaryColor = theme.primaryColor || '#2563eb';

  const restaurantName = data?.restaurantName || 'Menú';
  const menuItems = Array.isArray(data?.menuItems) ? data.menuItems : [];

  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);

  const bgStyle =
    theme.backgroundType === 'image' && theme.backgroundValue
      ? {
          backgroundImage: `url(${theme.backgroundValue})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }
      : { backgroundColor: theme.backgroundValue || '#0b0b0b' };

  const categories = useMemo(() => {
    const unique = [...new Set(menuItems.map((i) => i.category).filter(Boolean))];
    return ['All', ...unique];
  }, [menuItems]);

  const filteredItems =
    activeCategory === 'All'
      ? menuItems
      : menuItems.filter((i) => i.category === activeCategory);

  const closeModal = () => setSelectedItem(null);

  return (
    <div className="min-h-screen" style={bgStyle}>
      {/* Overlay si hay imagen o fondo oscuro */}
      <div className="min-h-screen bg-black/35">
        {/* Header */}
        <header className="bg-black/55 backdrop-blur sticky top-0 z-20 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-center gap-3">
            {theme.logoUrl ? (
              <img src={theme.logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
            ) : (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}22` }}
              >
                <i className="fas fa-utensils text-xl" style={{ color: primaryColor }} />
              </div>
            )}
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              {restaurantName}
            </h1>
          </div>

          {/* Categorías */}
          <div className="max-w-7xl mx-auto px-4 pb-4">
            <div className="flex overflow-x-auto gap-2">
              {categories.map((cat) => {
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold border transition ${
                      active
                        ? 'text-white'
                        : 'bg-white/10 text-white/80 border-white/10 hover:bg-white/15'
                    }`}
                    style={active ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6">
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

          {/* Grid súper visual */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => {
              const price = formatPrice(item.price);
              const hasImage = !!item.image;

              return (
                <button
                  key={item._id}
                  onClick={() => setSelectedItem(item)}
                  className={`text-left rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur hover:bg-white/10 transition ${
                    !item.available ? 'opacity-45' : ''
                  }`}
                >
                  {/* Imagen protagonista (si no hay, placeholder) */}
                  <div className="relative w-full aspect-[4/3] bg-black/20">
                    {hasImage ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${primaryColor}22` }}
                        >
                          <i className="fas fa-image text-xl" style={{ color: primaryColor }} />
                        </div>
                      </div>
                    )}

                    {/* Badge no disponible */}
                    {!item.available && (
                      <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          No disponible
                        </span>
                      </div>
                    )}

                    {/* Precio arriba a la derecha */}
                    {price && (
                      <div className="absolute top-2 right-2">
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-extrabold text-white shadow-sm"
                          style={{ backgroundColor: primaryColor }}
                        >
                          ${price}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Texto mínimo */}
                  <div className="p-3">
                    <h3 className="font-extrabold text-white leading-snug whitespace-normal break-words">
                      {item.name}
                    </h3>

                    {item.description && (
                      <p className="mt-1 text-xs text-white/70 leading-snug whitespace-normal break-words">
                        {item.description}
                      </p>
                    )}

                    <div className="mt-2 flex items-center justify-between gap-2">
                      {item.category && (
                        <span className="text-[10px] text-white/70 whitespace-nowrap">
                          {item.category}
                        </span>
                      )}

                      {item.tags?.length > 0 && (
                        <span className="text-[10px] text-white/60 whitespace-nowrap">
                          {item.tags[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-white/80">
              No hay items en esta categoría.
            </div>
          )}
        </main>

        {/* Modal / Bottom sheet */}
        {selectedItem && (
          <div className="fixed inset-0 z-30">
            {/* backdrop */}
            <div
              className="absolute inset-0 bg-black/70"
              onClick={closeModal}
              role="button"
              tabIndex={0}
            />

            {/* sheet */}
            <div className="absolute inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center">
              <div className="w-full sm:w-[520px] bg-black/90 border border-white/10 backdrop-blur rounded-t-3xl sm:rounded-3xl overflow-hidden">
                {/* imagen */}
                <div className="relative w-full aspect-[4/3] bg-black/30">
                  {selectedItem.image ? (
                    <img
                      src={selectedItem.image}
                      alt={selectedItem.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: `${primaryColor}22` }}
                      >
                        <i className="fas fa-image text-2xl" style={{ color: primaryColor }} />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={closeModal}
                    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/60 border border-white/10 text-white flex items-center justify-center"
                    aria-label="Cerrar"
                  >
                    <i className="fas fa-times" />
                  </button>
                </div>

                {/* contenido */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-extrabold text-white whitespace-normal break-words flex-1 min-w-0">
                      {selectedItem.name}
                    </h2>

                    <span className="font-extrabold text-white whitespace-nowrap" style={{ color: primaryColor }}>
                      ${formatPrice(selectedItem.price)}
                    </span>
                  </div>

                  {selectedItem.description && (
                    <p className="mt-2 text-sm text-white/75 whitespace-normal break-words">
                      {selectedItem.description}
                    </p>
                  )}

                  {selectedItem.tags?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedItem.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2 py-1 rounded-full border border-white/10 bg-white/5 text-white/80"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {!selectedItem.available && (
                    <p className="mt-4 text-xs font-bold text-red-300">
                      No disponible
                    </p>
                  )}

                  <div className="mt-5">
                    <button
                      onClick={closeModal}
                      className="w-full py-3 rounded-2xl font-bold text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Volver al menú
                    </button>
                  </div>

                  <div className="mt-2 pb-[env(safe-area-inset-bottom)]" />
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-10 pb-10 text-center text-white/45 text-xs">
          Powered by <span className="font-semibold text-white/60">LatinNexo 2026</span>
        </footer>
      </div>
    </div>
  );
};

export default PublicMenuGrid;
