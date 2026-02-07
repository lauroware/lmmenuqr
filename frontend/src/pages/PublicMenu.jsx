import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicMenu } from '../api';

const PublicMenu = () => {
  const { uniqueId } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError(null);
        const menuData = await getPublicMenu(uniqueId);
        setData(menuData);
      } catch (err) {
        console.error('Error fetching menu:', err);
        setError('Menu not found or currently unavailable.');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [uniqueId]);

  const theme = data?.theme || {};
  const primaryColor = theme.primaryColor || '#2563eb';

  const bgStyle =
    theme.backgroundType === 'image' && theme.backgroundValue
      ? {
          backgroundImage: `url(${theme.backgroundValue})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }
      : {
          backgroundColor: theme.backgroundValue || '#f3f4f6',
        };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f3f4f6' }}>
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
          style={{ borderTopColor: primaryColor, borderBottomColor: primaryColor }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const restaurantName = data?.restaurantName || 'Menú';
  const menuItems = Array.isArray(data?.menuItems) ? data.menuItems : [];

 const uniqueCategories = [...new Set(menuItems.map((item) => item.category).filter(Boolean))];
const categories = [...uniqueCategories, 'All'];

  const filteredItems =
    activeCategory === 'All'
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory);

  return (
    <div className="min-h-screen" style={bgStyle}>
      {/* Header */}
      <header className="bg-white/90 backdrop-blur shadow-sm sticky top-0 z-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center gap-3">
            {theme.logoUrl ? (
              <img src={theme.logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
            ) : (
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}22` }}
              >
                <i className="fas fa-utensils text-xl" style={{ color: primaryColor }}></i>
              </div>
            )}

            <h1 className="text-xl md:text-2xl font-bold text-gray-900">{restaurantName}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {theme.coverUrl && (
          <div className="mb-6">
            <img
              src={theme.coverUrl}
              alt="Portada"
              className="w-full h-44 sm:h-56 object-cover rounded-2xl shadow-sm border border-white/60"
            />
          </div>
        )}

        {/* Category Filter */}
        <div className="flex overflow-x-auto pb-4 mb-6 scrollbar-hide space-x-2">
          {categories.map((category) => {
            const active = activeCategory === category;

            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-200 border ${
                  active
                    ? 'text-white shadow-md transform scale-105'
                    : 'bg-white/90 text-gray-600 hover:bg-white border-gray-200'
                }`}
                style={active ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Menu Grid */}
        {/* Menu List (image left, details center, price right) */}
<div className="space-y-3">
  {filteredItems.map((item) => (
    <div
  key={item._id}
  className={`bg-white/95 backdrop-blur rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 ${
    !item.available ? 'opacity-80' : ''
  }`}
>
      <div className="flex gap-4 p-4 sm:p-5">
        {/* Image (left) */}
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-200">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <i className="fas fa-image text-gray-400 text-xl"></i>
              </div>
            )}
          </div>

          {!item.available && (
            <div className="absolute inset-0 rounded-xl bg-black/55 flex items-center justify-center">
              <span className="bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-bold">
                No disponible
              </span>
            </div>
          )}
        </div>

        {/* Details (center) */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug line-clamp-2">
              {item.name}
            </h3>

            {/* Price (right) */}
            <div className="flex-shrink-0 text-right">
              <span className="font-extrabold text-base sm:text-lg whitespace-nowrap" style={{ color: primaryColor }}>
                $
                {typeof item.price === 'number'
                  ? item.price.toFixed(2)
                  : item.price}
              </span>
            </div>
          </div>

          {item.description && (
            <p className="text-gray-500 text-sm mt-1 line-clamp-2">
              {item.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-3">
            {/* Category pill */}
            {item.category && (
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                style={{ backgroundColor: `${primaryColor}22`, color: primaryColor }}
              >
                {item.category}
              </span>
            )}

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <>
                {item.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 whitespace-nowrap"
                  >
                    {tag}
                  </span>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  ))}
</div>


        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-search text-gray-400 text-xl"></i>
            </div>
            <p className="text-gray-600 text-lg">No hay items en esta categoría.</p>
          </div>
        )}
      </main>

      <footer className="bg-white/90 backdrop-blur border-t border-gray-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm flex items-center justify-center">
            Powered by <i className="fas fa-cloud text-gray-300 mx-1"></i>{' '}
            <span className="font-semibold text-gray-500">LatinNexo 2026</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicMenu;
