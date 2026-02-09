import React, { useMemo } from "react";

const formatPrice = (price) => {
  if (price === null || price === undefined) return "";
  if (typeof price === "number") return price.toFixed(2);
  return String(price);
};

const PublicMenuCafeTypewriter = ({ data }) => {
  const theme = data?.theme || {};
  const primaryColor = theme.primaryColor || "#c8a46a"; // café/dorado suave
  const restaurantName = data?.restaurantName || "Menú";
  const menuItems = Array.isArray(data?.menuItems) ? data.menuItems : [];

  const bgStyle =
    theme.backgroundType === "image" && theme.backgroundValue
      ? {
          backgroundImage: `url(${theme.backgroundValue})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }
      : { backgroundColor: theme.backgroundValue || "#0f0f0f" };

  // Agrupar por categoría
  const grouped = useMemo(() => {
    const map = new Map();
    for (const item of menuItems) {
      const cat = item?.category || "Otros";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(item);
    }
    return Array.from(map.entries()); // [ [category, items], ... ]
  }, [menuItems]);

  return (
    <div className="min-h-screen" style={bgStyle}>
      {/* overlay para legibilidad */}
      <div className="min-h-screen bg-black/55">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-black/60 backdrop-blur border-b border-white/10">
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
                <i className="fas fa-mug-hot text-xl" style={{ color: primaryColor }} />
              </div>
            )}

            <div className="text-center">
              <h1 className="text-xl md:text-2xl font-bold tracking-[0.12em] text-white uppercase font-mono">
                {restaurantName}
              </h1>
              <p className="mt-1 text-[11px] text-white/70 font-mono">
                café bohemio · letras · charlas largas
              </p>

              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="h-px w-10 bg-white/15" />
                <span
                  className="text-[10px] font-mono uppercase tracking-[0.22em]"
                  style={{ color: primaryColor }}
                >
                  menú
                </span>
                <span className="h-px w-10 bg-white/15" />
              </div>
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

          {/* “Papel” */}
          <div className="rounded-2xl border border-white/10 bg-[#111]/70 backdrop-blur p-5 sm:p-7">
            {/* efecto papel + grano sutil */}
            <div
              className="rounded-xl border border-white/10 p-5 sm:p-7"
              style={{
                background:
                  "radial-gradient(circle at 20% 10%, rgba(255,255,255,0.06), transparent 50%)," +
                  "radial-gradient(circle at 80% 30%, rgba(255,255,255,0.05), transparent 55%)," +
                  "linear-gradient(to bottom, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
              }}
            >
              {grouped.map(([category, items], idx) => (
                <section key={category} className={idx === 0 ? "" : "mt-10"}>
                  {/* título categoría */}
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className="inline-block h-2 w-2 rounded-sm"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <h2 className="text-white font-mono font-bold uppercase tracking-[0.18em] text-sm sm:text-base">
                      {category}
                    </h2>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  {/* items */}
                  <div className="space-y-5">
                    {items.map((item) => {
                      const price = formatPrice(item.price);

                      return (
                        <div key={item._id} className={!item.available ? "opacity-50" : ""}>
                          {/* fila nombre .... precio */}
                        {/* Mobile: full readable */}
<div className="sm:hidden font-mono">
  <div className="flex items-start justify-between gap-3">
    <h3 className="text-white text-[14px] font-bold whitespace-normal break-words flex-1 min-w-0">
      {item.name}
    </h3>

    <span
      className="text-[14px] font-bold whitespace-nowrap shrink-0"
      style={{ color: price ? primaryColor : "rgba(255,255,255,.6)" }}
    >
      {price ? `$${price}` : ""}
    </span>
  </div>
</div>

{/* Desktop: mantiene dots */}
<div className="hidden sm:flex items-baseline gap-3 font-mono">
  <div className="min-w-0">
    <h3 className="text-white text-[15px] font-bold truncate">
      {item.name}
    </h3>
  </div>

  <div className="flex-1 border-b border-dotted border-white/20 translate-y-[-2px]" />

  <div className="flex-shrink-0">
    <span
      className="text-white text-[15px] font-bold"
      style={{ color: price ? primaryColor : "rgba(255,255,255,.6)" }}
    >
      {price ? `$${price}` : ""}
    </span>
  </div>
</div>


                          {/* descripción */}
                          {item.description && (
                            <p className="mt-1 text-sm text-white/70 leading-snug font-mono">
                              {item.description}
                            </p>
                          )}

                          {/* tags (opcional) */}
                          {item.tags?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {item.tags.slice(0, 4).map((t, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] px-2 py-0.5 rounded-full border border-white/15 bg-white/5 text-white/75 font-mono"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}

                          {!item.available && (
                            <p className="mt-2 text-xs font-bold text-red-300 font-mono">
                              no disponible
                            </p>
                          )}

                          {/* separador "máquina" */}
                          <div className="mt-4 text-white/15 font-mono text-[11px] tracking-[0.1em]">
                            {"-".repeat(44)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}

              {menuItems.length === 0 && (
                <p className="text-center text-white/70 py-10 font-mono">
                  No hay items cargados en este menú.
                </p>
              )}

              <footer className="mt-10 text-center text-white/45 text-xs font-mono">
                Powered by <span className="text-white/60 font-bold">LatinNexo 2026</span>
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PublicMenuCafeTypewriter;
