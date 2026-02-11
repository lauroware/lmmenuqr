import React, { useEffect, useMemo, useRef, useState } from 'react';

const money = (n) => {
  const num = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(num)) return "0.00";
  return num.toFixed(2);
};

const PublicMenuAccordion = ({ data, mode = "salon" }) => {
  const isDelivery = mode === "delivery";

  const theme = data?.theme || {};
  const primaryColor = theme.primaryColor || '#2563eb';

  const [openCategory, setOpenCategory] = useState(null);

  // Delivery: carrito + dirección + pago
  const [cart, setCart] = useState([]);
  const [deliveryType, setDeliveryType] = useState("delivery"); // 🆕 "delivery" | "pickup"
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [anotacion, setAnotacion] = useState("");
  const [orderName, setOrderName] = useState("");
  const [cartOpen, setCartOpen] = useState(false);

  // Padding dinámico para que el FAB no tape el contenido
  const fabRef = useRef(null);
  const [bottomPad, setBottomPad] = useState(0);

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
  // Carrito: helpers
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

    // ✅ UX: abrimos el carrito al agregar (sin depender de cart.length viejo)
    if (!cartOpen) setCartOpen(true);
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

  const clearCart = () => {
    setCart([]);
  };

  const itemsCount = useMemo(() => cart.reduce((s, x) => s + (x.qty || 0), 0), [cart]);

  const total = useMemo(() => {
    return cart.reduce((sum, x) => {
      const p = typeof x.price === "number" ? x.price : Number(x.price);
      return sum + (Number.isFinite(p) ? p : 0) * (x.qty || 0);
    }, 0);
  }, [cart]);

  // ---------------------------
  // ✅ Si elige retiro, limpiamos dirección
  // ---------------------------
  useEffect(() => {
    if (!isDelivery) return;
    if (deliveryType === "pickup") setAddress("");
  }, [isDelivery, deliveryType]);

  // ---------------------------
  // ✅ Padding inferior dinámico para FAB
  // ---------------------------
  useEffect(() => {
    if (!isDelivery) return;

    const update = () => {
      const h = fabRef.current?.offsetHeight || 0;
      setBottomPad(h + 16);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [isDelivery, itemsCount, total]);

  // Bloquear scroll del fondo cuando el sheet está abierto
  useEffect(() => {
    if (!isDelivery) return;
    if (!cartOpen) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [isDelivery, cartOpen]);

  // ---------------------------
  // ✅ Armado del texto + WhatsApp
  // ---------------------------
  const buildWhatsAppText = () => {
    const lines = cart.map((x) => {
      const p = typeof x.price === "number" ? x.price : Number(x.price);
      const price = Number.isFinite(p) ? p : 0;
      const sub = price * (x.qty || 0);
      return `• ${x.qty} x ${x.name} — $${money(price)} (sub: $${money(sub)})`;
    });

    const name = orderName.trim() || "Cliente sin nombre";
    const pay = paymentMethod.trim() || "No especificada";
    const anot = anotacion.trim() || "Sin anotaciones";

    const isPickup = deliveryType === "pickup";
    const addr = address.trim();

    const entregaLine = isPickup
      ? `*Entrega:* Retira en el local\n`
      : `*Entrega:* Envío a domicilio\n*Dirección:* ${addr}\n`;

    return (
      `*Pedido*\n` +
      `*Nombre:* ${name}\n` +
      `*Comercio:* ${restaurantName}\n\n` +
      entregaLine +
      `\n*Detalle:*\n${lines.join("\n")}\n\n` +
      `*TOTAL:* $${money(total)}\n` +
      `*Forma de pago:* ${pay}\n` +
      `*Anotaciones:* ${anot}\n\n` +
      `Verificá los datos de tu pedido.\n` +
      `_Enviado desde el menú digital_`
    );
  };

  const sendToWhatsApp = () => {
    if (!cart.length) return;

    const isPickup = deliveryType === "pickup";
    if (!isPickup && !address.trim()) return; // ✅ solo exige dirección si es envío

    const comercioWhatsApp = String(data?.whatsapp || data?.phone || "").replace(/\D/g, "");
if (!comercioWhatsApp) return;

    const text = buildWhatsAppText();
    window.open(
      `https://wa.me/${comercioWhatsApp}?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  // ✅ Links del comercio (solo delivery)
const adminAddress = (data?.address || "").trim();

const mapsUrl = adminAddress
  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(adminAddress)}`
  : null;

const igUser = String(data?.instagram || "").trim().replace(/^@/, "");
const igUrl = igUser
  ? `https://instagram.com/${encodeURIComponent(igUser)}`
  : null;


  const canSend =
    cart.length > 0 && (deliveryType === "pickup" || address.trim().length > 0);

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

      <main
        className="max-w-5xl mx-auto px-4 py-8 space-y-6"
        style={{ paddingBottom: isDelivery ? `${bottomPad}px` : undefined }}
      >
        {/* PORTADA (solo salón) */}
{!isDelivery && theme.coverUrl && (
  <img
    src={theme.coverUrl}
    alt="Portada"
    className="w-full h-44 sm:h-56 object-cover rounded-2xl shadow-sm border border-white/60"
  />
)}


{/* Links del comercio (solo delivery) */}
{isDelivery && (mapsUrl || igUrl) && (
  <div className="bg-white/95 backdrop-blur rounded-2xl border border-gray-100 shadow-sm p-4">
    <div className="flex flex-wrap gap-2">
      {mapsUrl && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="px-3 py-2 rounded-lg border text-sm font-semibold"
          style={{ borderColor: primaryColor, color: primaryColor }}
        >
          📍 Cómo llegar
        </a>
      )}

      {igUrl && (
        <a
          href={igUrl}
          target="_blank"
          rel="noreferrer"
          className="px-3 py-2 rounded-lg border text-sm font-semibold"
          style={{ borderColor: primaryColor, color: primaryColor }}
        >
          📷 Instagram @{igUser}
        </a>
      )}
    </div>

    {!mapsUrl && (
      <p className="text-xs text-gray-500 mt-2">
        El comercio todavía no cargó la dirección.
      </p>
    )}
  </div>
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
                    className={`fas fa-chevron-down transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    style={{ color: primaryColor }}
                  />
                </button>

                {/* ITEMS */}
                {isOpen && (
                  <div className="px-5 pb-4 space-y-3">
                    {items.map(item => (
                      <div
                        key={item._id}
                        className={`flex items-start justify-between gap-3 border-t pt-3 ${!item.available ? 'opacity-45' : ''}`}
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
                          <span className="font-bold whitespace-nowrap" style={{ color: primaryColor }}>
                            ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
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

      {/* ✅ FAB: botón flotante para abrir carrito (solo delivery) */}
      {isDelivery && (
        <div
          ref={fabRef}
          className="fixed left-0 right-0 bottom-0 z-20"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="max-w-5xl mx-auto px-4 pb-4">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="w-full rounded-2xl shadow-lg border bg-white/95 backdrop-blur px-4 py-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${primaryColor}22` }}
                >
                  <i className="fas fa-shopping-cart" style={{ color: primaryColor }} />
                </div>

                <div className="min-w-0 text-left">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {itemsCount > 0 ? `${itemsCount} item${itemsCount !== 1 ? 's' : ''} en el carrito` : "Carrito vacío"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    Tocá para ver y confirmar
                  </p>
                </div>
              </div>

              <span className="font-bold whitespace-nowrap" style={{ color: primaryColor }}>
                ${money(total)}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ✅ Sheet del carrito (colapsable) */}
      {isDelivery && cartOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-30 bg-black/40"
            onClick={() => setCartOpen(false)}
          />

          {/* Panel */}
          <div
            className="fixed left-0 right-0 bottom-0 z-40"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="max-w-5xl mx-auto px-4 pb-4">
              <div className="bg-white/95 backdrop-blur rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
                {/* Header sheet */}
                <div className="p-4 flex items-center justify-between border-b">
                  <div>
                    <h3 className="font-bold text-gray-900">Tu pedido</h3>
                    <p className="text-xs text-gray-500">
                      Total: <span className="font-semibold" style={{ color: primaryColor }}>${money(total)}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {cart.length > 0 && (
                      <button
                        className="px-3 py-2 rounded-lg border text-sm font-semibold"
                        onClick={clearCart}
                      >
                        Vaciar
                      </button>
                    )}
                    <button
                      className="px-3 py-2 rounded-lg border text-sm font-semibold"
                      onClick={() => setCartOpen(false)}
                    >
                      Cerrar
                    </button>
                  </div>
                </div>

                {/* Body sheet */}
                <div className="p-4">
                  {cart.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Agregá productos desde el menú.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-auto pr-1">
                      {cart.map(x => (
                        <div key={x._id} className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{x.name}</p>
                            <p className="text-xs text-gray-500">
                              ${money(x.price)} c/u
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button className="px-2 py-1 border rounded" onClick={() => decQty(x._id)}>-</button>
                            <span className="text-sm font-semibold w-6 text-center">{x.qty}</span>
                            <button className="px-2 py-1 border rounded" onClick={() => incQty(x._id)}>+</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex flex-col gap-2">
                    <input
                      value={orderName}
                      onChange={(e) => setOrderName(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      placeholder="Tu nombre"
                    />

                    {/* 🆕 Tipo de entrega */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryType("delivery")}
                        className="px-3 py-2 rounded-lg border text-sm font-semibold"
                        style={{
                          borderColor: deliveryType === "delivery" ? primaryColor : "#e5e7eb",
                          color: deliveryType === "delivery" ? primaryColor : "#111827",
                          backgroundColor: deliveryType === "delivery" ? `${primaryColor}12` : "white",
                        }}
                      >
                        Envío a domicilio
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeliveryType("pickup")}
                        className="px-3 py-2 rounded-lg border text-sm font-semibold"
                        style={{
                          borderColor: deliveryType === "pickup" ? primaryColor : "#e5e7eb",
                          color: deliveryType === "pickup" ? primaryColor : "#111827",
                          backgroundColor: deliveryType === "pickup" ? `${primaryColor}12` : "white",
                        }}
                      >
                        Retiro en el local
                      </button>
                    </div>

                    {/* Dirección solo si es envío */}
                    {deliveryType === "delivery" && (
                      <input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        placeholder="Dirección de entrega"
                      />
                    )}

                    <input
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      placeholder="Forma de pago"
                    />

                    <input
                      value={anotacion}
                      onChange={(e) => setAnotacion(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      placeholder="Aclaraciones de tu pedido"
                    />

                    <button
                      className="w-full px-4 py-2 rounded-lg font-semibold text-sm text-white disabled:opacity-50"
                      style={{ backgroundColor: primaryColor }}
                      disabled={!canSend}
                      onClick={sendToWhatsApp}
                    >
                      Enviar pedido por WhatsApp
                    </button>

                    <p className="text-[11px] text-gray-500">
                      * Se enviará un mensaje con el detalle del pedido.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PublicMenuAccordion;
