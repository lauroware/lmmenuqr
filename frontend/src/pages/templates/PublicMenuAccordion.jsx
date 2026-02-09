import React, { useMemo, useState } from 'react';
import { createDeliveryOrder } from '../../api'; // ✅ IMPORTANTE: desde templates -> ../../api

const PublicMenuAccordion = ({ data, mode = "salon" }) => {
  const isDelivery = mode === "delivery";

  const theme = data?.theme || {};
  const primaryColor = theme.primaryColor || '#2563eb';

  const [openCategory, setOpenCategory] = useState(null);

  // 🆕 Delivery: carrito + dirección
  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  // ---------------------------
  // 🆕 Funciones de carrito
  // ---------------------------
  const addToCart = (item) => {
    if (!item?.available) return;

    setCart(prev => {
      const found = prev.find(x => x._id === item._id);
      if (found) {
        return prev.map(x =>
          x._id === item._id ? { ...x, qty: (x.qty || 0) + 1 } : x
        );
      }
      return [
        ...prev,
        {
          _id: item._id,
          name: item.name,
          price: item.price,
          qty: 1
        }
      ];
    });
  };

  const decQty = (id) => {
    setCart(prev =>
      prev
        .map(x => (x._id === id ? { ...x, qty: (x.qty || 0) - 1 } : x))
        .filter(x => (x.qty || 0) > 0)
    );
  };

  const incQty = (id) => {
    setCart(prev =>
      prev.map(x => (x._id === id ? { ...x, qty: (x.qty || 0) + 1 } : x))
    );
  };

  const total = useMemo(() => {
    return cart.reduce((sum, x) => {
      const p = typeof x.price === "number" ? x.price : Number(x.price);
      return sum + (Number.isFinite(p) ? p : 0) * (x.qty || 0);
    }, 0);
  }, [cart]);

  // ---------------------------
  // ✅ Confirmar: genera PDF en backend + abre WhatsApp
  // ---------------------------
  const confirmOrder = async () => {
    if (submitting) return;
    if (!cart.length) return;
    if (!address.trim()) return;

    try {
      setSubmitting(true);

      // 📌 PONÉ ACÁ EL WHATSAPP DEL COMERCIO (formato internacional)
      const comercioWhatsApp = "5491162366175"; // <-- CAMBIAR

      // Payload al backend
      const payload = {
        uniqueId: data?.uniqueId, // el backend puede ignorarlo si no lo necesita
        restaurantName: restaurantName,
        address: address.trim(),
        items: cart.map(x => ({
          _id: x._id,
          name: x.name,
          price: x.price,
          qty: x.qty
        })),
        total: Number(total.toFixed(2)),
      };

      const result = await createDeliveryOrder(payload); // { orderId, pdfUrl }

      const pdfLink = `${window.location.origin}${result.pdfUrl}`;
      const msg =
        `Pedido DELIVERY #${result.orderId}\n` +
        `Dirección: ${address.trim()}\n` +
        `Total: $${Number(total).toFixed(2)}\n` +
        `PDF: ${pdfLink}`;

      window.open(
        `https://wa.me/${comercioWhatsApp}?text=${encodeURIComponent(msg)}`,
        "_blank"
      );

      // opcional: limpiar carrito
      // setCart([]);
      // setAddress("");
    } catch (e) {
      console.error(e);
      alert("No se pudo confirmar el pedido. Intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

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

      <main className={`max-w-5xl mx-auto px-4 py-8 space-y-6 ${isDelivery ? "pb-40" : ""}`}>
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

                        {/* DERECHA: PRECIO + AGREGAR (solo delivery) */}
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className="font-bold whitespace-nowrap"
                            style={{ color: primaryColor }}
                          >
                            $
                            {typeof item.price === 'number'
                              ? item.price.toFixed(2)
                              : item.price}
                          </span>

                          {isDelivery && (
                            <button
                              disabled={!item.available}
                              onClick={() => addToCart(item)}
                              className="px-3 py-1 rounded-lg text-xs font-semibold border"
                              style={{
                                borderColor: primaryColor,
                                color: primaryColor,
                                opacity: item.available ? 1 : 0.4
                              }}
                            >
                              Agregar
                            </button>
                          )}
                        </div>
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

      {/* 🆕 Barra/Panel fijo de carrito (solo delivery) */}
      {isDelivery && (
        <div className="fixed bottom-0 left-0 right-0 z-20">
          <div className="max-w-5xl mx-auto px-4 pb-4">
            <div className="bg-white/95 backdrop-blur rounded-2xl border border-gray-200 shadow-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Tu pedido</h3>
                <span className="font-bold" style={{ color: primaryColor }}>
                  Total: ${total.toFixed(2)}
                </span>
              </div>

              {cart.length === 0 ? (
                <p className="text-sm text-gray-500 mt-2">
                  Agregá productos para armar tu pedido.
                </p>
              ) : (
                <div className="mt-3 space-y-2 max-h-40 overflow-auto pr-1">
                  {cart.map(x => (
                    <div key={x._id} className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {x.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          ${typeof x.price === "number" ? x.price.toFixed(2) : Number(x.price).toFixed(2)} c/u
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          className="px-2 py-1 border rounded"
                          onClick={() => decQty(x._id)}
                        >
                          -
                        </button>
                        <span className="text-sm font-semibold w-6 text-center">
                          {x.qty}
                        </span>
                        <button
                          className="px-2 py-1 border rounded"
                          onClick={() => incQty(x._id)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Dirección de entrega"
                />

                <button
                  className="px-4 py-2 rounded-lg font-semibold text-sm text-white disabled:opacity-50"
                  style={{ backgroundColor: primaryColor }}
                  disabled={submitting || cart.length === 0 || !address.trim()}
                  onClick={confirmOrder}
                >
                  {submitting ? "Enviando..." : "Confirmar"}
                </button>
              </div>

              <p className="text-[11px] text-gray-500 mt-2">
                * Se genera un PDF y se envía el link por WhatsApp al comercio.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicMenuAccordion;
